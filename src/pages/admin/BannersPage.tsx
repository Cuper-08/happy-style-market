import { useState, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { AnimatedPage } from '@/components/admin/AnimatedPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  useUploadBannerImage,
  type Banner,
} from '@/hooks/admin/useAdminBanners';

interface BannerFormData {
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
}

const emptyForm: BannerFormData = {
  title: '',
  subtitle: '',
  image_url: '',
  button_text: '',
  button_link: '',
  is_active: true,
};

export default function BannersPage() {
  const { data: banners = [], isLoading } = useBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const uploadImage = useUploadBannerImage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerFormData>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const openNew = () => {
    setEditingBanner(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      button_text: banner.button_text || '',
      button_link: banner.button_link || '',
      is_active: banner.is_active,
    });
    setDialogOpen(true);
  };

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const url = await uploadImage.mutateAsync(files[0]);
      setForm(f => ({ ...f, image_url: url }));
    } finally {
      setUploading(false);
    }
  }, [uploadImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleSave = async () => {
    if (!form.title || !form.image_url) return;
    if (editingBanner) {
      await updateBanner.mutateAsync({
        id: editingBanner.id,
        title: form.title,
        subtitle: form.subtitle || null,
        image_url: form.image_url,
        button_text: form.button_text || null,
        button_link: form.button_link || null,
        is_active: form.is_active,
      });
    } else {
      await createBanner.mutateAsync({
        title: form.title,
        subtitle: form.subtitle || null,
        image_url: form.image_url,
        button_text: form.button_text || null,
        button_link: form.button_link || null,
        is_active: form.is_active,
        sort_order: banners.length,
      });
    }
    setDialogOpen(false);
  };

  const handleMove = async (banner: Banner, direction: 'up' | 'down') => {
    const idx = banners.findIndex(b => b.id === banner.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return;
    const other = banners[swapIdx];
    await Promise.all([
      updateBanner.mutateAsync({ id: banner.id, sort_order: other.sort_order }),
      updateBanner.mutateAsync({ id: other.id, sort_order: banner.sort_order }),
    ]);
  };

  const toggleActive = async (banner: Banner) => {
    await updateBanner.mutateAsync({ id: banner.id, is_active: !banner.is_active });
  };

  const isSaving = createBanner.isPending || updateBanner.isPending;

  return (
    <AdminLayout>
      <AnimatedPage>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Banners</h1>
              <p className="text-muted-foreground text-sm">Gerencie os banners do carrossel da home</p>
            </div>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" /> Novo Banner
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : banners.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">Nenhum banner cadastrado</h3>
                <p className="text-muted-foreground text-sm mt-1">Clique em "Novo Banner" para começar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {banners.map((banner, idx) => (
                <Card key={banner.id} className={cn(!banner.is_active && 'opacity-60')}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="h-20 w-36 rounded-lg object-cover shrink-0 border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{banner.title}</h3>
                        {!banner.is_active && <Badge variant="secondary">Inativo</Badge>}
                      </div>
                      {banner.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
                      )}
                      {banner.button_text && (
                        <p className="text-xs text-muted-foreground mt-1">
                          CTA: {banner.button_text} → {banner.button_link}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button type="button" variant="ghost" size="icon" disabled={idx === 0} onClick={() => handleMove(banner, 'up')}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" disabled={idx === banners.length - 1} onClick={() => handleMove(banner, 'down')}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Switch checked={banner.is_active} onCheckedChange={() => toggleActive(banner)} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(banner)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(banner.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Imagem *</Label>
                {form.image_url ? (
                  <div className="relative">
                    <img src={form.image_url} alt="Preview" className="w-full aspect-[3/1] object-cover rounded-lg border border-border" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                      isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                      uploading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                      {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Arraste ou clique para enviar</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Novos Tênis Esportivos" />
              </div>

              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Ex: Preços exclusivos" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Texto do botão</Label>
                  <Input value={form.button_text} onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))} placeholder="Ex: Ver Coleção" />
                </div>
                <div className="space-y-2">
                  <Label>Link do botão</Label>
                  <Input value={form.button_link} onChange={e => setForm(f => ({ ...f, button_link: e.target.value }))} placeholder="Ex: /produtos" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Banner ativo</Label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="button" onClick={handleSave} disabled={!form.title || !form.image_url || isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingBanner ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir banner?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (deleteId) await deleteBanner.mutateAsync(deleteId);
                  setDeleteId(null);
                }}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AnimatedPage>
    </AdminLayout>
  );
}

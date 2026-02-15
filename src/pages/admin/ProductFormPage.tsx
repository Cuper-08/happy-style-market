import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from './AdminLayout';
import { useAdminProducts, useAdminProduct } from '@/hooks/admin/useAdminProducts';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Plus, Trash2, Loader2, Save } from 'lucide-react';

const variantSchema = z.object({
  size: z.string().min(1, 'Tamanho é obrigatório'),
  stock: z.boolean().optional(),
});

const productSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  description: z.string().optional(),
  price_retail: z.number().positive('Preço de varejo deve ser maior que zero'),
  price: z.number().optional(),
  images: z.array(z.string()).optional(),
  variants: z.array(variantSchema).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('page');
  const returnUrl = returnPage ? `/admin/produtos?page=${returnPage}` : '/admin/produtos';
  const isEditing = !!id && id !== 'novo';

  const { data: existingProduct, isLoading: isLoadingProduct } = useAdminProduct(
    isEditing ? id : ''
  );
  const { createProduct, updateProduct, isCreating, isUpdating } = useAdminProducts();

  const [images, setImages] = useState<string[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      price_retail: 0,
      price: undefined,
      images: [],
      variants: [{ size: '', stock: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  useEffect(() => {
    if (existingProduct) {
      form.reset({
        title: existingProduct.title,
        slug: existingProduct.slug,
        description: existingProduct.description || '',
        price_retail: Number(existingProduct.price_retail) || 0,
        price: existingProduct.price ? Number(existingProduct.price) : undefined,
        variants:
          existingProduct.variants.length > 0
            ? existingProduct.variants.map((v) => ({
                size: v.size,
                stock: v.stock !== false,
              }))
            : [{ size: '', stock: true }],
      });
      setImages(existingProduct.images || []);
    }
  }, [existingProduct, form]);

  const watchTitle = form.watch('title');
  useEffect(() => {
    if (!isEditing && watchTitle) {
      const slug = watchTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      form.setValue('slug', slug);
    }
  }, [watchTitle, isEditing, form]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const onSubmit = (data: ProductFormData) => {
    const priceRetail = data.price_retail;
    const priceWholesale = data.price;

    const productData = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      price_retail: priceRetail,
      price_retail_display: formatPrice(priceRetail),
      price: priceWholesale || null,
      price_display: priceWholesale ? formatPrice(priceWholesale) : null,
      images,
    };

    const validVariants = (data.variants || [])
      .filter((v) => v.size && v.size.trim() !== '')
      .flatMap((v) => {
        const sizes = v.size.split(',').map(s => s.trim()).filter(Boolean);
        return sizes.map(size => ({
          size,
          stock: v.stock !== false,
        }));
      });

    if (isEditing) {
      updateProduct(
        { id, product: productData, variants: validVariants },
        { onSuccess: () => navigate(returnUrl) }
      );
    } else {
      createProduct(
        { product: productData, variants: validVariants },
        { onSuccess: () => navigate(returnUrl) }
      );
    }
  };

  if (isEditing && isLoadingProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="icon" onClick={() => navigate(returnUrl)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
              </h1>
            </div>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Produto</FormLabel>
                      <FormControl><Input placeholder="Ex: Tênis Nike Air Jordan" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl><Input placeholder="tenis-nike-air-jordan" {...field} /></FormControl>
                      <FormDescription>URL amigável do produto (gerada automaticamente)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl><Textarea placeholder="Descreva o produto..." rows={4} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price_retail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Varejo (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Atacado (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                        </FormControl>
                        <FormDescription>Opcional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Imagens</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <ImageUploader images={images} onChange={setImages} maxImages={36} />
                  <p className="text-xs text-muted-foreground">
                    💡 Para visualização 360°, suba fotos do produto em sequência de ângulos.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Variações (Tamanhos)</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ size: '', stock: true })}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-3 p-4 border rounded-lg">
                      <FormField control={form.control} name={`variants.${index}.size`} render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">Tamanho(s)</FormLabel>
                          <FormControl><Input placeholder="39, 40, 41..." {...field} /></FormControl>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormLabel className="text-xs mb-0">Em estoque</FormLabel>
                          <FormControl>
                            <Switch checked={field.value !== false} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )} />

                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    💡 Separe tamanhos com vírgula para criar múltiplas variações (ex: 39, 40, 41, 42)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}

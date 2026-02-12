import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

type BannerInput = Omit<Banner, 'id' | 'created_at'>;

export function useBanners() {
  return useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Banner[];
    },
  });
}

export function usePublicBanners() {
  return useQuery({
    queryKey: ['public-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Banner[];
    },
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (banner: BannerInput) => {
      const { data, error } = await supabase.from('banners').insert(banner).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      qc.invalidateQueries({ queryKey: ['public-banners'] });
      toast({ title: 'Banner criado com sucesso' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar banner', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Banner> & { id: string }) => {
      const { data, error } = await supabase.from('banners').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      qc.invalidateQueries({ queryKey: ['public-banners'] });
      toast({ title: 'Banner atualizado' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar banner', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      qc.invalidateQueries({ queryKey: ['public-banners'] });
      toast({ title: 'Banner excluído' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao excluir banner', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUploadBannerImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('banners').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('banners').getPublicUrl(fileName);
      return urlData.publicUrl;
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao enviar imagem', description: err.message, variant: 'destructive' });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brand } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface BrandFormData {
  name: string;
  slug: string;
  logo_url?: string;
}

export function useAdminBrands() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const brandsQuery = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Brand[];
    },
  });

  const createBrandMutation = useMutation({
    mutationFn: async (brand: BrandFormData) => {
      const { data, error } = await supabase
        .from('brands')
        .insert(brand)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast({
        title: 'Marca criada',
        description: 'A marca foi criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a marca.',
        variant: 'destructive',
      });
      console.error('Error creating brand:', error);
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, ...brand }: BrandFormData & { id: string }) => {
      const { error } = await supabase
        .from('brands')
        .update(brand)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast({
        title: 'Marca atualizada',
        description: 'A marca foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a marca.',
        variant: 'destructive',
      });
      console.error('Error updating brand:', error);
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast({
        title: 'Marca excluída',
        description: 'A marca foi excluída com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a marca. Verifique se não há produtos vinculados.',
        variant: 'destructive',
      });
      console.error('Error deleting brand:', error);
    },
  });

  return {
    brands: brandsQuery.data || [],
    isLoading: brandsQuery.isLoading,
    error: brandsQuery.error,
    createBrand: createBrandMutation.mutate,
    updateBrand: updateBrandMutation.mutate,
    deleteBrand: deleteBrandMutation.mutate,
    isCreating: createBrandMutation.isPending,
    isUpdating: updateBrandMutation.isPending,
    isDeleting: deleteBrandMutation.isPending,
  };
}

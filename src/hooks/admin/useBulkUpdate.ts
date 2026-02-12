import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductChange {
  id: string;
  changes: Record<string, any>;
}

export function useBulkUpdateProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (items: ProductChange[]) => {
      const batchSize = 10;
      let updated = 0;

      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const promises = batch.map(({ id, changes }) =>
          supabase.from('products').update(changes).eq('id', id)
        );
        const results = await Promise.all(promises);
        for (const r of results) {
          if (r.error) throw r.error;
          updated++;
        }
      }

      return updated;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'Atualização concluída',
        description: `${count} produto(s) atualizado(s) com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na atualização',
        description: 'Falha ao atualizar produtos em massa.',
        variant: 'destructive',
      });
      console.error('Bulk update error:', error);
    },
  });
}

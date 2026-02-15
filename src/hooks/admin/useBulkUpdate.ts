import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VariantChange {
  variant_id?: string;
  changes: Record<string, any>;
}

export interface ProductChange {
  id: string;
  changes: Record<string, any>;
  variantChanges?: VariantChange[];
  newVariants?: { size: string; stock?: boolean }[];
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
        const promises: Promise<any>[] = [];

        for (const { id, changes, variantChanges, newVariants } of batch) {
          if (Object.keys(changes).length > 0) {
            promises.push(
              supabase.from('products').update(changes).eq('id', id).then(r => {
                if (r.error) throw r.error;
              }) as Promise<any>
            );
          }

          if (variantChanges) {
            for (const vc of variantChanges) {
              if (vc.variant_id) {
                promises.push(
                  supabase.from('product_variants').update(vc.changes).eq('id', vc.variant_id).then(r => {
                    if (r.error) throw r.error;
                  }) as Promise<any>
                );
              }
            }
          }

          if (newVariants && newVariants.length > 0) {
            const inserts = newVariants.map(v => ({
              product_id: id,
              size: v.size,
              stock: v.stock !== false,
            }));
            promises.push(
              supabase.from('product_variants').insert(inserts).then(r => {
                if (r.error) throw r.error;
              }) as Promise<any>
            );
          }

          updated++;
        }

        await Promise.all(promises);
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

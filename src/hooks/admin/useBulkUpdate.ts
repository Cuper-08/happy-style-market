import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VariantChange {
  variant_id?: string;
  changes: Record<string, unknown>;
}

export interface ProductChange {
  id: string;
  changes: Record<string, unknown>;
  variantChanges?: VariantChange[];
  newVariants?: { size: string; stock?: boolean }[];
}

export function useBulkUpdateProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (items: ProductChange[]) => {
      const batchSize = 10;
      let updatedCount = 0;

      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchPromises: PromiseLike<unknown>[] = [];

        for (const item of batch) {
          const { id, changes, variantChanges, newVariants } = item;

          // 1. Update Product
          if (Object.keys(changes).length > 0) {
            batchPromises.push(
              supabase.from('products').update(changes).eq('id', id).then((r) => {
                if (r.error) throw r.error;
              })
            );
          }

          // 2. Update Variants
          if (variantChanges) {
            for (const vc of variantChanges) {
              if (vc.variant_id) {
                batchPromises.push(
                  supabase.from('product_variants').update(vc.changes).eq('id', vc.variant_id).then((r) => {
                    if (r.error) throw r.error;
                  })
                );
              }
            }
          }

          // 3. New Variants
          if (newVariants && newVariants.length > 0) {
            const inserts = newVariants.map((v) => ({
              product_id: id,
              size: v.size,
              stock: v.stock !== false,
            }));
            batchPromises.push(
              supabase.from('product_variants').insert(inserts).then((r) => {
                if (r.error) throw r.error;
              })
            );
          }
          updatedCount++;
        }
        await Promise.all(batchPromises);
      }

      return updatedCount;
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

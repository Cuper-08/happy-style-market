import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ParsedProduct } from '@/components/admin/csvTemplate';

export function useBulkCreateProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (products: ParsedProduct[]) => {
      const productInserts = products.map(p => ({
        name: p.name,
        slug: p.slug,
        description: p.description || null,
        category_id: p.category_id || null,
        brand_id: p.brand_id || null,
        retail_price: p.retail_price,
        wholesale_price: p.wholesale_price || null,
        wholesale_min_qty: p.wholesale_min_qty || 6,
        featured: p.featured,
        is_new: p.is_new,
        is_active: p.is_active,
        images: [],
      }));

      const { data: inserted, error } = await supabase
        .from('products')
        .insert(productInserts)
        .select('id, slug');

      if (error) throw error;
      if (!inserted) throw new Error('No products returned');

      // Map slug → id for variant insertion
      const slugToId = new Map(inserted.map(p => [p.slug, p.id]));

      const allVariants = products.flatMap(p => {
        const productId = slugToId.get(p.slug);
        if (!productId || p.variants.length === 0) return [];
        return p.variants.map(v => ({
          product_id: productId,
          size: v.size,
          color: v.color || null,
          color_hex: v.color_hex || null,
          stock_quantity: v.stock_quantity,
          sku: v.sku?.trim() || null,
        }));
      });

      if (allVariants.length > 0) {
        const { error: varError } = await supabase
          .from('product_variants')
          .insert(allVariants);
        if (varError) throw varError;
      }

      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro na importação',
        description: 'Falha ao importar lote de produtos.',
        variant: 'destructive',
      });
      console.error('Bulk import error:', error);
    },
  });
}

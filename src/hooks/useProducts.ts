import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, Brand } from '@/types';

export function useProducts(options?: {
  searchQuery?: string;
  category?: string;
  limit?: number;
  orderBy?: { column: string; ascending: boolean };
}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      const orderCol = options?.orderBy?.column ?? 'created_at';
      const orderAsc = options?.orderBy?.ascending ?? false;

      let query = supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .order(orderCol, { ascending: orderAsc, nullsFirst: false })
        .range(0, 4999);

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map(p => ({
        ...p,
        images: p.images ?? [],
      })) as Product[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        images: data.images ?? [],
      } as Product;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Brand[];
    },
  });
}

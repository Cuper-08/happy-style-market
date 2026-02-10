import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, Brand } from '@/types';

export function useProducts(options?: {
  categorySlug?: string;
  brandSlug?: string;
  featured?: boolean;
  isNew?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          variants:product_variants(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(0, 4999);

      if (options?.featured) {
        query = query.eq('featured', true);
      }

      if (options?.isNew) {
        query = query.eq('is_new', true);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by category/brand slug if provided
      let products = data as Product[];
      
      if (options?.categorySlug) {
        products = products.filter(p => p.category?.slug === options.categorySlug);
      }
      
      if (options?.brandSlug) {
        products = products.filter(p => p.brand?.slug === options.brandSlug);
      }

      return products;
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
          category:categories(*),
          brand:brands(*),
          variants:product_variants(*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as Product | null;
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

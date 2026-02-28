import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, Brand } from '@/types';

async function getCategoryNamesWithChildren(categoryName: string): Promise<string[]> {
  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name, parent_id');

  if (!allCategories) return [categoryName];

  const target = allCategories.find(c => c.name === categoryName);
  if (!target) return [categoryName];

  const names = new Set<string>([categoryName]);

  // Collect children (and grandchildren) recursively up to 3 levels
  const collectChildren = (parentId: string) => {
    for (const cat of allCategories) {
      if (cat.parent_id === parentId) {
        names.add(cat.name);
        collectChildren(cat.id);
      }
    }
  };

  collectChildren(target.id);
  return Array.from(names);
}

export function useProducts(options?: {
  searchQuery?: string;
  category?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .order('created_at', { ascending: false })
        .range(0, 4999);

      if (options?.category) {
        const categoryNames = await getCategoryNamesWithChildren(options.category);
        query = query.in('category', categoryNames);
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];

type ProductWithVariants = ProductRow & {
  variants: ProductVariantRow[];
};

interface ProductFormData {
  title: string;
  slug: string;
  description?: string;
  price?: number | null;
  price_display?: string | null;
  price_retail?: number | null;
  price_retail_display?: string | null;
  images?: string[];
}

interface VariantFormData {
  size: string;
  stock?: boolean;
}

export function useAdminProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProductWithVariants[];
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async ({ product, variants }: { product: ProductFormData; variants?: VariantFormData[] }) => {
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (productError) throw productError;

      if (variants && variants.length > 0) {
        const variantsWithProductId = variants.map(v => ({
          ...v,
          product_id: newProduct.id,
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsWithProductId);

        if (variantsError) throw variantsError;
      }

      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Produto criado', description: 'O produto foi criado com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: 'Não foi possível criar o produto.', variant: 'destructive' });
      console.error('Error creating product:', error);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product, variants }: { id: string; product: Partial<ProductFormData>; variants?: VariantFormData[] }) => {
      const { error: productError } = await supabase
        .from('products')
        .update(product)
        .eq('id', id);

      if (productError) throw productError;

      if (variants) {
        await supabase.from('product_variants').delete().eq('product_id', id);

        if (variants.length > 0) {
          const variantsWithProductId = variants.map(v => ({
            ...v,
            product_id: id,
          }));

          const { error: variantsError } = await supabase
            .from('product_variants')
            .insert(variantsWithProductId);

          if (variantsError) throw variantsError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Produto atualizado', description: 'O produto foi atualizado com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o produto.', variant: 'destructive' });
      console.error('Error updating product:', error);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Produto excluído', description: 'O produto foi excluído com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: 'Não foi possível excluir o produto.', variant: 'destructive' });
      console.error('Error deleting product:', error);
    },
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
  };
}

export function useAdminProduct(productId: string) {
  return useQuery({
    queryKey: ['admin-product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data as ProductWithVariants;
    },
    enabled: !!productId,
  });
}

export function useUploadProductImage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    onError: (error) => {
      toast({ title: 'Erro no upload', description: 'Não foi possível fazer upload da imagem.', variant: 'destructive' });
      console.error('Error uploading image:', error);
    },
  });
}

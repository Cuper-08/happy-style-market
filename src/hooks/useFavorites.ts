import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(f => f.product_id);
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({ title: 'Adicionado aos favoritos!' });
    },
    onError: () => {
      toast({ title: 'Erro ao adicionar favorito', variant: 'destructive' });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({ title: 'Removido dos favoritos' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover favorito', variant: 'destructive' });
    },
  });

  const toggleFavorite = (productId: string) => {
    if (!user) {
      toast({ 
        title: 'Faça login', 
        description: 'Você precisa estar logado para favoritar produtos' 
      });
      return;
    }

    if (favorites.includes(productId)) {
      removeFavorite.mutate(productId);
    } else {
      addFavorite.mutate(productId);
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    isUpdating: addFavorite.isPending || removeFavorite.isPending,
  };
}

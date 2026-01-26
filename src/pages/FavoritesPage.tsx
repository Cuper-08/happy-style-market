import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ArrowLeft } from 'lucide-react';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();

  const isLoading = authLoading || favoritesLoading || productsLoading;

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate('/login');
    return null;
  }

  const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

  return (
    <Layout>
      <div className="container py-4">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-2xl font-bold mb-6">Meus Favoritos</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground mb-6">
              Adicione produtos aos seus favoritos para encontrá-los facilmente depois.
            </p>
            <Button asChild>
              <Link to="/produtos">Ver Produtos</Link>
            </Button>
          </div>
        ) : (
          <ProductGrid products={favoriteProducts} columns={4} />
        )}
      </div>
    </Layout>
  );
}

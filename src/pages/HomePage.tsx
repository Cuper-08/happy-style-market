import { Layout } from '@/components/layout';
import { HeroBanner, CategoryGrid, ProductSection } from '@/components/home';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { data: featuredProducts = [], isLoading: loadingFeatured } = useProducts({ featured: true, limit: 8 });
  const { data: newProducts = [], isLoading: loadingNew } = useProducts({ isNew: true, limit: 8 });
  const { data: allProducts = [], isLoading: loadingAll } = useProducts({ limit: 8 });
  const { data: categories = [], isLoading: loadingCategories } = useCategories();

  return (
    <Layout>
      <div className="container py-4 space-y-8">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Categories */}
        <section>
          <h2 className="text-xl font-bold mb-4">Categorias</h2>
          {loadingCategories ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <CategoryGrid categories={categories} />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <CategoryGrid categories={[
                { id: '1', name: 'Tênis', slug: 'tenis' },
                { id: '2', name: 'Roupas', slug: 'roupas' },
                { id: '3', name: 'Acessórios', slug: 'acessorios' },
              ]} />
            </div>
          )}
        </section>

        {/* Featured Products */}
        {loadingFeatured ? (
          <section className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </section>
        ) : featuredProducts.length > 0 ? (
          <ProductSection
            title="Destaques"
            products={featuredProducts}
            viewAllLink="/produtos?featured=true"
          />
        ) : null}

        {/* New Arrivals */}
        {loadingNew ? (
          <section className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </section>
        ) : newProducts.length > 0 ? (
          <ProductSection
            title="Lançamentos"
            products={newProducts}
            viewAllLink="/produtos?new=true"
          />
        ) : null}

        {/* All Products */}
        {loadingAll ? (
          <section className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </section>
        ) : allProducts.length > 0 ? (
          <ProductSection
            title="Todos os Produtos"
            products={allProducts}
            viewAllLink="/produtos"
          />
        ) : (
          <section className="text-center py-12 bg-card rounded-lg">
            <h2 className="text-xl font-bold mb-2">Bem-vindo à Brás Conceito!</h2>
            <p className="text-muted-foreground mb-4">
              Em breve novos produtos estarão disponíveis.
            </p>
          </section>
        )}

        {/* Wholesale Info */}
        <section className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg p-6 text-center space-y-2">
          <h2 className="text-xl font-bold">Preços Especiais de Atacado</h2>
          <p className="text-muted-foreground">
            Compre a partir de 6 unidades do mesmo produto e ganhe desconto automático!
          </p>
        </section>
      </div>
    </Layout>
  );
}

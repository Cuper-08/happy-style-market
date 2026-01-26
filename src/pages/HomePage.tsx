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
      <div className="container py-6 md:py-10 space-y-10 md:space-y-14">
        {/* Hero Banner */}
        <HeroBanner className="animate-fade-in" />

        {/* Categories */}
        <section className="space-y-5 opacity-0 animate-fade-in-up delay-100" style={{ animationFillMode: 'forwards' }}>
          <h2 className="text-xl md:text-2xl font-bold">Categorias</h2>
          {loadingCategories ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <CategoryGrid categories={categories} />
          ) : (
            <CategoryGrid categories={[
              { id: '1', name: 'Tênis', slug: 'tenis' },
              { id: '2', name: 'Roupas', slug: 'roupas' },
              { id: '3', name: 'Acessórios', slug: 'acessorios' },
            ]} />
          )}
        </section>

        {/* Featured Products */}
        {loadingFeatured ? (
          <section className="space-y-5">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
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
          <section className="space-y-5">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
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
          <section className="space-y-5">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
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
          <section className="text-center py-16 bg-card rounded-2xl border border-border/50">
            <h2 className="text-xl font-bold mb-3">Bem-vindo à Brás Conceito!</h2>
            <p className="text-muted-foreground">
              Em breve novos produtos estarão disponíveis.
            </p>
          </section>
        )}

        {/* Wholesale Info */}
        <section className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl p-8 md:p-10 text-center space-y-3 border border-primary/20">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          
          <h2 className="text-xl md:text-2xl font-bold relative">Preços Especiais de Atacado</h2>
          <p className="text-muted-foreground relative max-w-lg mx-auto">
            Compre a partir de 6 unidades do mesmo produto e ganhe desconto automático!
          </p>
        </section>
      </div>
    </Layout>
  );
}

import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { HeroBanner, ProductSection } from '@/components/home';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { Tag } from 'lucide-react';

const DESIRED_CATEGORY_SLUGS = [
  'tenis', 'bone', 'meias', 'bolsas', 'cintos', 'malas', 'chinelo', 'importados', 'tenis-infantil',
];

export default function HomePage() {
  const { data: allProducts = [], isLoading: loadingAll } = useProducts({ limit: 12 });
  const { data: allCategories = [] } = useCategories();

  const categories = useMemo(() => {
    return DESIRED_CATEGORY_SLUGS
      .map(slug => allCategories.find(c => c.slug === slug))
      .filter(Boolean) as typeof allCategories;
  }, [allCategories]);

  return (
    <Layout>
      <div className="container py-6 md:py-10 space-y-10 md:space-y-14">
        <HeroBanner className="animate-fade-in" />

        {/* Product Type Chips */}
        {categories.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Produtos</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/categoria/${cat.slug}`}
                  className="flex-shrink-0 px-4 py-2 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

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
            title="Nossos Produtos"
            products={allProducts}
            viewAllLink="/categoria/tenis"
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
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          <Tag className="h-8 w-8 mx-auto text-primary relative" />
          <h2 className="text-xl md:text-2xl font-bold relative">Preços de Atacado a partir de 6 pares</h2>
          <p className="text-muted-foreground relative max-w-lg mx-auto">
            Adicione 6 ou mais itens ao carrinho e pague automaticamente o preço de atacado!
          </p>
        </section>
      </div>
    </Layout>
  );
}

import { useSearchParams, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { SlidersHorizontal, PackageOpen } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getAvailableBrands, extractBrandSlug } from '@/lib/productCategories';

type PriceRange = 'all' | 'under100' | '100to200' | 'over200';

interface FilterContentProps {
  priceRange: PriceRange;
  setPriceRange: (v: PriceRange) => void;
  selectedBrand: string;
  setSelectedBrand: (v: string) => void;
  brands: { slug: string; name: string }[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

function FilterContent({ priceRange, setPriceRange, selectedBrand, setSelectedBrand, brands, hasActiveFilters, clearFilters }: FilterContentProps) {
  return (
    <div className="space-y-6">
      {brands.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Marca / Linha</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={selectedBrand === 'all'} onCheckedChange={() => setSelectedBrand('all')} />
              <span className="text-sm">Todas as marcas</span>
            </label>
            {brands.map((b) => (
              <label key={b.slug} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={selectedBrand === b.slug} onCheckedChange={() => setSelectedBrand(b.slug)} />
                <span className="text-sm">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-3">Faixa de Preço</h3>
        <div className="space-y-2">
          {[
            { value: 'all' as const, label: 'Todos os preços' },
            { value: 'under100' as const, label: 'Até R$ 100' },
            { value: '100to200' as const, label: 'R$ 100 - R$ 200' },
            { value: 'over200' as const, label: 'Acima de R$ 200' },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={priceRange === option.value} onCheckedChange={() => setPriceRange(option.value)} />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState<PriceRange>('all');

  const brandParam = searchParams.get('marca') || 'all';
  const setSelectedBrand = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === 'all') params.delete('marca');
    else params.set('marca', slug);
    setSearchParams(params, { replace: true });
  };

  const { data: products = [], isLoading } = useProducts();
  const { data: allCategories = [] } = useCategories();
  const brands = useMemo(() => getAvailableBrands(products), [products]);

  // Determine if this is a non-tenis category (empty for now)
  const isTenisCategory = !categorySlug || categorySlug === 'tenis';
  const currentCategory = allCategories.find(c => c.slug === categorySlug);

  const searchQuery = searchParams.get('q');
  const title = searchQuery
    ? `Resultados para "${searchQuery}"`
    : currentCategory
      ? currentCategory.name
      : brandParam !== 'all'
        ? brands.find(b => b.slug === brandParam)?.name || 'Produtos'
        : 'Todos os Produtos';

  const filteredProducts = useMemo(() => {
    // Non-tenis categories have no products yet
    if (categorySlug && !isTenisCategory) return [];

    let result = products;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q));
    }

    if (brandParam !== 'all') {
      result = result.filter(p => extractBrandSlug(p.title) === brandParam);
    }

    if (priceRange !== 'all') {
      result = result.filter(p => {
        const price = p.price_retail || 0;
        switch (priceRange) {
          case 'under100': return price < 100;
          case '100to200': return price >= 100 && price <= 200;
          case 'over200': return price > 200;
          default: return true;
        }
      });
    }

    return result;
  }, [products, priceRange, searchQuery, brandParam, categorySlug, isTenisCategory]);

  const clearFilters = () => {
    setPriceRange('all');
    setSelectedBrand('all');
  };

  const hasActiveFilters = priceRange !== 'all' || brandParam !== 'all';

  // Empty state for non-tenis categories
  if (categorySlug && !isTenisCategory) {
    return (
      <Layout>
        <div className="container py-16 text-center space-y-4">
          <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">{currentCategory?.name || categorySlug}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Em breve teremos produtos nesta categoria. Fique ligado!
          </p>
          <Button variant="outline" asChild>
            <a href="/categoria/tenis">Ver Tênis</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        {/* Brand chips - horizontal scroll */}
        {brands.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            <button
              onClick={() => setSelectedBrand('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                brandParam === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border bg-card hover:bg-accent'
              }`}
            >
              Todos
            </button>
            {brands.map((b) => (
              <button
                key={b.slug}
                onClick={() => setSelectedBrand(b.slug)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                  brandParam === b.slug
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-card hover:bg-accent'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Carregando...' : `${filteredProducts.length} produtos`}
            </p>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtrar
                {hasActiveFilters && (
                  <span className="ml-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedBrand={brandParam}
                  setSelectedBrand={setSelectedBrand}
                  brands={brands}
                  hasActiveFilters={hasActiveFilters}
                  clearFilters={clearFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <h2 className="font-semibold mb-4">Filtros</h2>
              <FilterContent
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedBrand={brandParam}
                setSelectedBrand={setSelectedBrand}
                brands={brands}
                hasActiveFilters={hasActiveFilters}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : (
              <ProductGrid products={filteredProducts} columns={3} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

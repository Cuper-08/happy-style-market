import { useParams, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { useProducts, useCategories, useBrands } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { SlidersHorizontal } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Brand } from '@/types';

interface FilterContentProps {
  priceRange: 'all' | 'under100' | '100to200' | 'over200';
  setPriceRange: (value: 'all' | 'under100' | '100to200' | 'over200') => void;
  selectedBrands: string[];
  toggleBrand: (slug: string) => void;
  brands: Brand[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

function FilterContent({ priceRange, setPriceRange, selectedBrands, toggleBrand, brands, hasActiveFilters, clearFilters }: FilterContentProps) {
  return (
    <div className="space-y-6">
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
              <Checkbox
                checked={priceRange === option.value}
                onCheckedChange={() => setPriceRange(option.value)}
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Marcas</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedBrands.includes(brand.slug)}
                  onCheckedChange={() => toggleBrand(brand.slug)}
                />
                <span className="text-sm">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<'all' | 'under100' | '100to200' | 'over200'>('all');

  const { data: products = [], isLoading } = useProducts({ categorySlug });
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const category = categories.find(c => c.slug === categorySlug);
  const searchQuery = searchParams.get('q');
  const title = searchQuery
    ? `Resultados para "${searchQuery}"`
    : category?.name || 'Todos os Produtos';

  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    if (selectedBrands.length > 0) {
      result = result.filter(p => p.brand && selectedBrands.includes(p.brand.slug));
    }

    if (priceRange !== 'all') {
      result = result.filter(p => {
        const price = p.retail_price;
        switch (priceRange) {
          case 'under100': return price < 100;
          case '100to200': return price >= 100 && price <= 200;
          case 'over200': return price > 200;
          default: return true;
        }
      });
    }

    if (searchParams.get('featured') === 'true') {
      result = result.filter(p => p.featured);
    }
    if (searchParams.get('new') === 'true') {
      result = result.filter(p => p.is_new);
    }

    return result;
  }, [products, selectedBrands, priceRange, searchParams, searchQuery]);

  const toggleBrand = (slug: string) => {
    setSelectedBrands(prev =>
      prev.includes(slug) ? prev.filter(b => b !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange('all');
  };

  const hasActiveFilters = selectedBrands.length > 0 || priceRange !== 'all';

  return (
    <Layout>
      <div className="container py-4">
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
                  selectedBrands={selectedBrands}
                  toggleBrand={toggleBrand}
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
                selectedBrands={selectedBrands}
                toggleBrand={toggleBrand}
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

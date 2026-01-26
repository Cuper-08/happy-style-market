import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
  className?: string;
}

export function ProductSection({ title, products, viewAllLink, className }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: products.length > 4,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4" />
        <CarouselNext className="hidden md:flex -right-4" />
      </Carousel>
    </section>
  );
}

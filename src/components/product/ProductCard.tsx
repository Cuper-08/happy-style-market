import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  index?: number;
}

export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
  const { isFavorite, toggleFavorite, isUpdating } = useFavorites();
  const favorite = isFavorite(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const hasWholesale = product.price != null && product.price > 0 && 
    product.price_retail != null && product.price < product.price_retail;
  
  const hasAnyVariantInStock = product.variants?.some(v => v.stock !== false) ?? true;
  const isOutOfStock = product.variants && product.variants.length > 0 && !hasAnyVariantInStock;

  const animationDelay = Math.min(index * 75, 500);

  return (
    <div 
      className={cn(
        'group relative flex flex-col bg-white rounded-xl overflow-hidden',
        'border border-gray-100 shadow-sm',
        'hover:border-primary/30 hover:shadow-xl',
        'transition-all duration-500 hover:-translate-y-1',
        'opacity-0 animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Image */}
      <Link to={`/produto/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110",
            isOutOfStock && "opacity-50 grayscale"
          )}
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasWholesale && (
            <Badge variant="secondary" className="text-[10px] px-2.5 py-0.5 bg-gray-800 text-white">
              ATACADO
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="destructive" className="text-[10px] px-2.5 py-0.5">
              ESGOTADO
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-3 right-3 h-9 w-9 rounded-full',
            'bg-white/90 backdrop-blur-sm shadow-md',
            'hover:bg-white hover:scale-110',
            'transition-all duration-300',
            favorite && 'text-red-500'
          )}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          disabled={isUpdating}
        >
          <Heart className={cn('h-4 w-4 transition-transform duration-300', favorite && 'fill-current scale-110')} />
        </Button>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 md:p-5 bg-white">
        {/* Name */}
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-medium text-sm mt-1.5 line-clamp-2 text-gray-900 hover:text-primary transition-colors duration-300">
            {product.title}
          </h3>
        </Link>

        {/* Prices */}
        <div className="mt-auto pt-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-gray-900">
              {product.price_retail_display || (product.price_retail ? formatPrice(product.price_retail) : 'Consulte')}
            </span>
          </div>
          {hasWholesale && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-gray-500">Atacado:</span>
              <span className="text-sm font-bold text-primary">
                {product.price_display || formatPrice(product.price!)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

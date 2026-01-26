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

  const hasWholesale = product.wholesale_price && product.wholesale_price < product.retail_price;

  // Staggered animation delay based on index
  const animationDelay = Math.min(index * 75, 500);

  return (
    <div 
      className={cn(
        'group relative flex flex-col bg-card rounded-xl overflow-hidden border border-border/50',
        'hover:border-primary/30 hover:shadow-gold-sm',
        'transition-all duration-500 hover-lift',
        'opacity-0 animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Image */}
      <Link to={`/produto/${product.slug}`} className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new && (
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2.5 py-0.5 shimmer-badge">
              LANÇAMENTO
            </Badge>
          )}
          {hasWholesale && (
            <Badge variant="secondary" className="text-[10px] px-2.5 py-0.5 bg-secondary/90 backdrop-blur-sm">
              ATACADO
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-3 right-3 h-9 w-9 rounded-full',
            'bg-background/70 backdrop-blur-sm',
            'hover:bg-background hover:scale-110',
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
      <div className="flex flex-col flex-1 p-4 md:p-5">
        {/* Brand */}
        {product.brand && (
          <span className="text-[10px] font-medium text-primary/80 uppercase tracking-widest">
            {product.brand.name}
          </span>
        )}

        {/* Name */}
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-medium text-sm mt-1.5 line-clamp-2 hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        {/* Prices */}
        <div className="mt-auto pt-4 space-y-1.5">
          {hasWholesale && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground">Atacado:</span>
              <span className="text-sm font-bold text-primary">
                {formatPrice(product.wholesale_price!)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                (mín. {product.wholesale_min_qty} un.)
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {hasWholesale && <span className="text-[10px] text-muted-foreground">Varejo:</span>}
            <span className={cn(
              'font-bold',
              hasWholesale ? 'text-sm text-muted-foreground' : 'text-base text-foreground'
            )}>
              {formatPrice(product.retail_price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

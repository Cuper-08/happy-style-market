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
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { isFavorite, toggleFavorite, isUpdating } = useFavorites();
  const favorite = isFavorite(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const hasWholesale = product.wholesale_price && product.wholesale_price < product.retail_price;

  return (
    <div className={cn('group relative flex flex-col bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300', className)}>
      {/* Image */}
      <Link to={`/produto/${product.slug}`} className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_new && (
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2">
              LANÇAMENTO
            </Badge>
          )}
          {hasWholesale && (
            <Badge variant="secondary" className="text-[10px] px-2">
              ATACADO
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background',
            favorite && 'text-red-500'
          )}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          disabled={isUpdating}
        >
          <Heart className={cn('h-4 w-4', favorite && 'fill-current')} />
        </Button>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        {/* Brand */}
        {product.brand && (
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {product.brand.name}
          </span>
        )}

        {/* Name */}
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-medium text-sm mt-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Prices */}
        <div className="mt-auto pt-3 space-y-1">
          {hasWholesale && (
            <div className="flex items-center gap-2">
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

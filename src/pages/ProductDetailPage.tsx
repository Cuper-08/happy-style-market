import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductSection } from '@/components/home';
import { Heart, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ProductVariant } from '@/types';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: relatedProducts = [] } = useProducts({ 
    categorySlug: product?.category?.slug, 
    limit: 4 
  });
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button onClick={() => navigate('/produtos')}>Ver todos os produtos</Button>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const hasWholesale = product.wholesale_price && product.wholesale_price < product.retail_price;
  const isWholesaleQty = quantity >= product.wholesale_min_qty;
  const currentPrice = hasWholesale && isWholesaleQty ? product.wholesale_price! : product.retail_price;
  const totalPrice = currentPrice * quantity;

  // Group variants by color
  const colors = product.variants?.reduce((acc, variant) => {
    if (variant.color && !acc.find(v => v.color === variant.color)) {
      acc.push(variant);
    }
    return acc;
  }, [] as ProductVariant[]) || [];

  // Get sizes for selected color
  const sizes = product.variants?.filter(v => 
    !selectedVariant?.color || v.color === selectedVariant.color
  ).reduce((acc, variant) => {
    if (!acc.find(v => v.size === variant.size)) {
      acc.push(variant);
    }
    return acc;
  }, [] as ProductVariant[]) || [];

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast({
        title: 'Selecione uma opção',
        description: 'Por favor, selecione tamanho e cor antes de adicionar ao carrinho.',
        variant: 'destructive',
      });
      return;
    }

    addItem(product, selectedVariant || undefined, quantity);
    toast({
      title: 'Adicionado ao carrinho!',
      description: `${quantity}x ${product.name}`,
    });
  };

  const relatedFiltered = relatedProducts.filter(p => p.id !== product.id);

  return (
    <Layout>
      <div className="container py-4 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-card">
              <img
                src={product.images[selectedImageIndex] || '/placeholder.svg'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                      index === selectedImageIndex ? 'border-primary' : 'border-transparent'
                    )}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Brand & Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.brand && (
                <span className="text-sm text-muted-foreground uppercase tracking-wider">
                  {product.brand.name}
                </span>
              )}
              {product.is_new && (
                <Badge className="bg-primary text-primary-foreground">LANÇAMENTO</Badge>
              )}
              {hasWholesale && (
                <Badge variant="secondary">ATACADO</Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

            {/* Prices */}
            <div className="space-y-2">
              {hasWholesale && (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(product.wholesale_price!)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    no atacado (mín. {product.wholesale_min_qty} un.)
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-3">
                <span className={cn(
                  'font-bold',
                  hasWholesale ? 'text-lg text-muted-foreground' : 'text-2xl'
                )}>
                  {formatPrice(product.retail_price)}
                </span>
                {hasWholesale && <span className="text-sm text-muted-foreground">no varejo</span>}
              </div>
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div>
                <span className="text-sm font-medium mb-2 block">
                  Cor: {selectedVariant?.color || 'Selecione'}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={cn(
                        'h-10 w-10 rounded-full border-2 transition-all relative',
                        selectedVariant?.color === variant.color 
                          ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' 
                          : 'border-border hover:border-foreground'
                      )}
                      style={{ backgroundColor: variant.color_hex || '#888' }}
                      title={variant.color || ''}
                    >
                      {selectedVariant?.color === variant.color && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div>
                <span className="text-sm font-medium mb-2 block">
                  Tamanho: {selectedVariant?.size || 'Selecione'}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock_quantity === 0}
                      className={cn(
                        'h-10 min-w-[2.5rem] px-3 rounded-lg border transition-all text-sm font-medium',
                        selectedVariant?.size === variant.size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-foreground',
                        variant.stock_quantity === 0 && 'opacity-50 cursor-not-allowed line-through'
                      )}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <span className="text-sm font-medium mb-2 block">Quantidade</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {hasWholesale && (
                  <span className={cn(
                    'text-sm',
                    isWholesaleQty ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}>
                    {isWholesaleQty 
                      ? '✓ Preço de atacado aplicado!' 
                      : `Adicione mais ${product.wholesale_min_qty - quantity} para preço de atacado`
                    }
                  </span>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="text-lg">
              Total: <span className="font-bold text-primary">{formatPrice(totalPrice)}</span>
            </div>

            {/* Actions - Desktop */}
            <div className="hidden md:flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => toggleFavorite(product.id)}
                className={cn(isFavorite(product.id) && 'text-red-500')}
              >
                <Heart className={cn('h-5 w-5', isFavorite(product.id) && 'fill-current')} />
              </Button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t border-border">
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedFiltered.length > 0 && (
          <ProductSection
            title="Produtos Relacionados"
            products={relatedFiltered}
            viewAllLink={`/categoria/${product.category?.slug}`}
          />
        )}
        
        {/* Spacer for mobile fixed button */}
        <div className="h-20 md:hidden" />
      </div>

      {/* Fixed Bottom Action Bar - Mobile Only */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border md:hidden z-40 animate-fade-in-up">
        <div className="flex gap-3">
          <Button 
            className="flex-1 h-12"
            onClick={handleAddToCart}
            disabled={product.variants && product.variants.length > 0 && !selectedVariant}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            {formatPrice(totalPrice)}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn('h-12 w-12', isFavorite(product.id) && 'text-red-500 border-red-500')}
            onClick={() => toggleFavorite(product.id)}
          >
            <Heart className={cn('h-5 w-5', isFavorite(product.id) && 'fill-current')} />
          </Button>
        </div>
      </div>
    </Layout>
  );
}

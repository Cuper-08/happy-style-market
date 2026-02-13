import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductSection } from '@/components/home';
import { Heart, Minus, Plus, ShoppingBag, Check, Tag } from 'lucide-react';
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

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Unique colors (must be before early returns - React hooks rule)
  const colors = useMemo(() => {
    const seen = new Set<string>();
    return (product?.variants || []).filter(v => {
      if (!v.color || seen.has(v.color)) return false;
      seen.add(v.color);
      return true;
    });
  }, [product?.variants]);

  const sizes = useMemo(() => {
    const filtered = (product?.variants || []).filter(v =>
      !selectedColor || v.color === selectedColor
    );
    const seen = new Set<string>();
    return filtered.filter(v => {
      if (seen.has(v.size)) return false;
      seen.add(v.size);
      return true;
    });
  }, [product?.variants, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!selectedColor && !selectedSize) return null;
    return (product?.variants || []).find(v =>
      (!selectedColor || v.color === selectedColor) &&
      (!selectedSize || v.size === selectedSize)
    ) || null;
  }, [product?.variants, selectedColor, selectedSize]);

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

  const hasWholesale = product.wholesale_price != null && product.wholesale_price > 0;
  const wholesaleMinQty = product.wholesale_min_qty || 6;
  const isWholesaleQty = quantity >= wholesaleMinQty;
  const currentPrice = hasWholesale && isWholesaleQty ? product.wholesale_price! : product.retail_price;
  const savingsPerUnit = hasWholesale ? product.retail_price - product.wholesale_price! : 0;
  const unitsNeeded = hasWholesale ? Math.max(0, wholesaleMinQty - quantity) : 0;
  const totalPrice = currentPrice * quantity;

  // Calculate total stock across all variants
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) ?? 0;
  const selectedStock = selectedVariant?.stock_quantity ?? totalStock;
  const isOutOfStock = product.variants && product.variants.length > 0 && totalStock === 0;

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast({
        title: 'Selecione uma opção',
        description: 'Por favor, selecione tamanho e cor antes de adicionar ao carrinho.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedVariant && (selectedVariant.stock_quantity || 0) < quantity) {
      toast({
        title: 'Estoque insuficiente',
        description: `Apenas ${selectedVariant.stock_quantity} unidades disponíveis.`,
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

            {/* Wholesale Banner */}
            {hasWholesale && (
              <div className="rounded-lg border-2 border-green-500/30 bg-green-50 dark:bg-green-950/40 p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-bold text-green-700 dark:text-green-300">
                    Desconto de Atacado!
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Compre a partir de <strong>{wholesaleMinQty} unidades</strong> por apenas{' '}
                  <strong>{formatPrice(product.wholesale_price!)}</strong> cada!
                </p>
                {savingsPerUnit > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Economize {formatPrice(savingsPerUnit)} por unidade
                  </p>
                )}
              </div>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
              <div>
                <span className="text-sm font-medium mb-2 block">
                  Cor: {selectedColor || 'Selecione'}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedColor(variant.color!);
                        setSelectedSize(null);
                      }}
                      className={cn(
                        'h-10 w-10 rounded-full border-2 transition-all relative',
                        selectedColor === variant.color 
                          ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' 
                          : 'border-border hover:border-foreground'
                      )}
                      style={{ backgroundColor: variant.color_hex || '#888' }}
                      title={variant.color || ''}
                    >
                      {selectedColor === variant.color && (
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
                  Tamanho: {selectedSize || 'Selecione'}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedSize(variant.size)}
                      disabled={variant.stock_quantity === 0}
                      className={cn(
                        'h-10 min-w-[2.5rem] px-3 rounded-lg border transition-all text-sm font-medium',
                        selectedSize === variant.size
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
                    onClick={() => setQuantity(Math.min(quantity + 1, selectedStock || 9999))}
                    disabled={selectedVariant ? quantity >= (selectedVariant.stock_quantity || 0) : false}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedVariant && (selectedVariant.stock_quantity || 0) <= 5 && (selectedVariant.stock_quantity || 0) > 0 && (
                  <span className="text-sm text-orange-500 font-medium">
                    Apenas {selectedVariant.stock_quantity} em estoque!
                  </span>
                )}
                {hasWholesale && (
                  <span className={cn(
                    'text-sm font-medium px-3 py-1 rounded-full',
                    isWholesaleQty 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                  )}>
                    {isWholesaleQty 
                      ? '✓ Preço de atacado aplicado!' 
                      : `Faltam ${unitsNeeded} un. para preço de atacado`
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
                disabled={isOutOfStock || (selectedVariant?.stock_quantity === 0)}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
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
            disabled={(product.variants && product.variants.length > 0 && !selectedVariant) || isOutOfStock || (selectedVariant?.stock_quantity === 0)}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            {isOutOfStock ? 'Esgotado' : formatPrice(totalPrice)}
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

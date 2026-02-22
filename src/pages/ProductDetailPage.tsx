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
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Tag, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductViewer360 } from '@/components/product/ProductViewer360';
import { toast } from '@/hooks/use-toast';
import { stripHtml } from '@/lib/sanitizeDescription';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: allProducts = [] } = useProducts({ limit: 8 });
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const sizes = useMemo(() => {
    const seen = new Set<string>();
    return (product?.variants || []).filter(v => {
      if (seen.has(v.size)) return false;
      seen.add(v.size);
      return true;
    });
  }, [product?.variants]);

  const selectedVariant = useMemo(() => {
    if (!selectedSize) return null;
    return (product?.variants || []).find(v => v.size === selectedSize) || null;
  }, [product?.variants, selectedSize]);

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

  const retailPrice = product.price_retail || 0;
  const hasWholesale = product.price != null && product.price > 0 && product.price < retailPrice;
  const currentPrice = retailPrice;
  const totalPrice = currentPrice * quantity;

  const hasAnyVariantInStock = product.variants?.some(v => v.stock !== false) ?? true;
  const isOutOfStock = product.variants && product.variants.length > 0 && !hasAnyVariantInStock;
  const selectedVariantOutOfStock = selectedVariant ? selectedVariant.stock === false : false;

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast({
        title: 'Selecione um tamanho',
        description: 'Por favor, selecione o tamanho antes de adicionar ao carrinho.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedVariantOutOfStock) {
      toast({
        title: 'Produto esgotado',
        description: 'Este tamanho está esgotado.',
        variant: 'destructive',
      });
      return;
    }

    addItem(product, selectedVariant || undefined, quantity);
    toast({
      title: 'Adicionado ao carrinho!',
      description: `${quantity}x ${product.title}`,
    });
  };

  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <Layout>
      <div className="container py-4 space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images - 360 Viewer */}
          <div className="space-y-4">
            <ProductViewer360
              images={product.images}
              alt={product.title}
              currentIndex={selectedImageIndex}
              onImageIndexChange={setSelectedImageIndex}
            />
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
            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>

            {/* Prices */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">
                  {product.price_retail_display || formatPrice(retailPrice)}
                </span>
              </div>
              {hasWholesale && (
                <div className="flex items-baseline gap-3">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-primary">
                    {product.price_display || formatPrice(product.price!)}
                  </span>
                  <span className="text-sm text-muted-foreground">no atacado</span>
                </div>
              )}
            </div>

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
                      disabled={variant.stock === false}
                      className={cn(
                        'h-10 min-w-[2.5rem] px-3 rounded-lg border transition-all text-sm font-medium',
                        selectedSize === variant.size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-foreground',
                        variant.stock === false && 'opacity-50 cursor-not-allowed line-through'
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
                disabled={isOutOfStock || selectedVariantOutOfStock}
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

            {/* Wholesale Info Banner */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Atacado: a partir de 6 pares</p>
                <p className="text-muted-foreground">Adicione 6 ou mais itens ao carrinho e pague automaticamente o preço de atacado.</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t border-border">
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground whitespace-pre-line">{stripHtml(product.description)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ProductSection
            title="Produtos Relacionados"
            products={relatedProducts}
            viewAllLink="/produtos"
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
            disabled={(product.variants && product.variants.length > 0 && !selectedVariant) || isOutOfStock || selectedVariantOutOfStock}
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

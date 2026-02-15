import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getItemPrice, subtotal, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-6">
            Adicione produtos ao carrinho para continuar suas compras.
          </p>
          <Button asChild>
            <Link to="/produtos">Ver Produtos</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        <h1 className="text-2xl font-bold mb-6">Carrinho de Compras</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = getItemPrice(item);

              return (
                <div
                  key={`${item.product.id}-${item.variant?.id}`}
                  className="flex gap-4 p-4 bg-card rounded-lg border border-border"
                >
                  {/* Image */}
                  <Link to={`/produto/${item.product.slug}`} className="flex-shrink-0">
                    <img
                      src={item.product.images?.[0] || '/placeholder.svg'}
                      alt={item.product.title}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/produto/${item.product.slug}`}>
                      <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
                        {item.product.title}
                      </h3>
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Tam: {item.variant.size}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold">
                        {formatPrice(price)}
                      </span>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.product.id, item.variant?.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold">{formatPrice(price * item.quantity)}</span>
                  </div>
                </div>
              );
            })}

            <Button variant="outline" onClick={clearCart} className="text-destructive">
              Limpar Carrinho
            </Button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 space-y-4 sticky top-20">
              <h2 className="text-lg font-bold">Resumo do Pedido</h2>

              <div className="flex gap-2">
                <Input placeholder="Cupom de desconto" className="bg-secondary" />
                <Button variant="outline">Aplicar</Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Calcular frete</label>
                <div className="flex gap-2">
                  <Input placeholder="CEP" className="bg-secondary" maxLength={9} />
                  <Button variant="outline">Calcular</Button>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-muted-foreground">A calcular</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full">
                <Link to="/checkout">
                  Finalizar Compra
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to="/produtos">Continuar Comprando</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, ChevronDown, ChevronUp } from 'lucide-react';

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
  paid: { label: 'Pago', className: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
  processing: { label: 'Em preparo', className: 'bg-orange-500/20 text-orange-700 border-orange-500/30' },
  shipped: { label: 'Enviado', className: 'bg-purple-500/20 text-purple-700 border-purple-500/30' },
  delivered: { label: 'Entregue', className: 'bg-green-500/20 text-green-700 border-green-500/30' },
  cancelled: { label: 'Cancelado', className: 'bg-red-500/20 text-red-700 border-red-500/30' },
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

interface OrderRow {
  id: string;
  status: string;
  subtotal: number;
  shipping_cost: number | null;
  discount: number | null;
  total: number;
  payment_method: string | null;
  shipping_method: string | null;
  shipping_address: Record<string, unknown>;
  tracking_code: string | null;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    variant_info: string | null;
    quantity: number;
    unit_price: number;
  }[];
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders((data as unknown as OrderRow[]) || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/minha-conta"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">Meus Pedidos</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Nenhum pedido ainda</h2>
            <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
            <Button asChild><Link to="/produtos">Ver Produtos</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedId === order.id;
              const status = statusLabels[order.status] || statusLabels.pending;
              return (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Pedido #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={status.className}>{status.label}</Badge>
                          <span className="font-bold">{formatPrice(order.total)}</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 border-t border-border pt-4 space-y-3">
                        <div className="space-y-2">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.product_name}
                                {item.variant_info && <span className="text-muted-foreground"> ({item.variant_info})</span>}
                                <span className="text-muted-foreground"> × {item.quantity}</span>
                              </span>
                              <span>{formatPrice(item.unit_price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="text-sm space-y-1 border-t border-border pt-2">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          {(order.shipping_cost ?? 0) > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>Frete</span>
                              <span>{formatPrice(order.shipping_cost!)}</span>
                            </div>
                          )}
                          {(order.discount ?? 0) > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Desconto</span>
                              <span>-{formatPrice(order.discount!)}</span>
                            </div>
                          )}
                        </div>

                        {order.tracking_code && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Rastreio: </span>
                            <span className="font-mono font-medium">{order.tracking_code}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

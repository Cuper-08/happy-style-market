import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useAdminOrder, useAdminOrders } from '@/hooks/admin/useAdminOrders';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  User,
  Phone,
  Loader2,
  Save,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrderStatus } from '@/types';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useAdminOrder(id || '');
  const { updateStatus, updateTracking, isUpdating } = useAdminOrders();
  const [trackingCode, setTrackingCode] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Pedido não encontrado</p>
          <Button onClick={() => navigate('/admin/pedidos')}>
            Voltar para pedidos
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const shippingAddress = order.shipping_address as any;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pedidos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground">
              Criado em{' '}
              {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status as OrderStatus} className="text-base px-4 py-1" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        {item.variant_info && (
                          <p className="text-sm text-muted-foreground">{item.variant_info}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(Number(item.unit_price))}</p>
                        <p className="text-sm text-muted-foreground">
                          Qtd: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(Number(order.subtotal))}</span>
                  </div>
                  {order.discount && Number(order.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto</span>
                      <span>-{formatCurrency(Number(order.discount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span>{formatCurrency(Number(order.shipping_cost || 0))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(Number(order.total))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{shippingAddress.label || 'Endereço'}</p>
                  <p className="text-muted-foreground">
                    {shippingAddress.street}, {shippingAddress.number}
                    {shippingAddress.complement && ` - ${shippingAddress.complement}`}
                  </p>
                  <p className="text-muted-foreground">
                    {shippingAddress.neighborhood} - {shippingAddress.city}/{shippingAddress.state}
                  </p>
                  <p className="text-muted-foreground">CEP: {shippingAddress.cep}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle>Atualizar Status</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusSelect
                  value={order.status}
                  onValueChange={(status) =>
                    updateStatus({ orderId: order.id, status })
                  }
                  disabled={isUpdating}
                />
              </CardContent>
            </Card>

            {/* Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Rastreamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.tracking_code ? (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Código de rastreio:</p>
                    <p className="font-mono font-medium">{order.tracking_code}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Código de rastreio"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                    />
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (trackingCode.trim()) {
                          updateTracking({ orderId: order.id, trackingCode: trackingCode.trim() });
                          setTrackingCode('');
                        }
                      }}
                      disabled={!trackingCode.trim() || isUpdating}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Rastreio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            {order.profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{order.profile.full_name || 'Não informado'}</p>
                  </div>
                  {order.profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.profile.phone}</span>
                    </div>
                  )}
                  {order.profile.cpf && (
                    <div>
                      <p className="text-sm text-muted-foreground">CPF</p>
                      <p>{order.profile.cpf}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium capitalize">
                  {order.payment_method === 'pix'
                    ? 'PIX'
                    : order.payment_method === 'card'
                    ? 'Cartão de Crédito'
                    : order.payment_method === 'boleto'
                    ? 'Boleto'
                    : 'Não informado'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

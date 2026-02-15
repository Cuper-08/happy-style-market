import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Alert {
  id: string;
  type: 'low_stock' | 'pending_order' | 'overdue_order';
  title: string;
  description: string;
  count?: number;
  href: string;
}

export function AlertsPanel() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async (): Promise<Alert[]> => {
      const results: Alert[] = [];

      // Out of stock variants
      const { count: outOfStock } = await supabase
        .from('product_variants')
        .select('*', { count: 'exact', head: true })
        .eq('stock', false);

      if (outOfStock && outOfStock > 0) {
        results.push({
          id: 'out-of-stock',
          type: 'low_stock',
          title: 'Sem Estoque',
          description: `${outOfStock} variante(s) esgotadas`,
          count: outOfStock,
          href: '/admin/produtos',
        });
      }

      // Pending orders
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingOrders && pendingOrders > 0) {
        results.push({
          id: 'pending-orders',
          type: 'pending_order',
          title: 'Pedidos Pendentes',
          description: `${pendingOrders} pedido(s) aguardando confirmação`,
          count: pendingOrders,
          href: '/admin/pedidos?status=pending',
        });
      }

      // Processing orders (need to ship)
      const { count: processingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'processing');

      if (processingOrders && processingOrders > 0) {
        results.push({
          id: 'processing-orders',
          type: 'pending_order',
          title: 'Aguardando Envio',
          description: `${processingOrders} pedido(s) prontos para enviar`,
          count: processingOrders,
          href: '/admin/pedidos?status=processing',
        });
      }

      return results;
    },
  });

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'low_stock':
        return Package;
      case 'pending_order':
      case 'overdue_order':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getColor = (type: Alert['type']) => {
    switch (type) {
      case 'low_stock':
        return 'text-amber-500 bg-amber-500/10';
      case 'pending_order':
        return 'text-blue-500 bg-blue-500/10';
      case 'overdue_order':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-orange-500 bg-orange-500/10';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Atenção Necessária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-green-600">
            <Package className="h-4 w-4" />
            Tudo em Ordem!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum alerta no momento. Seu negócio está funcionando perfeitamente!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          Atenção Necessária
          <Badge variant="secondary" className="ml-auto">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert, index) => {
          const Icon = getIcon(alert.type);
          const colorClass = getColor(alert.type);
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={alert.href}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/80 hover:bg-background transition-colors group"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{alert.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {alert.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from './AdminLayout';
import { useDashboard, DashboardPeriod } from '@/hooks/admin/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/admin/StatCard';
import { SalesChart } from '@/components/admin/SalesChart';
import { QuickActions } from '@/components/admin/QuickActions';
import { AlertsPanel } from '@/components/admin/AlertsPanel';
import { AnimatedPage } from '@/components/admin/AnimatedPage';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  ShoppingCart,
  Clock,
  TrendingUp,
  Package,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrderStatus } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('week');
  const { stats, topProducts, salesChart, recentOrders, isLoading } = useDashboard(period);
  const { profile } = useAuth();
  const isMobile = useIsMobile();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const salesTrend = stats
    ? calculateTrend(stats.totalSales, stats.previousPeriodSales)
    : 0;

  const ordersTrend = stats
    ? calculateTrend(stats.totalOrders, stats.previousPeriodOrders)
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Admin';

  return (
    <AdminLayout>
      <AnimatedPage>
        <div className="space-y-4 sm:space-y-6">
          {/* Header with Greeting */}
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <motion.h1 
                className="text-xl sm:text-2xl font-bold flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {getGreeting()}, <span className="text-primary">{firstName}</span>!
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </motion.h1>
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Aqui está o resumo do seu negócio
              </motion.p>
            </div>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as DashboardPeriod)}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="today" className="flex-1 sm:flex-none text-xs sm:text-sm">Hoje</TabsTrigger>
                <TabsTrigger value="week" className="flex-1 sm:flex-none text-xs sm:text-sm">Semana</TabsTrigger>
                <TabsTrigger value="month" className="flex-1 sm:flex-none text-xs sm:text-sm">Mês</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Stats Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Faturamento"
              value={formatCurrency(stats?.totalSales || 0)}
              icon={DollarSign}
              trend={salesTrend}
              description="vs período anterior"
              index={0}
            />
            <StatCard
              title="Pedidos"
              value={stats?.totalOrders || 0}
              icon={ShoppingCart}
              trend={ordersTrend}
              description="vs período anterior"
              index={1}
            />
            <StatCard
              title="Pendentes"
              value={stats?.pendingOrders || 0}
              icon={Clock}
              description="aguardando ação"
              index={2}
            />
            <StatCard
              title="Ticket Médio"
              value={formatCurrency(stats?.averageTicket || 0)}
              icon={TrendingUp}
              description="por pedido"
              index={3}
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SalesChart data={salesChart || []} isLoading={isLoading} />
            </div>

            {/* Alerts Panel */}
            <AlertsPanel />
          </div>

          {/* Top Products & Recent Orders */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-5 w-5 text-primary" />
                    Mais Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : topProducts && topProducts.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {topProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] sm:text-xs font-medium text-primary shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-xs sm:text-sm font-medium truncate">
                              {product.name}
                            </span>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className="text-xs sm:text-sm font-medium text-primary">
                              {formatCurrency(product.revenue)}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {product.totalSold} vendidos
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma venda no período
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-6">
                  <CardTitle className="text-base">Pedidos Recentes</CardTitle>
                  <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                    <Link to="/admin/pedidos">Ver todos</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : recentOrders && recentOrders.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {recentOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                        >
                          <Link
                            to={`/admin/pedidos/${order.id}`}
                            className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                                Pedido #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(order.created_at), isMobile ? "dd/MM HH:mm" : "dd 'de' MMM 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
                              <OrderStatusBadge status={order.status as OrderStatus} className="text-[10px] sm:text-xs" />
                              <span className="font-medium text-sm hidden sm:inline">{formatCurrency(Number(order.total))}</span>
                              <span className="font-medium text-xs sm:hidden">{formatCurrency(Number(order.total))}</span>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum pedido ainda
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AnimatedPage>
    </AdminLayout>
  );
}

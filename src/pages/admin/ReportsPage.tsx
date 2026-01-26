import { useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from './AdminLayout';
import { AnimatedPage } from '@/components/admin/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Download,
  Calendar,
  Package,
  Tag,
  DollarSign,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

const COLORS = ['hsl(43 65% 56%)', 'hsl(18 100% 50%)', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

export default function ReportsPage() {
  const [period, setPeriod] = useState('30');
  const isMobile = useIsMobile();

  const startDate = subDays(new Date(), parseInt(period));

  // Sales by category
  const { data: categoryData = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['report-categories', period],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from('order_items')
        .select(`
          quantity,
          unit_price,
          products(
            category_id,
            categories(name)
          ),
          orders!inner(created_at, status)
        `)
        .gte('orders.created_at', startDate.toISOString())
        .neq('orders.status', 'cancelled');

      if (error) throw error;

      // Aggregate by category
      const categoryMap = new Map<string, number>();
      items?.forEach(item => {
        const categoryName = (item.products as { categories?: { name: string } })?.categories?.name || 'Sem categoria';
        const revenue = Number(item.quantity) * Number(item.unit_price);
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + revenue);
      });

      return Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    },
  });

  // Monthly comparison
  const { data: monthlyData = [], isLoading: loadingMonthly } = useQuery({
    queryKey: ['report-monthly'],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        
        const { data: orders } = await supabase
          .from('orders')
          .select('total')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .neq('status', 'cancelled');

        const total = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
        const orderCount = orders?.length || 0;

        months.push({
          month: format(date, 'MMM', { locale: ptBR }),
          vendas: total,
          pedidos: orderCount,
        });
      }
      return months;
    },
  });

  // Top products
  const { data: topProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['report-top-products', period],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from('order_items')
        .select(`
          product_name,
          quantity,
          unit_price,
          orders!inner(created_at, status)
        `)
        .gte('orders.created_at', startDate.toISOString())
        .neq('orders.status', 'cancelled');

      if (error) throw error;

      const productMap = new Map<string, { quantity: number; revenue: number }>();
      items?.forEach(item => {
        const name = item.product_name;
        const existing = productMap.get(name) || { quantity: 0, revenue: 0 };
        existing.quantity += Number(item.quantity);
        existing.revenue += Number(item.quantity) * Number(item.unit_price);
        productMap.set(name, existing);
      });

      return Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalRevenue = categoryData.reduce((sum, c) => sum + c.value, 0);

  return (
    <AdminLayout>
      <AnimatedPage>
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Relatórios
              </h1>
              <p className="text-sm text-muted-foreground">
                Análise detalhada do seu negócio
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-full sm:w-40">
                  <Calendar className="h-4 w-4 mr-2 shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="shrink-0 sm:hidden">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2 hidden sm:flex">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-xl bg-primary/10 shrink-0">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Faturamento Total</p>
                      <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-xl bg-primary/10 shrink-0">
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Produtos Vendidos</p>
                      <p className="text-lg sm:text-2xl font-bold">
                        {topProducts.reduce((sum, p) => sum + p.quantity, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-xl bg-primary/10 shrink-0">
                      <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Categorias Ativas</p>
                      <p className="text-lg sm:text-2xl font-bold">{categoryData.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Sales by Category - Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Vendas por Categoria
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Distribuição do faturamento por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingCategories ? (
                    <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
                      <div className="animate-pulse text-muted-foreground text-sm">Carregando...</div>
                    </div>
                  ) : categoryData.length === 0 ? (
                    <div className="h-[200px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                      Nenhuma venda no período
                    </div>
                  ) : (
                    <div className="h-[200px] sm:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={isMobile ? 40 : 60}
                            outerRadius={isMobile ? 70 : 100}
                            paddingAngle={3}
                            dataKey="value"
                            label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={!isMobile}
                          >
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: isMobile ? '12px' : '14px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Comparison - Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Comparativo Mensal
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Faturamento dos últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingMonthly ? (
                    <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
                      <div className="animate-pulse text-muted-foreground text-sm">Carregando...</div>
                    </div>
                  ) : (
                    <div className="h-[200px] sm:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: isMobile ? 10 : 12, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: isMobile ? 10 : 12, fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(value) => isMobile ? `${(value / 1000).toFixed(0)}k` : formatCurrency(value)}
                            axisLine={false}
                            tickLine={false}
                            width={isMobile ? 40 : 80}
                          />
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              name === 'vendas' ? formatCurrency(value) : value,
                              name === 'vendas' ? 'Vendas' : 'Pedidos'
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: isMobile ? '12px' : '14px',
                            }}
                          />
                          <Bar 
                            dataKey="vendas" 
                            fill="hsl(43 65% 56%)" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Package className="h-5 w-5 text-primary" />
                  Produtos Mais Vendidos
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Ranking de produtos por faturamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : topProducts.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    Nenhum produto vendido no período
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topProducts.map((product, index) => (
                      <motion.div
                        key={product.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <span 
                            className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold shrink-0 ${
                              index < 3 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-medium text-sm truncate">{product.name}</span>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-6 text-right shrink-0">
                          <div className="hidden sm:block">
                            <p className="text-sm font-medium">{product.quantity} un</p>
                            <p className="text-xs text-muted-foreground">vendidas</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-primary">
                              {formatCurrency(product.revenue)}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground sm:hidden">
                              {product.quantity} un
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AnimatedPage>
    </AdminLayout>
  );
}

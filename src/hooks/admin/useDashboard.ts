import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, startOfWeek, startOfMonth, subDays, format } from 'date-fns';

export type DashboardPeriod = 'today' | 'week' | 'month';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  averageTicket: number;
  previousPeriodSales: number;
  previousPeriodOrders: number;
}

interface TopProduct {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export function useDashboard(period: DashboardPeriod = 'week') {
  const getDateRange = (p: DashboardPeriod) => {
    const now = new Date();
    switch (p) {
      case 'today':
        return { start: startOfDay(now), previous: subDays(startOfDay(now), 1) };
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 0 }), previous: subDays(startOfWeek(now, { weekStartsOn: 0 }), 7) };
      case 'month':
        return { start: startOfMonth(now), previous: subDays(startOfMonth(now), 30) };
    }
  };

  const { start, previous } = getDateRange(period);

  const statsQuery = useQuery({
    queryKey: ['admin-dashboard-stats', period],
    queryFn: async (): Promise<DashboardStats> => {
      // Current period orders
      const { data: currentOrders, error: currentError } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', start.toISOString());

      if (currentError) throw currentError;

      // Previous period orders
      const { data: previousOrders, error: previousError } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', previous.toISOString())
        .lt('created_at', start.toISOString());

      if (previousError) throw previousError;

      const paidOrders = currentOrders?.filter(o => o.status !== 'cancelled') || [];
      const totalSales = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const totalOrders = paidOrders.length;
      const pendingOrders = currentOrders?.filter(o => o.status === 'pending').length || 0;
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

      const previousPaidOrders = previousOrders?.filter(o => true) || [];
      const previousPeriodSales = previousPaidOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const previousPeriodOrders = previousPaidOrders.length;

      return {
        totalSales,
        totalOrders,
        pendingOrders,
        averageTicket,
        previousPeriodSales,
        previousPeriodOrders,
      };
    },
  });

  const topProductsQuery = useQuery({
    queryKey: ['admin-top-products', period],
    queryFn: async (): Promise<TopProduct[]> => {
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          product_id,
          product_name,
          quantity,
          unit_price,
          orders!inner(created_at, status)
        `)
        .gte('orders.created_at', start.toISOString())
        .neq('orders.status', 'cancelled');

      if (error) throw error;

      // Aggregate by product
      const productMap = new Map<string, TopProduct>();
      
      orderItems?.forEach(item => {
        const id = item.product_id || item.product_name;
        const existing = productMap.get(id);
        const revenue = Number(item.quantity) * Number(item.unit_price);
        
        if (existing) {
          existing.totalSold += Number(item.quantity);
          existing.revenue += revenue;
        } else {
          productMap.set(id, {
            id,
            name: item.product_name,
            totalSold: Number(item.quantity),
            revenue,
          });
        }
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
  });

  const salesChartQuery = useQuery({
    queryKey: ['admin-sales-chart', period],
    queryFn: async (): Promise<SalesData[]> => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .gte('created_at', start.toISOString())
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const dateMap = new Map<string, SalesData>();
      
      orders?.forEach(order => {
        const date = format(new Date(order.created_at), 'dd/MM');
        const existing = dateMap.get(date);
        
        if (existing) {
          existing.sales += Number(order.total);
          existing.orders += 1;
        } else {
          dateMap.set(date, {
            date,
            sales: Number(order.total),
            orders: 1,
          });
        }
      });

      return Array.from(dateMap.values());
    },
  });

  const recentOrdersQuery = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          status,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return {
    stats: statsQuery.data,
    topProducts: topProductsQuery.data,
    salesChart: salesChartQuery.data,
    recentOrders: recentOrdersQuery.data,
    isLoading: statsQuery.isLoading || topProductsQuery.isLoading || salesChartQuery.isLoading,
    error: statsQuery.error || topProductsQuery.error || salesChartQuery.error,
  };
}

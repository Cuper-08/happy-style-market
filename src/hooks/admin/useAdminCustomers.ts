import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  cpf: string | null;
  customer_type: string;
  created_at: string;
  totalOrders: number;
  totalSpent: number;
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch order totals for each user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total, status')
        .neq('status', 'cancelled');

      if (ordersError) throw ordersError;

      // Aggregate order data by user
      const ordersByUser = new Map<string, { count: number; total: number }>();
      orders?.forEach(order => {
        if (order.user_id) {
          const existing = ordersByUser.get(order.user_id) || { count: 0, total: 0 };
          existing.count += 1;
          existing.total += Number(order.total);
          ordersByUser.set(order.user_id, existing);
        }
      });

      // Combine profile data with order data
      const customers: Customer[] = (profiles || []).map(profile => {
        const orderData = ordersByUser.get(profile.user_id) || { count: 0, total: 0 };
        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          phone: profile.phone,
          cpf: profile.cpf,
          customer_type: (profile as { customer_type?: string }).customer_type || 'retail',
          created_at: profile.created_at,
          totalOrders: orderData.count,
          totalSpent: orderData.total,
        };
      });

      return customers;
    },
  });
}

export function useAdminCustomer(userId: string) {
  return useQuery({
    queryKey: ['admin-customer', userId],
    queryFn: async () => {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch addresses
      const { data: addresses, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId);

      if (addressesError) throw addressesError;

      // Fetch orders with items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            variant_info,
            quantity,
            unit_price
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      return {
        profile,
        addresses: addresses || [],
        orders: orders || [],
      };
    },
    enabled: !!userId,
  });
}

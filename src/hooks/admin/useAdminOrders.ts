import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

interface OrderFilters {
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useAdminOrders(filters?: OrderFilters) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Separate query for all orders (for status counters)
  const allOrdersCountQuery = useQuery({
    queryKey: ['admin-orders-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status');
      if (error) throw error;
      return data as { status: string }[];
    },
  });

  const ordersQuery = useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: async () => {
      let query = supabase
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
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profile names for all user_ids
      const userIds = [...new Set((data || []).map(o => o.user_id).filter(Boolean))] as string[];
      let profileMap = new Map<string, string>();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        profiles?.forEach(p => {
          if (p.full_name) profileMap.set(p.user_id, p.full_name);
        });
      }

      return (data || []).map(order => ({
        ...order,
        customer_name: order.user_id ? (profileMap.get(order.user_id) || null) : null,
      })) as (OrderRow & { order_items: OrderItemRow[]; customer_name: string | null })[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      if (status === 'paid') {
        try {
          const { data, error: fnError } = await supabase.functions.invoke('create-shipping-label', {
            body: { orderId },
          });

          if (fnError) {
            console.error('Erro ao gerar etiqueta SuperFrete:', fnError);
            toast({
              title: 'Aviso',
              description: 'Pedido marcado como pago, mas houve erro ao gerar etiqueta no SuperFrete.',
              variant: 'destructive',
            });
            return;
          }

          if (data?.success) {
            toast({
              title: 'Etiqueta gerada!',
              description: `Etiqueta SuperFrete criada com sucesso. ID: ${data.label_id || 'N/A'}`,
            });
          } else {
            toast({
              title: 'Aviso',
              description: `Erro SuperFrete: ${data?.error || 'Erro desconhecido'}`,
              variant: 'destructive',
            });
          }
        } catch (labelError) {
          console.error('Erro ao chamar create-shipping-label:', labelError);
          toast({
            title: 'Aviso',
            description: 'Pedido pago, mas não foi possível gerar a etiqueta automaticamente.',
            variant: 'destructive',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders-counts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      toast({
        title: 'Status atualizado',
        description: 'O status do pedido foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive',
      });
      console.error('Error updating order status:', error);
    },
  });

  const updateTrackingMutation = useMutation({
    mutationFn: async ({ orderId, trackingCode }: { orderId: string; trackingCode: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_code: trackingCode, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: 'Código de rastreio adicionado',
        description: 'O código de rastreio foi salvo com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o código de rastreio.',
        variant: 'destructive',
      });
      console.error('Error updating tracking code:', error);
    },
  });

  return {
    orders: ordersQuery.data || [],
    allOrders: allOrdersCountQuery.data || [],
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    updateStatus: updateStatusMutation.mutate,
    updateTracking: updateTrackingMutation.mutate,
    isUpdating: updateStatusMutation.isPending || updateTrackingMutation.isPending,
  };
}

export function useAdminOrder(orderId: string) {
  return useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            variant_info,
            quantity,
            unit_price
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      // Fetch customer profile if user_id exists
      let profile = null;
      if (data.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user_id)
          .maybeSingle();
        profile = profileData;
      }

      // Fetch product images for each order item
      const productIds = (data.order_items || [])
        .map((item: { product_id: string | null }) => item.product_id)
        .filter(Boolean) as string[];

      let productImages = new Map<string, string>();
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, images')
          .in('id', productIds);

        products?.forEach(p => {
          if (p.images && p.images.length > 0) {
            productImages.set(p.id, p.images[0]);
          }
        });
      }

      const enrichedItems = (data.order_items || []).map((item: { product_id: string | null; [key: string]: unknown }) => ({
        ...item,
        image_url: item.product_id ? (productImages.get(item.product_id) || null) : null,
      }));

      return { ...data, order_items: enrichedItems, profile };
    },
    enabled: !!orderId,
  });
}

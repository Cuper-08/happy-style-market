import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExportableOrder {
  id: string;
  created_at: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_cost?: number | null;
  discount?: number | null;
  payment_method?: string | null;
  tracking_code?: string | null;
  customer_name?: string | null;
  order_items?: { product_name: string; quantity: number; unit_price: number }[];
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  processing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export function exportOrdersCSV(orders: ExportableOrder[]) {
  const header = ['ID', 'Data', 'Cliente', 'Status', 'Itens', 'Subtotal', 'Frete', 'Desconto', 'Total', 'Pagamento', 'Rastreio'];
  const rows = orders.map(o => [
    o.id.slice(0, 8).toUpperCase(),
    format(new Date(o.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    o.customer_name || '-',
    statusLabels[o.status] || o.status,
    (o.order_items?.length || 0).toString(),
    Number(o.subtotal).toFixed(2),
    Number(o.shipping_cost || 0).toFixed(2),
    Number(o.discount || 0).toFixed(2),
    Number(o.total).toFixed(2),
    o.payment_method || '-',
    o.tracking_code || '-',
  ]);

  const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pedidos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

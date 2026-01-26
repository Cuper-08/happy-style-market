import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pendente',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  paid: {
    label: 'Pago',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  processing: {
    label: 'Preparando',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  shipped: {
    label: 'Enviado',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  delivered: {
    label: 'Entregue',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

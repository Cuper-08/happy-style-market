import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types';
import { motion } from 'framer-motion';

interface OrderStatusCountersProps {
  orders: { status: string }[];
  activeStatus: OrderStatus | 'all';
  onStatusClick: (status: OrderStatus | 'all') => void;
}

const statusConfig: { key: OrderStatus | 'all'; label: string; color: string; dot: string }[] = [
  { key: 'all', label: 'Todos', color: 'bg-card', dot: 'bg-foreground' },
  { key: 'pending', label: 'Pendentes', color: 'bg-yellow-500/10', dot: 'bg-yellow-500' },
  { key: 'paid', label: 'Pagos', color: 'bg-green-500/10', dot: 'bg-green-500' },
  { key: 'processing', label: 'Preparando', color: 'bg-blue-500/10', dot: 'bg-blue-500' },
  { key: 'shipped', label: 'Enviados', color: 'bg-purple-500/10', dot: 'bg-purple-500' },
  { key: 'delivered', label: 'Entregues', color: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
  { key: 'cancelled', label: 'Cancelados', color: 'bg-red-500/10', dot: 'bg-red-500' },
];

export function OrderStatusCounters({ orders, activeStatus, onStatusClick }: OrderStatusCountersProps) {
  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {statusConfig.map((s, i) => {
        const count = s.key === 'all' ? orders.length : (counts[s.key] || 0);
        const isActive = activeStatus === s.key;
        return (
          <motion.button
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onStatusClick(s.key)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all',
              isActive
                ? 'border-primary/50 bg-primary/5 text-primary shadow-sm'
                : 'border-border/50 hover:border-primary/30 hover:bg-accent/50 text-muted-foreground'
            )}
          >
            <div className={cn('w-2 h-2 rounded-full', s.dot)} />
            {s.label}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-md font-bold',
              isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

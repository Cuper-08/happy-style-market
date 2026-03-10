import { cn } from '@/lib/utils';
import { Check, Clock, CreditCard, Package, Truck, Home, X } from 'lucide-react';
import { OrderStatus } from '@/types';

const steps = [
  { key: 'pending', label: 'Pendente', icon: Clock },
  { key: 'paid', label: 'Pago', icon: CreditCard },
  { key: 'processing', label: 'Preparando', icon: Package },
  { key: 'shipped', label: 'Enviado', icon: Truck },
  { key: 'delivered', label: 'Entregue', icon: Home },
] as const;

interface OrderStatusTimelineProps {
  status: OrderStatus;
}

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
        <X className="h-5 w-5 text-destructive" />
        <span className="font-medium text-destructive">Pedido Cancelado</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="flex items-center gap-1 sm:gap-2 w-full">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isPending = i > currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'bg-primary/10 border-primary text-primary ring-4 ring-primary/20',
                  isPending && 'bg-muted border-border text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={cn(
                'text-[10px] sm:text-xs font-medium text-center leading-tight',
                isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-1 sm:mx-2 rounded-full mt-[-20px]',
                  i < currentIndex ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

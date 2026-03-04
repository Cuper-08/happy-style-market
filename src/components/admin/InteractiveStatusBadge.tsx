import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatus } from '@/types';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveStatusBadgeProps {
    status: OrderStatus;
    onStatusChange: (newStatus: OrderStatus) => void;
    disabled?: boolean;
}

const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: 'Pendente' },
    { value: 'paid', label: 'Pago' },
    { value: 'processing', label: 'Preparando' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregue' },
    { value: 'cancelled', label: 'Cancelado' },
];

export function InteractiveStatusBadge({ status, onStatusChange, disabled }: InteractiveStatusBadgeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <motion.button
                    className="relative outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 rounded-full transition-shadow overflow-hidden group"
                    whileHover={{ scale: disabled ? 1 : 1.02 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                >
                    <OrderStatusBadge status={status} className="px-3 py-1 shadow-sm border-2 backdrop-blur-sm" />

                    <AnimatePresence>
                        {isHovered && !disabled && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center pointer-events-none"
                            >
                                <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider mix-blend-difference text-white drop-shadow-md">
                                    Alterar
                                </span>
                            </motion.div>
                        )}

                        {disabled && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-background/50 backdrop-blur-[1px] rounded-full flex items-center justify-center cursor-not-allowed"
                            >
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground mix-blend-difference" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[180px] p-2 bg-background/80 backdrop-blur-xl border-white/10 shadow-2xl rounded-xl">
                {statusOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => onStatusChange(option.value)}
                        disabled={status === option.value}
                        className={`flex items-center gap-2 cursor-pointer rounded-lg mb-1 py-1.5 transition-all ${status === option.value ? 'bg-primary/5 cursor-default' : 'hover:bg-accent/50'
                            }`}
                    >
                        <div className="scale-90 opacity-90">
                            <OrderStatusBadge status={option.value} />
                        </div>
                        {status === option.value && <span className="text-xs text-muted-foreground ml-auto pr-1">✓</span>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

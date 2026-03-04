import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useAdminOrders } from '@/hooks/admin/useAdminOrders';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { InteractiveStatusBadge } from '@/components/admin/InteractiveStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Search, Loader2, PackageOpen, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrderStatus } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedSearch, setFocusedSearch] = useState(false);
  const isMobile = useIsMobile();

  const { orders, isLoading, updateStatus, isUpdating } = useAdminOrders(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      (order.tracking_code?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-8 pb-10">
        {/* Glow Header Background Effect */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent"
              >
                Pedidos
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground font-medium"
              >
                Gestão e acompanhamento das vendas conectadas.
              </motion.p>
            </div>
          </div>
        </div>

        {/* Premium Tool Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
          className="bg-card/50 backdrop-blur-xl border border-white/5 dark:border-white/10 shadow-sm rounded-2xl p-4 sticky top-4 z-30"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className={cn(
              "relative flex-1 group transition-all duration-300",
              focusedSearch ? "ring-2 ring-primary/30 rounded-xl" : ""
            )}>
              <Search className={cn(
                "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300",
                focusedSearch ? "text-primary drop-shadow-glow" : "text-muted-foreground"
              )} />
              <Input
                placeholder="Buscar ID do pedido, código de rastreio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setFocusedSearch(true)}
                onBlur={() => setFocusedSearch(false)}
                className="pl-12 h-12 bg-background/50 border-white/10 text-base shadow-inner rounded-xl transition-all"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl bg-background/50 border-white/10 hover:bg-accent/50 transition-colors">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10 shadow-xl backdrop-blur-xl bg-background/90">
                <SelectItem value="all">Todos os Pedidos</SelectItem>
                <SelectItem value="pending"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Pendente</span></SelectItem>
                <SelectItem value="paid"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Pago</span></SelectItem>
                <SelectItem value="processing"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Preparando</span></SelectItem>
                <SelectItem value="shipped"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /> Enviado</span></SelectItem>
                <SelectItem value="delivered"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Entregue</span></SelectItem>
                <SelectItem value="cancelled"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Cancelado</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Data Presentation */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center pt-20"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                <p className="mt-4 text-muted-foreground font-medium animate-pulse">Carregando pedidos...</p>
              </motion.div>
            ) : filteredOrders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center p-12 text-center bg-card/30 border border-dashed border-border/60 rounded-3xl mt-8"
              >
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center shadow-inner">
                  <PackageOpen className="h-10 w-10 text-primary/60" />
                </div>
                <h3 className="text-xl font-bold mb-2">A caixa está vazia</h3>
                <p className="text-muted-foreground max-w-[300px]">
                  {searchTerm
                    ? "Sua busca não encontrou resultados. Tente usar palavras diferentes ou limpe os filtros."
                    : "Você ainda não possui nenhum pedido nesse marketplace."}
                </p>
                {searchTerm && (
                  <Button variant="outline" className="mt-6 rounded-full" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                    Limpar Filtros
                  </Button>
                )}
              </motion.div>
            ) : isMobile ? (
              <motion.div
                key="mobile-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                # Mobile Card View
                {filteredOrders.map((order, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={order.id}
                  >
                    <Link
                      to={`/admin/pedidos/${order.id}`}
                      className="group block p-5 rounded-2xl bg-card border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-lg group-hover:text-primary transition-colors">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                            {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                          <div className="text-sm text-foreground/80 mt-2 font-medium bg-muted/50 inline-flex px-2 py-0.5 rounded-md">
                            {order.order_items?.length || 0} produto(s)
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-3">
                          <InteractiveStatusBadge
                            status={order.status as OrderStatus}
                            onStatusChange={(status) => updateStatus({ orderId: order.id, status })}
                            disabled={isUpdating}
                          />
                          <p className="font-bold text-lg text-primary drop-shadow-sm">
                            {formatCurrency(Number(order.total))}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="desktop-table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-2xl border shadow-sm overflow-hidden"
              >
                # Desktop Table View
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-semibold sticky top-0 z-10 backdrop-blur-md">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-2xl">Pedido</th>
                        <th className="px-6 py-4">Data e Hora</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Resumo</th>
                        <th className="px-6 py-4">Valor Total</th>
                        <th className="px-6 py-4">Rastreamento</th>
                        <th className="px-6 py-4 text-right rounded-tr-2xl">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredOrders.map((order, i) => (
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03, type: "spring", stiffness: 400, damping: 30 }}
                          key={order.id}
                          className="group hover:bg-accent/40 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 font-mono font-medium text-foreground/90">
                            <Link to={`/admin/pedidos/${order.id}`} className="hover:underline underline-offset-4 decoration-primary/50 text-primary font-bold">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">
                            {format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                          </td>
                          <td className="px-6 py-4">
                            <InteractiveStatusBadge
                              status={order.status as OrderStatus}
                              onStatusChange={(status) => updateStatus({ orderId: order.id, status })}
                              disabled={isUpdating}
                            />
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <PackageOpen className="w-4 h-4 opacity-50" />
                              {order.order_items?.length || 0} item(s)
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-base">
                            {formatCurrency(Number(order.total))}
                          </td>
                          <td className="px-6 py-4">
                            {order.tracking_code ? (
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold bg-muted text-foreground/80 rounded-lg border">
                                {order.tracking_code}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40 font-medium">- Aguardando -</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 hover:bg-primary/10 hover:text-primary pr-3 pl-4"
                              asChild
                            >
                              <Link to={`/admin/pedidos/${order.id}`}>
                                Visualizar
                                <ArrowRight className="h-4 w-4 ml-1.5" />
                              </Link>
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}

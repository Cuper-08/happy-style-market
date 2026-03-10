import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useAdminOrders } from '@/hooks/admin/useAdminOrders';
import { InteractiveStatusBadge } from '@/components/admin/InteractiveStatusBadge';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { OrderStatusCounters } from '@/components/admin/OrderStatusCounters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Eye, Search, Loader2, PackageOpen, ArrowRight, CalendarIcon, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrderStatus } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { exportOrdersCSV } from '@/lib/csvExportOrders';

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedSearch, setFocusedSearch] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();

  const { orders, allOrders, isLoading, updateStatus, isUpdating } = useAdminOrders(
    statusFilter !== 'all' || startDate || endDate
      ? {
          ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        }
      : undefined
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const s = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(s) ||
        order.tracking_code?.toLowerCase().includes(s) ||
        order.customer_name?.toLowerCase().includes(s)
    );
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || startDate || endDate;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <AdminPageHeader title="Pedidos" description="Gestão e acompanhamento das vendas conectadas." />
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl self-start md:self-auto"
            onClick={() => exportOrdersCSV(filteredOrders as any)}
            disabled={filteredOrders.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Status Counters */}
        <OrderStatusCounters
          orders={allOrders}
          activeStatus={statusFilter}
          onStatusClick={(s) => { setStatusFilter(s); setCurrentPage(1); }}
        />

        {/* Premium Tool Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
          className="bg-card/50 backdrop-blur-xl border border-white/5 dark:border-white/10 shadow-sm rounded-2xl p-4 sticky top-4 z-30"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className={cn(
              "relative flex-1 group transition-all duration-300",
              focusedSearch ? "ring-2 ring-primary/30 rounded-xl" : ""
            )}>
              <Search className={cn(
                "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300",
                focusedSearch ? "text-primary" : "text-muted-foreground"
              )} />
              <Input
                placeholder="Buscar por ID, rastreio ou nome do cliente..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                onFocus={() => setFocusedSearch(true)}
                onBlur={() => setFocusedSearch(false)}
                className="pl-12 h-12 bg-background/50 border-white/10 text-base shadow-inner rounded-xl transition-all"
              />
            </div>

            {/* Date Range Pickers */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(
                  "h-12 rounded-xl bg-background/50 border-white/10 hover:bg-accent/50 justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yy') : 'De'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => { setStartDate(d); setCurrentPage(1); }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(
                  "h-12 rounded-xl bg-background/50 border-white/10 hover:bg-accent/50 justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yy') : 'Até'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => { setEndDate(d); setCurrentPage(1); }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl shrink-0" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Data Presentation */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground font-medium animate-pulse">Carregando pedidos...</p>
              </motion.div>
            ) : paginatedOrders.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center p-12 text-center bg-card/30 border border-dashed border-border/60 rounded-3xl mt-8">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center shadow-inner">
                  <PackageOpen className="h-10 w-10 text-primary/60" />
                </div>
                <h3 className="text-xl font-bold mb-2">A caixa está vazia</h3>
                <p className="text-muted-foreground max-w-[300px]">
                  {hasActiveFilters
                    ? "Sua busca não encontrou resultados. Tente usar palavras diferentes ou limpe os filtros."
                    : "Você ainda não possui nenhum pedido nesse marketplace."}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" className="mt-6 rounded-full" onClick={clearFilters}>Limpar Filtros</Button>
                )}
              </motion.div>
            ) : isMobile ? (
              <motion.div key="mobile-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {paginatedOrders.map((order, i) => (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={order.id}>
                    <Link to={`/admin/pedidos/${order.id}`} className="group block p-5 rounded-2xl bg-card border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-lg group-hover:text-primary transition-colors">#{order.id.slice(0, 8).toUpperCase()}</p>
                          {order.customer_name && (
                            <p className="text-sm text-foreground/80 truncate">{order.customer_name}</p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                            {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                          <div className="text-sm text-foreground/80 mt-2 font-medium bg-muted/50 inline-flex px-2 py-0.5 rounded-md">
                            {order.order_items?.length || 0} produto(s)
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-3">
                          <InteractiveStatusBadge status={order.status as OrderStatus} onStatusChange={(status) => updateStatus({ orderId: order.id, status })} disabled={isUpdating} />
                          <p className="font-bold text-lg text-primary">{formatCurrency(Number(order.total))}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="desktop-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-semibold sticky top-0 z-10 backdrop-blur-md">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-2xl">Pedido</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Data e Hora</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Itens</th>
                        <th className="px-6 py-4">Valor Total</th>
                        <th className="px-6 py-4">Rastreamento</th>
                        <th className="px-6 py-4 text-right rounded-tr-2xl">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {paginatedOrders.map((order, i) => (
                        <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, type: "spring", stiffness: 400, damping: 30 }} key={order.id} className="group hover:bg-accent/40 transition-colors duration-200">
                          <td className="px-6 py-4 font-mono font-medium">
                            <Link to={`/admin/pedidos/${order.id}`} className="hover:underline underline-offset-4 decoration-primary/50 text-primary font-bold">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-foreground/80 font-medium max-w-[180px] truncate">
                            {order.customer_name || <span className="text-muted-foreground/40">—</span>}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">
                            {format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                          </td>
                          <td className="px-6 py-4">
                            <InteractiveStatusBadge status={order.status as OrderStatus} onStatusChange={(status) => updateStatus({ orderId: order.id, status })} disabled={isUpdating} />
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <PackageOpen className="w-4 h-4 opacity-50" />
                              {order.order_items?.length || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-base">{formatCurrency(Number(order.total))}</td>
                          <td className="px-6 py-4">
                            {order.tracking_code ? (
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold bg-muted text-foreground/80 rounded-lg border">{order.tracking_code}</span>
                            ) : (
                              <span className="text-muted-foreground/40 font-medium">— Aguardando —</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" className="rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 hover:bg-primary/10 hover:text-primary pr-3 pl-4" asChild>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} de {filteredOrders.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-xl" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="icon" className="rounded-xl" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

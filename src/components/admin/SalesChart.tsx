import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

interface SalesChartProps {
  data: SalesData[];
  isLoading?: boolean;
}

export function SalesChart({ data, isLoading }: SalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Vendas do Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-sm text-muted-foreground">Carregando dados...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Vendas do Período
            </CardTitle>
            {data.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(totalSales)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Pedidos</p>
                  <p className="text-lg font-bold">{totalOrders}</p>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            {data.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Nenhuma venda no período selecionado</p>
                <p className="text-xs mt-1">As vendas aparecerão aqui quando houver pedidos</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    {/* Premium gold gradient */}
                    <linearGradient id="salesGradientPremium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(43 65% 56%)" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="hsl(43 65% 56%)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(43 65% 56%)" stopOpacity={0} />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.5}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCurrency}
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl border border-primary/20 bg-popover/95 backdrop-blur-md p-4 shadow-xl"
                          >
                            <p className="text-sm font-semibold mb-2">{label}</p>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">Vendas:</span>
                                <span className="text-sm font-bold text-primary">
                                  {formatCurrency(payload[0].value as number)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">Pedidos:</span>
                                <span className="text-sm font-medium">
                                  {payload[0].payload.orders}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(43 65% 56%)"
                    strokeWidth={2.5}
                    fill="url(#salesGradientPremium)"
                    filter="url(#glow)"
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: 'hsl(43 65% 56%)',
                      stroke: 'hsl(var(--background))',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

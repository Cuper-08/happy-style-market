import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  className?: string;
  index?: number;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  className,
  index = 0 
}: StatCardProps) {
  const showTrend = trend !== undefined && trend !== 0;
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card 
        className={cn(
          'overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative group',
          isPositive && 'border-l-4 border-l-green-500',
          isNegative && 'border-l-4 border-l-red-500',
          !showTrend && 'border-l-4 border-l-primary',
          className
        )}
      >
        {/* Gradient overlay */}
        <div 
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
            isPositive && 'bg-gradient-to-br from-green-500/5 to-transparent',
            isNegative && 'bg-gradient-to-br from-red-500/5 to-transparent',
            !showTrend && 'bg-gradient-to-br from-primary/5 to-transparent'
          )} 
        />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.p 
                className="text-2xl font-bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
              >
                {value}
              </motion.p>
              {(description || showTrend) && (
                <div className="flex items-center gap-2 text-xs">
                  {showTrend && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className={cn(
                        'flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded',
                        isPositive && 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
                        isNegative && 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(trend).toFixed(1)}%
                    </motion.span>
                  )}
                  {description && (
                    <span className="text-muted-foreground">{description}</span>
                  )}
                </div>
              )}
            </div>
            <motion.div 
              className={cn(
                'rounded-xl p-3 transition-transform duration-300 group-hover:scale-110',
                isPositive && 'bg-green-500/10',
                isNegative && 'bg-red-500/10',
                !showTrend && 'bg-primary/10'
              )}
              whileHover={{ rotate: 5 }}
            >
              <Icon 
                className={cn(
                  'h-5 w-5',
                  isPositive && 'text-green-600',
                  isNegative && 'text-red-600',
                  !showTrend && 'text-primary'
                )} 
              />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Package, 
  Truck, 
  BarChart3,
  Tag,
  Users,
  Settings,
  ShoppingBag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const quickActions = [
  { 
    icon: Plus, 
    label: 'Novo Produto', 
    href: '/admin/produtos/novo', 
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600'
  },
  { 
    icon: ShoppingBag, 
    label: 'Ver Pedidos', 
    href: '/admin/pedidos', 
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600'
  },
  { 
    icon: Package, 
    label: 'Estoque', 
    href: '/admin/produtos', 
    color: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-600'
  },
  { 
    icon: BarChart3, 
    label: 'Relatórios', 
    href: '/admin/relatorios', 
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600'
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {quickActions.map((action) => (
            <motion.div key={action.href} variants={item}>
              <Link
                to={action.href}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-300 group"
              >
                <div 
                  className={cn(
                    'p-3 rounded-xl text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg',
                    action.color,
                    action.hoverColor
                  )}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-center">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}

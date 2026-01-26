import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Building2,
  Users,
  Settings,
  BarChart3,
  ChevronLeft,
  LogOut,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: ShoppingBag, label: 'Pedidos', path: '/admin/pedidos', badgeKey: 'pendingOrders' },
  { icon: Package, label: 'Produtos', path: '/admin/produtos', badgeKey: 'lowStock' },
  { icon: Tags, label: 'Categorias', path: '/admin/categorias' },
  { icon: Building2, label: 'Marcas', path: '/admin/marcas' },
  { icon: Users, label: 'Clientes', path: '/admin/clientes' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios' },
  { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  // Fetch badge counts
  const { data: badges } = useQuery({
    queryKey: ['admin-sidebar-badges'],
    queryFn: async () => {
      const [pendingResult, lowStockResult] = await Promise.all([
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('product_variants')
          .select('*', { count: 'exact', head: true })
          .lt('stock_quantity', 5),
      ]);

      return {
        pendingOrders: pendingResult.count || 0,
        lowStock: lowStockResult.count || 0,
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getBadgeCount = (badgeKey?: string) => {
    if (!badgeKey || !badges) return 0;
    return badges[badgeKey as keyof typeof badges] || 0;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <img src={logo} alt="Brás Conceito" className="h-10 w-auto" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn('shrink-0', collapsed && 'mx-auto')}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const badgeCount = getBadgeCount(item.badgeKey);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group',
                  active
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0 transition-transform', active && 'scale-110')} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <Badge 
                        variant="secondary"
                        className={cn(
                          'h-5 min-w-5 px-1.5 flex items-center justify-center text-xs',
                          active 
                            ? 'bg-primary-foreground/20 text-primary-foreground' 
                            : 'bg-orange-500 text-white animate-pulse'
                        )}
                      >
                        {badgeCount}
                      </Badge>
                    )}
                  </>
                )}
                {collapsed && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center animate-pulse">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-2 space-y-1">
          {/* Theme Toggle */}
          <ModeToggle collapsed={collapsed} />
          
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
              collapsed && 'justify-center px-2'
            )}
          >
            <Store className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Ver Loja</span>}
          </Link>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 px-3 py-2.5 text-muted-foreground hover:text-destructive',
              collapsed && 'justify-center px-2'
            )}
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}

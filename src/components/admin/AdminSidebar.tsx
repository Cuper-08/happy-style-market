import { Link, useLocation } from 'react-router-dom';
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
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/ui/mode-toggle';
import logo from '@/assets/logo.png';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: ShoppingBag, label: 'Pedidos', path: '/admin/pedidos' },
  { icon: Package, label: 'Produtos', path: '/admin/produtos' },
  { icon: Tags, label: 'Categorias', path: '/admin/categorias' },
  { icon: Building2, label: 'Marcas', path: '/admin/marcas' },
  { icon: Users, label: 'Clientes', path: '/admin/clientes' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios' },
  { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
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
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
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

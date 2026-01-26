import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, ExternalLink, ChevronDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success';
  read: boolean;
}

export function AdminHeader() {
  const { profile, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications (pending orders, low stock)
  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async (): Promise<Notification[]> => {
      const results: Notification[] = [];

      // Pending orders
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingCount && pendingCount > 0) {
        results.push({
          id: 'pending-orders',
          title: `${pendingCount} pedido(s) pendente(s)`,
          description: 'Aguardando confirmação de pagamento',
          type: 'warning',
          read: false,
        });
      }

      // Low stock products
      const { data: lowStock } = await supabase
        .from('product_variants')
        .select('id, stock_quantity, product_id')
        .lt('stock_quantity', 5)
        .gt('stock_quantity', 0);

      if (lowStock && lowStock.length > 0) {
        results.push({
          id: 'low-stock',
          title: `${lowStock.length} produto(s) com estoque baixo`,
          description: 'Menos de 5 unidades disponíveis',
          type: 'warning',
          read: false,
        });
      }

      return results;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Admin';

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30 px-6">
      <div className="flex items-center justify-between h-full">
        {/* Left side - Greeting and date */}
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-semibold">
              {getGreeting()}, <span className="text-primary">{firstName}</span>!
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {format(currentTime, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* View Store */}
          <Button variant="outline" size="sm" asChild className="hidden sm:flex">
            <Link to="/" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Loja
            </Link>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-white text-xs animate-pulse"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map(notification => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                      )}
                      <span className="font-medium">{notification.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {notification.description}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline">{firstName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/configuracoes">Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/conta">Meu Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive"
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

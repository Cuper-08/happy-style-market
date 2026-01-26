import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

interface AdminMobileHeaderProps {
  onMenuToggle: () => void;
}

export function AdminMobileHeader({ onMenuToggle }: AdminMobileHeaderProps) {
  // Fetch pending orders count for notification badge
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['admin-pending-orders-mobile'],
    queryFn: async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count || 0;
    },
    refetchInterval: 60000,
  });

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50">
      <div className="flex items-center justify-between px-4 h-full">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuToggle}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <img src={logo} alt="Brás Conceito" className="h-8 w-auto" />
        
        <div className="relative">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Bell className="h-5 w-5" />
          </Button>
          {pendingCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] bg-orange-500 text-white border-0 animate-pulse"
            >
              {pendingCount > 9 ? '9+' : pendingCount}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}

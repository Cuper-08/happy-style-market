import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

const navItems = [
  { icon: Home, label: 'Início', href: '/' },
  { icon: Grid3X3, label: 'Categorias', href: '/produtos' },
  { icon: ShoppingBag, label: 'Carrinho', href: '/carrinho', showBadge: true },
  { icon: User, label: 'Conta', href: '/minha-conta' },
];

export function MobileNav() {
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ icon: Icon, label, href, showBadge }) => {
          const isActive = location.pathname === href;
          
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors relative',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {showBadge && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden mobile-nav-dark">
      {/* Gradient border top */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="backdrop-blur-xl border-t border-[hsl(0,0%,18%)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ icon: Icon, label, href, showBadge }) => {
            const isActive = location.pathname === href;
            
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 relative',
                  isActive 
                    ? 'text-primary' 
                    : 'text-[hsl(0,0%,65%)] hover:text-white'
                )}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      'h-5 w-5 transition-all duration-300',
                      isActive && 'scale-110'
                    )} 
                  />
                  {showBadge && totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-scale-in">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-all duration-300',
                  isActive && 'text-primary'
                )}>
                  {label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-scale-in" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

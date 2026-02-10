import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

export function Header() {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [prevTotalItems, setPrevTotalItems] = useState(totalItems);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart bounce animation when items are added
  useEffect(() => {
    if (totalItems > prevTotalItems) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevTotalItems(totalItems);
  }, [totalItems, prevTotalItems]);

  return (
    <header 
      className={cn(
        'header-dark sticky top-0 z-50 w-full border-b transition-all duration-300',
        scrolled 
          ? 'shadow-lg' 
          : 'border-transparent'
      )}
    >
      <div className="container flex h-18 md:h-20 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img 
            src={logo} 
            alt="Brás Conceito" 
            className="h-14 md:h-16 w-auto object-contain drop-shadow-[0_0_8px_rgba(201,169,98,0.4)] transition-all duration-300 group-hover:drop-shadow-[0_0_16px_rgba(201,169,98,0.6)]"
          />
        </Link>

        {/* Search - Desktop */}
        <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(''); } }} className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(0,0%,65%)] transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-[hsl(0,0%,12%)] border-[hsl(0,0%,18%)] text-white placeholder:text-[hsl(0,0%,50%)] transition-all duration-300 focus:bg-[hsl(0,0%,15%)] focus:border-primary/50 focus:shadow-gold-sm"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Search - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[hsl(0,0%,85%)] hover:bg-[hsl(0,0%,15%)] hover:text-primary transition-colors"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* User */}
          <Link to={user ? '/minha-conta' : '/login'}>
            <Button variant="ghost" size="icon" className="text-[hsl(0,0%,85%)] hover:bg-[hsl(0,0%,15%)] hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          {/* Favorites */}
          <Link to="/minha-conta/favoritos">
            <Button variant="ghost" size="icon" className="text-[hsl(0,0%,85%)] hover:bg-[hsl(0,0%,15%)] hover:text-primary transition-colors">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart */}
          <Link to="/carrinho">
            <Button variant="ghost" size="icon" className="relative text-[hsl(0,0%,85%)] hover:bg-[hsl(0,0%,15%)] hover:text-primary transition-colors">
              <ShoppingBag className={cn('h-5 w-5 transition-transform', cartBounce && 'animate-bounce')} />
              {totalItems > 0 && (
                <span className={cn(
                  "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center",
                  cartBounce ? 'animate-pulse scale-125' : 'animate-scale-in'
                )}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-[hsl(0,0%,85%)] hover:bg-[hsl(0,0%,15%)] hover:text-primary transition-colors">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-[hsl(0,0%,8%)] border-[hsl(0,0%,18%)]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                  Início
                </Link>
                <Link to="/produtos" className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                  Todos os Produtos
                </Link>
                <Link to="/categoria/tenis" className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                  Tênis
                </Link>
                <Link to="/categoria/roupas" className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                  Roupas
                </Link>
                <Link to="/categoria/acessorios" className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                  Acessórios
                </Link>
                <div className="border-t border-[hsl(0,0%,18%)] pt-4 mt-4">
                  {user ? (
                    <>
                      <Link to="/minha-conta" className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                        Minha Conta
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                        Entrar
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(''); setSearchOpen(false); } }} className="container pb-4 md:hidden animate-fade-in-up">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(0,0%,65%)]" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-[hsl(0,0%,12%)] border-[hsl(0,0%,18%)] text-white placeholder:text-[hsl(0,0%,50%)] focus:border-primary/50"
              autoFocus
            />
          </div>
        </form>
      )}
    </header>
  );
}

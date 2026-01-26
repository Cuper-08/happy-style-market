import { Link } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import logo from '@/assets/logo.png';

export function Header() {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="Brás Conceito" 
            className="h-14 w-auto object-contain drop-shadow-[0_0_8px_rgba(201,169,98,0.4)]"
          />
        </Link>

        {/* Search - Desktop */}
        <div className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="w-full pl-10 bg-secondary border-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* User */}
          <Link to={user ? '/minha-conta' : '/login'}>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          {/* Favorites */}
          <Link to="/minha-conta/favoritos">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart */}
          <Link to="/carrinho">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">
                  Início
                </Link>
                <Link to="/produtos" className="text-lg font-medium hover:text-primary transition-colors">
                  Todos os Produtos
                </Link>
                <Link to="/categoria/tenis" className="text-lg font-medium hover:text-primary transition-colors">
                  Tênis
                </Link>
                <Link to="/categoria/roupas" className="text-lg font-medium hover:text-primary transition-colors">
                  Roupas
                </Link>
                <Link to="/categoria/acessorios" className="text-lg font-medium hover:text-primary transition-colors">
                  Acessórios
                </Link>
                <div className="border-t border-border pt-4 mt-4">
                  {user ? (
                    <>
                      <Link to="/minha-conta" className="text-lg font-medium hover:text-primary transition-colors">
                        Minha Conta
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="text-lg font-medium hover:text-primary transition-colors">
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
        <div className="container pb-3 md:hidden animate-in">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="w-full pl-10 bg-secondary border-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}

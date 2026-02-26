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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const MEGA_MENU = [
  {
    title: 'Toda a loja',
    href: '/produtos',
    items: []
  },
  {
    title: 'Tênis',
    href: '/categoria/tenis',
    items: [
      { title: 'Tênis Infantil', href: '/categoria/tenis-infantil' },
      { title: 'Grifes Importadas', href: '/produtos?q=Grifes+Importadas' },
      { title: 'Air Jordan', href: '/produtos?q=Jordan' },
      { title: 'Nike', href: '/produtos?q=Nike' },
      { title: 'Adidas', href: '/produtos?q=Adidas' },
    ]
  },
  {
    title: 'Linha High Quality',
    href: '/produtos?q=Linha+Premium',
    items: [
      { title: 'Air jordan 1 Mid', href: '/produtos?q=Air+jordan+1+Mid' },
      { title: 'Air Jordan 4 Retro', href: '/produtos?q=Air+Jordan+4+Retro' },
      { title: 'DUNK LOW', href: '/produtos?q=DUNK+LOW' },
      { title: 'High Quality', href: '/produtos?q=Linha+Premium' },
      { title: 'Jordan 1 Low', href: '/produtos?q=Jordan+1+Low' },
      { title: 'Nike Air Force', href: '/produtos?q=Nike+Air+Force' },
      { title: 'Nike Air Yeezy 2 SP', href: '/produtos?q=Nike+Air+Yeezy+2+SP' },
      { title: 'Travis Scott', href: '/produtos?q=Travis+Scott' },
    ]
  },
  {
    title: 'Bonés',
    href: '/categoria/bone',
    items: [
      { title: 'New Era', href: '/produtos?q=Boné+New+Era' },
      { title: 'Gucci', href: '/produtos?q=Boné+Gucci' },
      { title: 'Prada', href: '/produtos?q=Boné+Prada' },
      { title: 'Hugo Boss', href: '/produtos?q=Boné+Hugo+Boss' },
      { title: 'Louis Vuitton', href: '/produtos?q=Boné+Louis+Vuitton' },
      { title: 'Miu Miu', href: '/produtos?q=Boné+Miu+Miu' },
    ]
  },
  {
    title: 'Bolsas e Acessórios',
    href: '/categoria/bolsas',
    items: [
      { title: 'Bolsas Importadas', href: '/produtos?q=Bolsa' },
      { title: 'Malas de Viagem', href: '/categoria/malas' },
      { title: 'Cintos', href: '/categoria/cintos' },
      { title: 'Mochilas', href: '/produtos?q=Mochila' },
    ]
  },
  {
    title: 'Chinelos',
    href: '/categoria/chinelo',
    items: [
      { title: 'Louis Vuitton', href: '/produtos?q=Chinelo+Louis+Vuitton' },
      { title: 'Amiri', href: '/produtos?q=Chinelo+Amiri' },
    ]
  },
  {
    title: 'Meias',
    href: '/categoria/meias',
    items: [
      { title: 'Meias Nike', href: '/produtos?q=Meia+Nike' },
      { title: 'Meias Adidas', href: '/produtos?q=Meia+Adidas' },
      { title: 'Meias Jordan', href: '/produtos?q=Meia+Jordan' },
      { title: 'Meias Puma', href: '/produtos?q=Meia+Puma' },
    ]
  }
];

export function Header() {
  const { user, profile } = useAuth();
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
            <Button variant="ghost" size="icon" className="text-[hsl(0,0%,85%)] hover:bg-[hsl(0,0%,15%)] hover:text-primary transition-colors overflow-hidden">
              {profile?.avatar_url ? (
                <div className="h-7 w-7 rounded-full border border-primary/30 overflow-hidden flex items-center justify-center bg-muted">
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Usuário'}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <User className="h-5 w-5" />
              )}
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
            <SheetContent side="right" className="w-80 bg-[hsl(0,0%,8%)] border-[hsl(0,0%,18%)] overflow-y-auto">
              <nav className="flex flex-col gap-4 mt-8 pb-8">
                <Link to="/" className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                  Início
                </Link>

                {MEGA_MENU.map((item) => (
                  <div key={item.title} className="flex flex-col gap-2">
                    <Link to={item.href} className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                      {item.title}
                    </Link>
                    {item.items.length > 0 && (
                      <div className="pl-4 flex flex-col gap-2 border-l border-[hsl(0,0%,18%)] ml-2">
                        {item.items.map((subItem) => (
                          <Link key={subItem.title} to={subItem.href} className="text-sm text-[hsl(0,0%,70%)] hover:text-primary transition-colors">
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="border-t border-[hsl(0,0%,18%)] pt-4 mt-2">
                  {user ? (
                    <Link to="/minha-conta" className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                      Minha Conta
                    </Link>
                  ) : (
                    <Link to="/login" className="text-lg font-medium text-white hover:text-primary transition-colors link-underline inline-block">
                      Entrar
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mega Menu - Desktop */}
      <div className="hidden md:flex border-y border-[hsl(0,0%,18%)] bg-[hsl(0,0%,10%)] justify-center">
        <div className="container flex h-12 items-center justify-center overflow-x-auto scrollbar-hide">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {MEGA_MENU.map((category) => (
                <NavigationMenuItem key={category.title}>
                  {category.items.length > 0 ? (
                    <>
                      <NavigationMenuTrigger className="bg-transparent hover:bg-white/10 text-[hsl(0,0%,85%)] hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white font-medium text-sm">
                        {category.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] shadow-xl rounded-md">
                          {category.items.map((item) => (
                            <li key={item.title}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.href}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/10 hover:text-primary text-[hsl(0,0%,85%)] focus:bg-white/10 focus:text-primary"
                                >
                                  <div className="text-sm font-medium leading-none">{item.title}</div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link to={category.href}>
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-white/10 text-[hsl(0,0%,85%)] hover:text-white font-medium text-sm")}>
                        {category.title}
                      </NavigationMenuLink>
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
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

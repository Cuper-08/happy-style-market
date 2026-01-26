import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto pb-24 md:pb-0">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="inline-block group">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(201,169,98,0.5)]">BRÁS</span>
                <span className="text-foreground"> CONCEITO</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O melhor em tênis e moda esportiva com preços de atacado para você.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-5 text-foreground">Categorias</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/categoria/tenis" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline inline-block">
                  Tênis
                </Link>
              </li>
              <li>
                <Link to="/categoria/roupas" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline inline-block">
                  Roupas
                </Link>
              </li>
              <li>
                <Link to="/categoria/acessorios" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline inline-block">
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-5 text-foreground">Institucional</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline inline-block">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline inline-block">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline inline-block">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-5 text-foreground">Atendimento</h3>
            <ul className="space-y-3">
              <li className="text-sm text-muted-foreground">
                WhatsApp: (11) 99999-9999
              </li>
              <li className="text-sm text-muted-foreground">
                Email: contato@brasconceito.com.br
              </li>
              <li className="text-sm text-muted-foreground">
                Seg - Sex: 9h às 18h
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Brás Conceito. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

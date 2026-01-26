import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto pb-20 md:pb-0">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-primary">BRÁS</span>
                <span className="text-foreground"> CONCEITO</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              O melhor em tênis e moda esportiva com preços de atacado para você.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/categoria/tenis" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tênis
                </Link>
              </li>
              <li>
                <Link to="/categoria/roupas" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Roupas
                </Link>
              </li>
              <li>
                <Link to="/categoria/acessorios" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Institucional</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Atendimento</h3>
            <ul className="space-y-2">
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

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Brás Conceito. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

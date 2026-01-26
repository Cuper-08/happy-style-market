import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
<footer className="footer-dark border-t mt-auto pb-24 md:pb-0">
      <div className="container py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="space-y-3 col-span-2 md:col-span-1">
            <Link to="/" className="inline-block group">
              <span className="text-lg font-bold tracking-tight">
                <span className="text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(201,169,98,0.5)]">BRÁS</span>
                <span className="text-white"> CONCEITO</span>
              </span>
            </Link>
            <p className="text-xs text-[hsl(0,0%,65%)] leading-relaxed">
              O melhor em tênis e moda esportiva com preços de atacado.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-[hsl(0,0%,65%)] hover:text-primary hover:scale-110 transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-[hsl(0,0%,65%)] hover:text-primary hover:scale-110 transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-[hsl(0,0%,65%)] hover:text-primary hover:scale-110 transition-all duration-300">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-white">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/categoria/tenis" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Tênis
                </Link>
              </li>
              <li>
                <Link to="/categoria/roupas" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Roupas
                </Link>
              </li>
              <li>
                <Link to="/categoria/acessorios" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-white">Institucional</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/sobre" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidade" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-white">Atendimento</h3>
            <ul className="space-y-2">
              <li className="text-sm text-[hsl(0,0%,65%)]">
                WhatsApp: (11) 99999-9999
              </li>
              <li className="text-sm text-[hsl(0,0%,65%)]">
                Email: contato@brasconceito.com.br
              </li>
              <li className="text-sm text-[hsl(0,0%,65%)]">
                Seg - Sex: 9h às 18h
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[hsl(0,0%,18%)] mt-8 pt-6 text-center text-xs text-[hsl(0,0%,50%)]">
          <p>&copy; {new Date().getFullYear()} Brás Conceito. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

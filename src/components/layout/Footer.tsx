import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle, Mail, MapPin } from 'lucide-react';

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
              <a href="https://www.instagram.com/bras.conceit.o_00/" target="_blank" rel="noopener noreferrer" className="text-[hsl(0,0%,65%)] hover:text-primary hover:scale-110 transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/brasconceito" target="_blank" rel="noopener noreferrer" className="text-[hsl(0,0%,65%)] hover:text-primary hover:scale-110 transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://wa.me/5511985459206" target="_blank" rel="noopener noreferrer" className="text-[hsl(0,0%,65%)] hover:text-primary hover:scale-110 transition-all duration-300">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-white">Institucional</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/termos" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidade" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/politica-trocas" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Política de Trocas
                </Link>
              </li>
              <li>
                <Link to="/politica-frete" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Política de Frete
                </Link>
              </li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-white">Ajuda</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/como-comprar" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Como Comprar
                </Link>
              </li>
              <li>
                <Link to="/prazos-e-entregas" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Prazos e Entregas
                </Link>
              </li>
              <li>
                <Link to="/perguntas-frequentes" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors link-underline inline-block">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-white">Atendimento</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://wa.me/5511985459206" target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  (11) 98545-9206
                </a>
              </li>
              <li>
                <a href="mailto:brasconceito@gmail.com" className="text-sm text-[hsl(0,0%,65%)] hover:text-primary transition-colors flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  brasconceito@gmail.com
                </a>
              </li>
              <li className="text-sm text-[hsl(0,0%,65%)] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                Rua Conselheiro Belisário, São Paulo - SP
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

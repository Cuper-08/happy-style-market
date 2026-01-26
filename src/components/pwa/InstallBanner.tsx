import { X, Download, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { Link } from 'react-router-dom';

export function InstallBanner() {
  const { showInstallBanner, isInstallable, isIOS, promptInstall, dismissPrompt } = usePWA();

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm animate-in">
      <div className="bg-card border border-border rounded-xl p-4 shadow-lg shadow-black/50">
        <button
          onClick={dismissPrompt}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Download className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              Instale o App
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isIOS 
                ? 'Adicione à tela inicial para uma experiência melhor'
                : 'Instale para acesso rápido e uso offline'
              }
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {isInstallable ? (
            <Button 
              onClick={promptInstall} 
              className="flex-1 h-9 text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar Agora
            </Button>
          ) : isIOS ? (
            <Link to="/instalar" className="flex-1">
              <Button className="w-full h-9 text-sm">
                <Share className="h-4 w-4 mr-2" />
                Ver Como Instalar
              </Button>
            </Link>
          ) : (
            <Link to="/instalar" className="flex-1">
              <Button className="w-full h-9 text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Como Instalar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

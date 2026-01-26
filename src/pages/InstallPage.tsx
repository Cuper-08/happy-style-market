import { Layout } from '@/components/layout/Layout';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Share, 
  MoreVertical, 
  Plus, 
  CheckCircle2,
  Smartphone,
  Wifi,
  Zap,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InstallPage() {
  const { isInstalled, isInstallable, isIOS, isAndroid, promptInstall } = usePWA();

  const benefits = [
    {
      icon: Smartphone,
      title: 'Acesso Rápido',
      description: 'Abra direto da tela inicial, como um app nativo',
    },
    {
      icon: Wifi,
      title: 'Funciona Offline',
      description: 'Navegue pelo catálogo mesmo sem internet',
    },
    {
      icon: Zap,
      title: 'Super Rápido',
      description: 'Carregamento instantâneo sem barra de navegação',
    },
    {
      icon: Bell,
      title: 'Notificações',
      description: 'Receba alertas de promoções e novidades',
    },
  ];

  if (isInstalled) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-3">App Instalado!</h1>
            <p className="text-muted-foreground mb-6">
              O Brás Conceito já está instalado no seu dispositivo. 
              Você pode encontrá-lo na sua tela inicial.
            </p>
            <Link to="/">
              <Button size="lg">Voltar para a Loja</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 pb-24">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-primary">BC</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Instale o Brás Conceito</h1>
            <p className="text-muted-foreground">
              Tenha a loja sempre à mão, direto na tela inicial do seu celular
            </p>
          </div>

          {/* Install Button (if available) */}
          {isInstallable && (
            <Button 
              onClick={promptInstall} 
              size="lg" 
              className="w-full mb-8 h-14 text-lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Instalar App
            </Button>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {benefits.map((benefit) => (
              <div 
                key={benefit.title}
                className="bg-card border border-border rounded-xl p-4 text-center"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-sm mb-1">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold mb-4 text-center">Como Instalar</h2>
            
            {isIOS ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Siga os passos abaixo no Safari:
                </p>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Toque no botão Compartilhar</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      O ícone <Share className="h-3 w-3 inline" /> na barra inferior do Safari
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Role e toque em "Adicionar à Tela de Início"</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      O ícone <Plus className="h-3 w-3 inline" /> com o texto abaixo
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Confirme tocando em "Adicionar"</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      No canto superior direito da tela
                    </p>
                  </div>
                </div>
              </div>
            ) : isAndroid ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Siga os passos abaixo no Chrome:
                </p>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Toque no menu</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      O ícone <MoreVertical className="h-3 w-3 inline" /> no canto superior direito
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Toque em "Instalar aplicativo"</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ou "Adicionar à tela inicial"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Confirme a instalação</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Toque em "Instalar" no popup
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  No navegador do seu celular:
                </p>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Abra o menu do navegador</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Geralmente os 3 pontos ou linhas no canto
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Procure por "Adicionar à tela inicial"</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ou "Instalar aplicativo"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Confirme a instalação</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pronto! O app estará na sua tela inicial
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Continuar no navegador →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

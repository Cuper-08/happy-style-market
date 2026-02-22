import { Layout } from '@/components/layout/Layout';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Phone className="h-8 w-8 text-primary" />
          Contato
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <a href="https://wa.me/5511985459206" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                (11) 98545-9206
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <a href="mailto:brasconceito@gmail.com" className="text-foreground hover:text-primary transition-colors">
                brasconceito@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Rua Conselheiro Belisário, São Paulo - SP</span>
            </div>

            <div className="pt-4">
              <a href="https://wa.me/5511985459206" target="_blank" rel="noopener noreferrer">
                <Button variant="premium" size="lg" className="gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Fale conosco pelo WhatsApp
                </Button>
              </a>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Nome</label>
              <input id="name" type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm" placeholder="Seu nome" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
              <input id="email" type="email" className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm" placeholder="seu@email.com" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefone</label>
              <input id="phone" type="tel" className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm" placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">Mensagem</label>
              <textarea id="message" rows={4} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm" placeholder="Sua mensagem..." />
            </div>
            <Button type="submit" className="w-full">Enviar</Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

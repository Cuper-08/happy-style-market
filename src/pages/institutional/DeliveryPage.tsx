import { Layout } from '@/components/layout/Layout';
import { Truck, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeliveryPage() {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          Prazos e Entregas
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2>🌍 Área de Entrega</h2>
            <p>Atendemos exclusivamente <strong>todo o território nacional (Brasil)</strong>.</p>
            <p>As entregas são realizadas via <strong>Correios</strong>, com total rastreabilidade.</p>
          </section>

          <hr />

          <section>
            <h2>⏳ Processamento e Prazo de Entrega</h2>
            <ul>
              <li><strong>Postagem</strong>: Seu pedido será postado em até <strong>3 dias úteis após a confirmação do pagamento</strong>.</li>
              <li><strong>Pronta Entrega</strong>: O prazo estimado varia de <strong>1 a 7 dias úteis</strong>, dependendo da sua localização.</li>
              <li><strong>Processamento</strong>: O processamento começa <strong>imediatamente após o pagamento confirmado</strong>, e você será notificado por e-mail com todas as informações.</li>
            </ul>
          </section>

          <hr />

          <section>
            <h2>🔍 Rastreamento</h2>
            <p>Após a postagem, você receberá por e-mail:</p>
            <ul>
              <li>📬 <strong>Código de rastreio</strong></li>
              <li>🛻 <strong>Link para acompanhar a entrega diretamente no site dos Correios</strong></li>
            </ul>
            <blockquote>
              Dica: verifique também sua caixa de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong> caso não encontre nosso e-mail.
            </blockquote>
          </section>

          <hr />

          <section>
            <h2>🧾 Taxas e Impostos</h2>
            <ul>
              <li>💸 <strong>Você não paga nada além do valor da sua compra.</strong></li>
              <li>Todas as <strong>taxas e impostos são pagos pela Brás Conceito no momento da postagem</strong>.</li>
              <li><strong>Pedidos fora do estado de São Paulo</strong>: <strong>zero risco de taxação</strong>.</li>
              <li><strong>Pedidos em São Paulo</strong>: em casos raros, pode haver cobrança, mas <strong>nós arcamos com 100% desse custo</strong> para garantir sua satisfação.</li>
            </ul>
          </section>

          <hr />

          <section>
            <h2>🤝 Compromisso com Você</h2>
            <h3>✅ Garantia de Entrega</h3>
            <p>Seu pedido é garantido: se houver qualquer atraso fora do prazo estimado, nosso time está pronto para resolver.</p>
            <h3>💬 Suporte ao Cliente</h3>
            <p>Dúvidas ou problemas com sua entrega? Nosso atendimento está à disposição para te ajudar rapidamente!</p>
          </section>

          <div className="pt-4">
            <a href="https://wa.me/5511985459206" target="_blank" rel="noopener noreferrer">
              <Button variant="premium" size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Fale conosco pelo WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

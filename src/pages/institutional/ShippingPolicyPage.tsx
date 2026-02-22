import { Layout } from '@/components/layout/Layout';
import { Package, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShippingPolicyPage() {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          Política de Frete
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <p>Nosso compromisso é oferecer uma entrega segura, clara e no menor tempo possível. Abaixo você encontra todas as informações sobre prazos, modalidades e regras de envio.</p>

          <section>
            <h2>📦 Tipos de produtos</h2>
            <ul>
              <li><strong>Produtos à pronta entrega (estoque nacional):</strong> enviados em até <strong>1 a 3 dias úteis</strong> após a confirmação do pagamento. Prazo de entrega: até <strong>7 dias úteis</strong> dependendo da sua região.</li>
            </ul>
          </section>

          <section>
            <h2>🚚 Formas de envio</h2>
            <p>Todos os pedidos são enviados via Correios ou transportadoras parceiras, com código de rastreio que é enviado por e-mail assim que o pedido é postado.</p>
            <p>Pedidos com mais de um item podem ser enviados separadamente, de acordo com o tipo de produto e fornecedor.</p>
          </section>

          <section>
            <h2>🌎 Áreas de cobertura</h2>
            <p>Enviamos para todo o Brasil. Certifique-se de preencher corretamente o seu endereço no momento da compra para evitar atrasos ou extravios.</p>
          </section>

          <section>
            <h2>⏳ Prazo de postagem</h2>
            <ul>
              <li>Pedidos com produtos à pronta entrega: postados em até <strong>3 dias úteis</strong>.</li>
            </ul>
          </section>

          <section>
            <h2>📍 Acompanhamento do pedido</h2>
            <p>Você receberá um e-mail com o código de rastreamento assim que seu pedido for despachado. Para acompanhar sua entrega, basta clicar no link de rastreio enviado.</p>
          </section>

          <section>
            <h2>⚠️ Informações importantes</h2>
            <ul>
              <li>Certifique-se de que haverá alguém no endereço para receber a encomenda.</li>
              <li>Após 3 tentativas de entrega, os Correios podem devolver o pedido — e não conseguimos reembolsar ou reenviar nesse caso.</li>
              <li>Não nos responsabilizamos por atrasos causados por greves, clima ou problemas operacionais dos Correios ou transportadora.</li>
              <li>Em caso de endereço incorreto ou incompleto, o reenvio será por conta do cliente.</li>
            </ul>
          </section>

          <section>
            <h2>📞 Precisa de ajuda com a entrega?</h2>
            <p>Se você tiver qualquer dúvida sobre seu frete ou rastreamento, entre em contato conosco.</p>
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

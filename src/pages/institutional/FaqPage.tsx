import { Layout } from '@/components/layout/Layout';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FaqPage() {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          Perguntas Frequentes
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2>💳 Quais formas de pagamento estão disponíveis?</h2>
            <p>Atualmente, aceitamos pagamentos via <strong>Pix, Boleto e Cartão em até 12x</strong>. É rápido, seguro e você ainda pode receber aprovação imediata do pedido.</p>
          </section>

          <section>
            <h2>🚚 Qual é o custo de envio?</h2>
            <p>Todos os envios são feitos via <strong>Correios</strong> (Sedex ou PAC). O valor do frete é calculado automaticamente no <strong>checkout</strong>, com base no seu CEP.</p>
          </section>

          <section>
            <h2>📦 Como são realizadas as entregas?</h2>
            <p>As entregas são feitas exclusivamente pelos <strong>Correios</strong>, garantindo rastreabilidade e segurança do seu pedido.</p>
          </section>

          <section>
            <h2>⏱️ Qual o prazo de entrega?</h2>
            <ul>
              <li><strong>Pronta entrega:</strong> em média <strong>até 7 dias úteis</strong>, dependendo da sua região.</li>
            </ul>
            <p>O prazo exato será informado no momento do checkout.</p>
          </section>

          <section>
            <h2>🔁 Qual o prazo para solicitar troca?</h2>
            <p>Você pode solicitar a troca em até <strong>7 dias corridos após o recebimento</strong> nos seguintes casos:</p>
            <ul>
              <li>Produto com modelo ou tamanho diferente do pedido;</li>
              <li>Produto com defeitos de fabricação ou avarias.</li>
            </ul>
          </section>

          <section>
            <h2>✅ Os produtos são originais?</h2>
            <p>Trabalhamos com <strong>réplicas 1:1 de alta qualidade</strong>, que oferecem o mesmo acabamento, tecnologia e conforto de um produto original.</p>
          </section>

          <section>
            <h2>🏬 De onde os produtos são enviados?</h2>
            <p>Todos os produtos de pronta entrega são enviados diretamente da <strong>nossa loja física em São Paulo - SP</strong>.</p>
          </section>

          <hr />

          <section>
            <h2>📨 Como acompanho o rastreio do meu pedido?</h2>
            <p>Assim que o pedido for coletado pelos Correios, você receberá um e-mail com o código de rastreio. Ele também pode ser acessado diretamente no seu painel de cliente (caso tenha conta).</p>
          </section>

          <section>
            <h2>🔒 É seguro comprar neste site?</h2>
            <p>Sim! Nosso site utiliza tecnologia de <strong>criptografia SSL</strong>, garantindo segurança total dos seus dados e transações.</p>
          </section>

          <section>
            <h2>📧 Não recebi e-mails da loja. O que fazer?</h2>
            <p>Verifique sua <strong>caixa de spam</strong> ou <strong>promoções</strong>. Se não encontrar, entre em contato conosco por e-mail ou WhatsApp para verificarmos juntos.</p>
          </section>

          <section>
            <h2>❓ Ainda tem dúvidas?</h2>
            <p>Se você não encontrou a resposta que procurava ou precisa de ajuda com seu pedido, entre em contato com o <strong>suporte da loja</strong>.</p>
            <p>Nossa equipe está pronta para te atender e resolver qualquer questão com agilidade e atenção!</p>
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

import { Layout } from '@/components/layout/Layout';
import { RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExchangePolicyPage() {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary" />
          Política de Trocas
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2>Trocas, Devoluções e Cancelamentos</h2>
            <ul>
              <li>Todos os produtos possuem <strong>garantia de recebimento</strong>.</li>
              <li>Em caso de extravio ou não recebimento, o cliente poderá optar pelo reenvio ou reembolso do valor total pago, após confirmação do ocorrido pela transportadora.</li>
            </ul>
          </section>

          <section>
            <h2>Quando posso solicitar troca?</h2>
            <p>Trocas são aceitas em casos de:</p>
            <ul>
              <li>Produto com defeito de fabricação;</li>
              <li>Produto divergente do pedido original.</li>
            </ul>
            <p>O prazo para solicitar troca é de até <strong>7 dias corridos após o recebimento</strong>.</p>
          </section>

          <section>
            <h2>Como solicitar troca ou devolução?</h2>
            <ul>
              <li>O produto deve estar sem uso, em perfeito estado, com a embalagem original e todos os acessórios/brindes (se aplicável).</li>
              <li>Entre em contato conosco pelo WhatsApp informando o número do pedido e o motivo da troca.</li>
              <li>Após o recebimento e análise do produto devolvido, enviaremos o novo item ou efetuaremos o reembolso, conforme o desejo do cliente.</li>
            </ul>
          </section>

          <section>
            <h2>Importante</h2>
            <ul>
              <li>Não realizamos cancelamentos de pedidos que já foram enviados.</li>
              <li>Caso o cliente desista da compra após a postagem, será necessário aguardar a entrega e seguir o processo de devolução para reembolso.</li>
            </ul>
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

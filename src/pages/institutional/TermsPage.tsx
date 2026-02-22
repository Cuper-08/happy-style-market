import { Layout } from '@/components/layout/Layout';
import { FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Termos e Condições de Uso
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <p>Prezado cliente,</p>
          <p>Para garantir uma experiência de compra segura, transparente e satisfatória, pedimos que leia atentamente os termos abaixo. Ao finalizar uma compra em nossa loja, você estará concordando com todas as condições aqui descritas.</p>
          <p>Caso tenha dúvidas, nossa equipe de atendimento está disponível para ajudar via WhatsApp.</p>

          <hr />

          <section>
            <h2>INFORMAÇÕES GERAIS</h2>
            <ul>
              <li>Todos os produtos disponíveis em nossa loja são enviados diretamente do nosso estoque nacional.</li>
              <li>O prazo de separação e envio do pedido é de <strong>1 a 3 dias úteis</strong> após a confirmação do pagamento.</li>
              <li>Trabalhamos com controle rigoroso de estoque, porém em casos excepcionais pode ocorrer a indisponibilidade de algum item. Nestes casos, oferecemos:
                <ul>
                  <li>A troca por outro produto de valor equivalente;</li>
                  <li>Ou o <strong>reembolso total</strong> do valor pago.</li>
                </ul>
              </li>
            </ul>
          </section>

          <hr />

          <section>
            <h2>ENTREGA</h2>
            <ul>
              <li>As entregas são realizadas via transportadoras ou Correios, dependendo da região e tipo de frete escolhido.</li>
              <li>O prazo de entrega varia conforme o CEP e é informado na finalização do pedido.</li>
              <li>É essencial que o endereço esteja completo e correto. Informações incorretas ou ausência de pessoas no local podem causar atrasos ou devolução do pedido.</li>
            </ul>
            <p><strong>Atenção:</strong> Após 3 tentativas de entrega sem sucesso, o pacote poderá retornar ao remetente. Em caso de retorno por erro no endereço ou ausência, o custo de reenvio será de responsabilidade do cliente.</p>
          </section>

          <hr />

          <section>
            <h2>ENVIO DE PEDIDOS COM MÚLTIPLOS ITENS</h2>
            <ul>
              <li>Em alguns casos, produtos comprados juntos podem ser enviados separadamente, dependendo da logística e disponibilidade em estoque.</li>
              <li>Cada envio terá seu próprio código de rastreamento.</li>
            </ul>
          </section>

          <hr />

          <section>
            <h2>TROCAS, DEVOLUÇÕES E CANCELAMENTOS</h2>
            <ul>
              <li>Todos os produtos possuem <strong>garantia de recebimento</strong>.</li>
              <li>Em caso de extravio ou não recebimento, o cliente poderá optar pelo reenvio ou reembolso do valor total pago, após confirmação do ocorrido pela transportadora.</li>
              <li>Trocas são aceitas em casos de:
                <ul>
                  <li>Produto com defeito de fabricação;</li>
                  <li>Produto divergente do pedido original.</li>
                </ul>
              </li>
            </ul>
            <p>Para solicitar troca ou devolução:</p>
            <ul>
              <li>O produto deve estar sem uso, em perfeito estado, com a embalagem original e todos os acessórios/brindes (se aplicável).</li>
              <li>Após o recebimento e análise do produto devolvido, enviaremos o novo item ou efetuaremos o reembolso, conforme o desejo do cliente.</li>
            </ul>
            <p><strong>Importante:</strong></p>
            <ul>
              <li>Não realizamos cancelamentos de pedidos que já foram enviados.</li>
              <li>Caso o cliente desista da compra após a postagem, será necessário aguardar a entrega e seguir o processo de devolução para reembolso.</li>
            </ul>
          </section>

          <hr />

          <p>Agradecemos por escolher nossa loja. Nosso compromisso é oferecer qualidade, transparência e total suporte durante toda a sua jornada de compra.</p>

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

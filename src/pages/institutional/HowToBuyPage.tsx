import { Layout } from '@/components/layout/Layout';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowToBuyPage() {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          Como Comprar
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2>1. Escolha seus produtos</h2>
            <ul>
              <li>Navegue pelo site e clique no item que deseja.</li>
              <li>Selecione <strong>modelo, cor e tamanho</strong> (se aplicável).</li>
              <li>Clique em <strong>"Adicionar ao carrinho"</strong>.</li>
            </ul>
          </section>

          <section>
            <h2>2. Finalize seu carrinho</h2>
            <ul>
              <li>Você pode continuar comprando ou clicar em <strong>"Iniciar compra"</strong> para finalizar.</li>
            </ul>
          </section>

          <section>
            <h2>3. Preencha seus dados</h2>
            <ul>
              <li>Informe seu <strong>nome, e-mail e telefone</strong>.</li>
              <li>Clique em <strong>"Continuar"</strong>.</li>
            </ul>
          </section>

          <section>
            <h2>4. Informe o endereço de entrega</h2>
            <ul>
              <li>Preencha com cuidado todos os campos: rua, número, CEP, cidade e estado.</li>
              <li>Confirme e clique em <strong>"Continuar"</strong>.</li>
            </ul>
          </section>

          <section>
            <h2>5. Escolha o frete</h2>
            <ul>
              <li>Selecione a opção de envio que preferir (Sedex ou PAC via Correios).</li>
              <li>Clique em <strong>"Continuar"</strong>.</li>
            </ul>
          </section>

          <section>
            <h2>6. Selecione o método de pagamento</h2>
            <ul>
              <li>Atualmente aceitamos <strong>Pix</strong>.</li>
              <li>Escolha a opção e clique em <strong>"Continuar"</strong>.</li>
            </ul>
          </section>

          <section>
            <h2>7. Confirme sua compra</h2>
            <ul>
              <li>Revise todas as informações do pedido: produtos, frete, endereço e pagamento.</li>
              <li>Clique em <strong>"Confirmar compra"</strong>.</li>
            </ul>
          </section>

          <section>
            <h2>8. Acompanhe por e-mail</h2>
            <ul>
              <li>Após a confirmação, você receberá um e-mail com os <strong>detalhes da sua compra</strong>.</li>
              <li>Assim que o pagamento for aprovado, enviaremos outro e-mail com o <strong>comprovante e o código de rastreio</strong>.</li>
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

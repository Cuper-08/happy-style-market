import { Layout } from '@/components/layout/Layout';
import { Shield, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Política de Privacidade
        </h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <p>Nossa loja, pessoa jurídica de direito privado leva a sua privacidade a sério e zela pela segurança e proteção de dados de todos os seus clientes, parceiros, fornecedores e usuários do site com o nosso domínio e qualquer outro site, loja ou aplicativo operado pelo lojista.</p>

          <p>Esta Política de Privacidade destina-se a informá-lo sobre o modo como nós utilizamos e divulgamos informações coletadas em suas visitas à nossa loja e em mensagens que trocamos com você.</p>

          <p>Esta Política de Privacidade aplica-se somente a informações coletadas por meio da loja.</p>

          <p className="uppercase text-sm">AO ACESSAR A LOJA, ENVIAR COMUNICAÇÕES OU FORNECER QUALQUER TIPO DE DADO PESSOAL, VOCÊ DECLARA ESTAR CIENTE COM RELAÇÃO AOS TERMOS AQUI PREVISTOS E DE ACORDO COM A POLÍTICA DE PRIVACIDADE, A QUAL DESCREVE AS FINALIDADES E FORMAS DE TRATAMENTO DE SEUS DADOS PESSOAIS QUE VOCÊ DISPONIBILIZAR NA LOJA.</p>

          <p>Esta Política de Privacidade fornece uma visão geral de nossas práticas de privacidade e das escolhas que você pode fazer, bem como direitos que você pode exercer em relação aos Dados Pessoais tratados por nós. Se você tiver alguma dúvida sobre o uso de Dados Pessoais, entre em contato com nosso email.</p>

          <p>Além disso, a Política de Privacidade não se aplica a quaisquer aplicativos, produtos, serviços, site ou recursos de mídia social de terceiros que possam ser oferecidos ou acessados por meio da loja. O acesso a esses links fará com que você deixe o nosso site e poderá resultar na coleta ou compartilhamento de informações sobre você por terceiros. Nós não controlamos, endossamos ou fazemos quaisquer representações sobre sites de terceiros ou suas práticas de privacidade, que podem ser diferentes das nossas. Recomendamos que você revise a política de privacidade de qualquer site com o qual você interaja antes de permitir a coleta e o uso de seus Dados Pessoais.</p>

          <p>Caso você nos envie Dados Pessoais referentes a outras pessoas físicas, você declara ter a competência para fazê-lo e declara ter obtido o consentimento necessário para autorizar o uso de tais informações nos termos desta Política de Privacidade.</p>

          <hr />

          <h3>Seção 1 - Definições</h3>
          <p>Para os fins desta Política de Privacidade:</p>
          <ol>
            <li>"Dados Pessoais": significa qualquer informação que, direta ou indiretamente, identifique ou possa identificar uma pessoa natural, como por exemplo, nome, CPF, data de nascimento, endereço IP, dentre outros;</li>
            <li>"Dados Pessoais Sensíveis": significa qualquer informação que revele, em relação a uma pessoa natural, origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico;</li>
            <li>"Tratamento de Dados Pessoais": significa qualquer operação efetuada no âmbito dos Dados Pessoais, por meio de meios automáticos ou não, tal como a recolha, gravação, organização, estruturação, armazenamento, adaptação ou alteração, recuperação, consulta, utilização, divulgação por transmissão, disseminação ou, alternativamente, disponibilização, harmonização ou associação, restrição, eliminação ou destruição. Também é considerado Tratamento de Dados Pessoais qualquer outra operação prevista nos termos da legislação aplicável;</li>
            <li>"Leis de Proteção de Dados": significa todas as disposições legais que regulam o Tratamento de Dados Pessoais, incluindo, porém sem se limitar, a Lei nº 13.709/18, Lei Geral de Proteção de Dados Pessoais ("LGPD").</li>
          </ol>

          <hr />

          <h3>Seção 2 - Uso de Dados Pessoais</h3>
          <p>Coletamos e usamos Dados Pessoais para gerenciar seu relacionamento conosco e melhor atendê-lo quando você estiver adquirindo produtos e/ou serviços na loja, personalizando e melhorando sua experiência. Exemplos de como usamos os dados incluem:</p>
          <ol>
            <li>Viabilizar que você adquira produtos e/ou serviços na loja;</li>
            <li>Para confirmar ou corrigir as informações que temos sobre você;</li>
            <li>Para enviar informações que acreditamos ser do seu interesse;</li>
            <li>Para personalizar sua experiência de uso da loja;</li>
            <li>Para entrarmos em contato por um número de telefone e/ou endereço de e-mail fornecido.</li>
          </ol>

          <hr />

          <h3>Seção 3 - Não fornecimento de Dados Pessoais</h3>
          <p>Não há obrigatoriedade em compartilhar os Dados Pessoais que solicitamos. No entanto, se você optar por não os compartilhar, em alguns casos, não poderemos fornecer a você acesso completo à loja, alguns recursos especializados ou ser capaz de prestar a assistência necessária ou, ainda, viabilizar a entrega do produto ou prestar o serviço contratado por você.</p>

          <hr />

          <h3>Seção 4 - Dados coletados</h3>
          <p>O público em geral poderá navegar na loja sem necessidade de qualquer cadastro e envio de Dados Pessoais. No entanto, algumas das funcionalidades da loja poderão depender de cadastro e envio de Dados Pessoais como concluir a compra/contratação do serviço e/ou a viabilizar a entrega do produto/prestação do serviço por nós.</p>
          <p>No contato a loja, nós podemos coletar:</p>
          <ol>
            <li>Dados de contato: nome, sobrenome, número de telefone, endereço, cidade, estado e endereço de e-mail;</li>
            <li>Informações enviadas: informações que você envia via formulário (dúvidas, reclamações, sugestões, críticas, elogios etc.).</li>
          </ol>
          <p>Na navegação geral na loja, nós poderemos coletar:</p>
          <ol>
            <li>Dados de localização: dados de geolocalização quando você acessa a loja;</li>
            <li>Preferências: informações sobre suas preferências e interesses em relação aos produtos/serviços;</li>
            <li>Dados de navegação na loja: informações sobre suas visitas e atividades, incluindo o conteúdo com os quais você visualiza e interage, informações sobre o navegador e o dispositivo que você está usando, seu endereço IP, sua localização;</li>
            <li>Dados anônimos ou agregados: respostas anônimas para pesquisas ou informações anônimas e agregadas sobre como a loja é usufruída;</li>
            <li>Outras informações que podemos coletar: informações que não revelem especificamente a sua identidade ou que não são diretamente relacionadas a um indivíduo.</li>
          </ol>
          <p>Nós não coletamos Dados Pessoais Sensíveis.</p>

          <hr />

          <h3>Seção 5 - Compartilhamento de Dados Pessoais com terceiros</h3>
          <p>Nós poderemos compartilhar seus Dados Pessoais:</p>
          <ol>
            <li>Com a(s) empresa(s) parceira(s) que você selecionar ou optar em enviar os seus dados, bem como com provedores de serviços ou parceiros para gerenciar ou suportar certos aspectos de nossas operações comerciais em nosso nome;</li>
            <li>Com terceiros, com o objetivo de nos ajudar a gerenciar a loja;</li>
            <li>Com terceiros, caso ocorra qualquer reorganização, fusão, venda, joint venture, cessão, transmissão ou transferência de toda ou parte da nossa empresa.</li>
          </ol>

          <hr />

          <h3>Seção 6 - Transferências internacionais de dados</h3>
          <p>Dados Pessoais e informações de outras naturezas coletadas por nós podem ser transferidos ou acessados por entidades pertencentes ao grupo corporativo das empresas parceiras em todo o mundo de acordo com esta Política de Privacidade.</p>

          <hr />

          <h3>Seção 7 - Coleta automática de Dados Pessoais</h3>
          <p>Quando você visita a loja, ela pode armazenar ou recuperar informações em seu navegador, principalmente na forma de cookies, que são arquivos de texto contendo pequenas quantidades de informação. Essas informações podem ser sobre você, suas preferências ou seu dispositivo e são usadas principalmente para que a loja funcione como você espera.</p>

          <hr />

          <h3>Seção 8 - Categorias de cookies</h3>
          <p>Os cookies utilizados na nossa loja estão de acordo com os requisitos legais e são enquadrados nas seguintes categorias:</p>
          <ol>
            <li><strong>Estritamente necessários:</strong> permitem que você navegue pelo site e desfrute de recursos essenciais com segurança;</li>
            <li><strong>Desempenho:</strong> coletam informações de forma codificada e anônima relacionadas à nossa loja;</li>
            <li><strong>Funcionalidade:</strong> utilizados para lembrar definições de preferências do usuário;</li>
            <li><strong>Publicidade:</strong> utilizamos cookies com o objetivo de criar campanhas segmentadas.</li>
          </ol>

          <hr />

          <h3>Seção 9 - Direitos do Usuário</h3>
          <p>Você pode, a qualquer momento, requerer: (i) confirmação de que seus Dados Pessoais estão sendo tratados; (ii) acesso aos seus Dados Pessoais; (iii) correções a dados incompletos, inexatos ou desatualizados; (iv) anonimização, bloqueio ou eliminação de dados desnecessários; (v) portabilidade de Dados Pessoais a outro prestador de serviços; (vi) eliminação de Dados Pessoais tratados com seu consentimento; (vii) informações sobre as entidades às quais seus Dados Pessoais tenham sido compartilhados; (viii) informações sobre a possibilidade de não fornecer o consentimento e sobre as consequências da negativa; e (ix) revogação do consentimento.</p>

          <hr />

          <h3>Seção 10 - Segurança dos Dados Pessoais</h3>
          <p>Buscamos adotar as medidas técnicas e organizacionais previstas pelas Leis de Proteção de Dados adequadas para proteção dos Dados Pessoais na nossa organização. Infelizmente, nenhuma transmissão ou sistema de armazenamento de dados tem a garantia de serem 100% seguros.</p>

          <hr />

          <h3>Seção 11 - Links de hipertexto para outros sites e redes sociais</h3>
          <p>A Loja poderá, de tempos a tempos, conter links de hipertexto que redirecionará você para sites das redes dos nossos parceiros, anunciantes, fornecedores etc. Se você clicar em um desses links para qualquer um desses sites, lembre-se que cada site possui as suas próprias práticas de privacidade e que não somos responsáveis por essas políticas.</p>

          <hr />

          <h3>Seção 12 - Atualizações desta Política de Privacidade</h3>
          <p>Se modificarmos nossa Política de Privacidade, publicaremos o novo texto na loja, com a data de revisão atualizada. Podemos alterar esta Política de Privacidade a qualquer momento.</p>

          <hr />

          <h3>Seção 13 - Encarregado do tratamento dos Dados Pessoais</h3>
          <p>Caso pretenda exercer qualquer um dos direitos previstos nesta Política de Privacidade e/ou nas Leis de Proteção de Dados, ou resolver quaisquer dúvidas relacionadas ao Tratamento de seus Dados Pessoais, favor contatar-nos em nosso email: <a href="mailto:brasconceito@gmail.com">brasconceito@gmail.com</a>.</p>

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

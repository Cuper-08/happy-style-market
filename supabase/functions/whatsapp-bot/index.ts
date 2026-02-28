import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bot-token",
};

const APP_URL = "https://happy-style-market.lovable.app";

const STOPWORDS = new Set([
  "tem", "voce", "você", "quero", "qual", "como", "onde", "quando", "para", "esse", "essa",
  "isso", "aqui", "ali", "uma", "uns", "umas", "que", "com", "sem", "por", "dos", "das",
  "nos", "nas", "mais", "muito", "pode", "queria", "gostaria", "preciso", "olha",
  "boa", "bom", "tarde", "noite", "dia", "oi", "ola", "olá", "obrigado", "obrigada",
  "tudo", "bem", "sim", "nao", "não", "por", "favor", "the", "and", "meu", "minha",
  "seu", "sua", "dele", "dela", "ter", "ser", "esta", "está", "são", "sao", "foi",
]);

const EVOLUTION_URL = "https://evo.hsbmarketing.com.br";
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "BuggyPro";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";
const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY") || "";

// Número do vendedor humano para transferência (WhatsApp com DDD)
const VENDEDOR_NUMBER = Deno.env.get("VENDEDOR_NUMBER") || "5511913357383";

// Palavras-chave que indicam pedido de transferência para humano
const TRANSFER_KEYWORDS = [
  'falar com humano', 'falar com algu', 'quero falar com',
  'chamada de vídeo', 'chamada de video', 'vídeo chamada', 'video chamada',
  'videochamada', 'videochamada', 'falar com o dono', 'falar com vendedor',
  'atendente humano', 'pessoa real', 'pessoa de verdade',
  'me passa', 'transferir atendimento', 'falar com a equipe'
];

// Conhecimento base dos produtos (atualizado com dados reais do banco)
const PRODUTOS_CONHECIMENTO = `
📦 PRODUTOS QUE VENDEMOS (CONHECIMENTO COMPLETO):

👟 TÊnis (867+ modelos | R$250 a R$2.500)
  - Marcas: Amiri, Louis Vuitton, Nike, Adidas, Jordan, Mizuno, Asics, Fila, New Balance, Gucci, Prada e mais
  - Exemplos de destaque:
    * TêNis Amiri MA-1 → R$2.500
    * TêNis Louis Vuitton → R$2.100
    * Nike Air Jordan, Adidas, Mizuno, Asics, Fila, New Balance → R$250 em diante
  - Temos têNis masculinos e femininos, diversos modelos e cores

👟 TÊnis INFANTIL (81 modelos | R$600 a R$800)
  - Modelos: Nike Air Jordan 1, Travis Scott x Air Jordan 1, Air Jordan 3 Retrô, Jordan Jumpman Jack, Nike Jordan Low
  - Preco fixo: R$800 a maioria dos modelos

👜 BOLSAS (32 modelos | R$1.100 a R$1.800)
  - Marcas: Louis Vuitton, Gucci, Prada, Dior
  - Exemplos:
    * Pochete Prada → R$1.800
    * Bolsa Gucci Messenger GG Canvas → R$1.800
    * Gucci GG Supreme Belt Bag → R$1.800
    * Bolsa Louis Vuitton Neverfull Monogram → R$1.700
    * Bolsa Louis Vuitton Keepall → R$1.700
    * Bolsa Dior → R$1.600
    * Bolsa Prada Nylon Preta → R$1.600
    * Bolsa Mini Gucci (várias cores) → R$1.500
    * Bolsa Coussin PM Louis Vuitton → R$1.600
👡 CHINELOS (10 modelos | R$900 a R$1.000)
  - Louis Vuitton Chinelo Slide (branco, preto, colorido) → R$1.000
  - Amiri Chinelo White → R$900 | Amiri Preto e Branco → R$900

🌍 IMPORTADOS PREMIUM (29 modelos | R$1.000 a R$2.500)
  - Mochila Prada Nylon → R$2.500
  - Mochila Louis Vuitton Christopher → R$2.500
  - Louis Vuitton x Air Force 1 (Virgil Abloh - diversas cores) → R$1.800
  - Alexander McQueen Prata/Preto → R$1.800
  - Louis Vuitton Runner Tatic → R$1.800
  - Gucci x Disney Donald Duck Duffle → R$2.000
  - New Gucci Off White / Bege → R$1.300

🧢 BONÉS (45 modelos | R$250 fixo)
  - New Era (azul, bege/preto, rosa, branco, verde, Mickey) → R$250
  - Gucci → R$250 | Prada → R$250 | Louis Vuitton → R$250 | Miu Miu → R$250

🧦 MEIAS (102 modelos | R$50 cada)
  - Nike, Adidas, Jordan, Mizuno → R$50 | Canalé, tobinho, curta

🧳 MALAS DE VIAGEM (| R$4.500)
  - Mala de Bordo Louis Vuitton MD29
`;

const SYSTEM_PROMPT_BASE = `Você é a Luna, vendedora simpática e atenciosa da Brás Conceito.

🏪 SOBRE A LOJA BRÁS CONCEITO (MUITO IMPORTANTE - MEMORIZE):
- LOJA FÍSICA: R. Conselheiro Belísario, 41 - Brás, São Paulo
  Google Maps: https://share.google/4D4ge33FoKaNMvU2
- Modalidade: ATACADO E VAREJO (vendemos para pessoa física E revendedor)
- Horário: 07:00 às 16:00 (Segunda a Sábado)
- Instagram: https://www.instagram.com/bras.conceit.o_00/
- App Online: ${APP_URL} (catálogo completo com fotos e preços)
- Pagamento: Cartão de Crédito parcelado e PIX ✅
- Atacado: a partir de 6 peças tem desconto especial 💰
- A loja FÍSICA existe e funciona normalmente! Clientes podem ir presencialmente.

${PRODUTOS_CONHECIMENTO}

PERSONALIDADE:
- Simpática, jovem, brasileira. Emojis com moderação 😊
- Fale como uma amiga acessível, nunca robôtica
- Mensagens curtas e diretas (WhatsApp, não e-mail!)
- Faça perguntas para entender o que o cliente precisa
- Use o nome do cliente ("Nome do WhatsApp" fornecido no contexto) de vez em quando para criar um clima de amizade (ex: na primeira mensagem ou na despedida).

REGRAS DE OURO:

1. LOJA FÍSICA: Quando perguntarem se tem loja, diga SIM! Fornece o endereço e horário. NÃO diga que só é online.

2. ATACADO/VAREJO: Atendemos os dois! Varejo = qualquer cliente. Atacado = a partir de 6 peças com desconto.

3. APP: Só envie o link ${APP_URL} quando o cliente pedir catálogo/fotos/preços ou quiser comprar. Ao enviar diga: "não ocupa memória, pode parcelar no Cartão e aceita PIX!"

4. HISTÓRICO: Se já cumprimentou antes, NÃO repita 'Oi'. Responda direto.

5. PRODUTOS E LINKS: Com base no conhecimento acima, NUNCA diga que não temos um produto que está na lista. Em caso de dúvida, diga que pode verificar com a equipe. REGRA CRÍTICA SOBRE LINKS: NUNCA invente ou crie URLs de produtos da sua cabeça. Se a Busca Inteligente não retornou o link exato do produto, envie APENAS o link da categoria correspondente ou o link geral da loja. NENHUM LINK INVENTADO É PERMITIDO.

6. TRANSFERÊNCIA: Se o cliente mencionar chamada de vídeo, falar com humano/vendedor/dono/pessoa, responda APENAS:
[TRANSFERIR_HUMANO:NOME_CLIENTE:NECESSIDADE]
Só isso, o sistema faz o resto.

7. TAMANHO: Máx 3 parágrafos por resposta.

8. INSTAGRAM: Se o cliente pedir o Instagram, envie SEMPRE o link clicável: https://www.instagram.com/bras.conceit.o_00/ de forma organizada, simpática e encoraje o cliente a nos seguir!`;

async function sendEvolutionMessage(number: string, text: string, instance: string): Promise<number> {
  try {
    const res = await fetch(`${EVOLUTION_URL}/message/sendText/${instance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
      body: JSON.stringify({ number, text }),
    });
    const status = res.status;
    console.log(`[LUNA] Evolution -> ${number}: status=${status}`);
    return status;
  } catch (err) {
    console.error('[LUNA] Erro Evolution:', err);
    return 500;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const expectedToken = Deno.env.get("WHATSAPP_BOT_TOKEN");
  const providedToken = req.headers.get("x-bot-token");

  // Se o token foi configurado nas variáveis de ambiente, obriga que venha no header
  // DESATIVADO temporariamente pois o Webhook da Evolution API não envia headers customizados
  // if (expectedToken && providedToken !== expectedToken) {
  //   console.warn("[LUNA] Bloqueado: x-bot-token inválido ou não fornecido.");
  //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
  //     status: 401,
  //     headers: { ...corsHeaders, "Content-Type": "application/json" }
  //   });
  // }

  try {
    const body = await req.json();
    const data = body.data || {};
    const key = data.key || {};
    const message = data.message || {};

    // Log detalhado para entender exatamente o payload recebido do Webhook
    console.log("[WEBHOOK] Recebido:", JSON.stringify(body).slice(0, 300));

    const remoteJid: string = key.remoteJid || '';
    const fromMe: boolean = key.fromMe || false;
    const pushName: string = data.pushName || 'Cliente';
    const instance: string = body.instance || EVOLUTION_INSTANCE;
    const messageText: string = (
      message.conversation || message.extendedTextMessage?.text || ''
    ).trim();

    // 1. Ignorar auto-respostas (fromMe), grupos, status, e sem texto
    if (fromMe) return new Response(JSON.stringify({ skipped: 'fromMe' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (remoteJid.includes('@g.us') || remoteJid.includes('@broadcast')) return new Response(JSON.stringify({ skipped: 'group/status' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!messageText) return new Response(JSON.stringify({ skipped: 'empty' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // formatação de telefone e limpeza
    const phone = remoteJid.replace('@s.whatsapp.net', '');
    const msgLower = messageText.toLowerCase();

    // 2. Transferência para humano
    const querTransferir = TRANSFER_KEYWORDS.some(k => msgLower.includes(k));
    if (querTransferir) {
      const internalMsg = `🚨 *TRANSFERÊNCIA SOLICITADA* 🚨\nCliente: ${pushName} (${phone})\nMensagem: "${messageText}"\nLink WhatsApp: wa.me/${phone}`;
      console.log(`[TRANSFER] Acionado para ${phone}`);

      // Envia alerta pro Lojista
      await sendEvolutionMessage(VENDEDOR_NUMBER, internalMsg, instance);
      // Envia reposta da Luna avisando
      await sendEvolutionMessage(phone, "Estou transferindo você para um dos nossos vendedores. Já, já alguém te atende! 😊", instance);

      return new Response(JSON.stringify({ reply: "transferido" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3. Salva a msg do usuario
    await supabase.from("chat_history").insert([
      { contact_phone: phone, role: "user", message: messageText },
    ]);

    // ==============================================
    // MELHORIAS INTELIGENTES DO LOVABLE INCORPORADAS
    // ==============================================

    // A. Busca Dinâmica de Produtos por Palavras-Chave
    const keywords = messageText
      .toLowerCase()
      .split(/\s+/)
      .filter((w: string) => w.length >= 3 && !STOPWORDS.has(w));

    let searchResults: any[] = [];
    if (keywords.length > 0) {
      const orFilter = keywords
        .map((k: string) => `title.ilike.%${k}%,category.ilike.%${k}%`)
        .join(",");
      const { data } = await supabase
        .from("products")
        .select("title, slug, price_retail_display, category")
        .or(orFilter)
        .limit(8);
      searchResults = data || [];
    }

    // B. Contexto de Pedidos do Usuário Ativo
    const cleanPhone = phone.replace(/\D/g, "").slice(-8); // extrai ultimos 8 digitos
    let userOrdersInfo = "O usuário ainda não tem pedidos recentes ou não foi encontrado cadastro ativo.";
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, full_name") // Tenta name em full_name
      .ilike("phone", `%${cleanPhone}%`)
      .limit(1)
      .single();

    if (profile) {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, status, total, tracking_code")
        .eq("user_id", profile.user_id)
        .order("created_at", { ascending: false })
        .limit(2);

      if (orders && orders.length > 0) {
        userOrdersInfo = `Contexto de Pedidos de ${profile.full_name || 'Cliente'}: ${orders.map((o: any) => `ID: ${o.id.slice(0, 6)} - Status: ${o.status} - Total: R$ ${o.total} - Rastreio: ${o.tracking_code || 'N/A'}`).join(' | ')}`;
      } else {
        userOrdersInfo = `${profile.full_name || 'Cliente'} está cadastrado, mas sem pedidos finalizados.`;
      }
    }
    // ==============================================

    // 4. Busca histórico de conversas passadas na mesma thread
    const { data: chatHistory } = await supabase
      .from("chat_history")
      .select("role, message")
      .eq("contact_phone", phone)
      .order("created_at", { ascending: false })
      .limit(6);

    // 5. Gera prompt para OpenAI com a Inteligência mesclada
    const messages = [];

    // Injeção de Buscas e Pedidos na mente da Luna
    const searchContext = searchResults.length > 0
      ? `\n\n🔎 Produtos encontrados na Busca Inteligente (a cliente tem interesse neles): ${searchResults.map(p => `${p.title} (${p.category}) - ${p.price_retail_display} - Link: ${APP_URL}/produto/${encodeURIComponent(p.slug)}`).join(' | ')}`
      : "";

    const categoriesList = `\n\n📌 LINKS RÁPIDOS DAS CATEGORIAS DA LOJA:
- Tênis: ${APP_URL}/categoria/tenis
- Bolsas: ${APP_URL}/categoria/bolsas
- Bonés: ${APP_URL}/categoria/bone
- Meias: ${APP_URL}/categoria/meias
- Chinelos: ${APP_URL}/categoria/chinelo
- Importados: ${APP_URL}/categoria/importados
- Tênis Infantil: ${APP_URL}/categoria/tenis-infantil
- Malas: ${APP_URL}/categoria/malas
- Cintos: ${APP_URL}/categoria/cintos`;

    const extraInstruction = searchResults.length > 0
      ? `\n\nInstrução Extra: Se o cliente perguntou de produto e o sistema encontrou resultados, mostre MUITO ENTUSIASMO sobre as opções encontradas e APRESENTE OS LINKS EXATOS DOS PRODUTOS NO CHAT. (NÃO INVENTE LINKS E NÃO MUDE OS LINKS FORNECIDOS).`
      : `\n\nInstrução Extra: A busca inteligente não encontrou modelos exatos desta vez. Se o cliente pediu algo que corresponda a uma das nossas categorias (como Chinelos, Bonés, Tênis, etc), NUNCA invente um link de produto! Diga com entusiasmo que temos várias opções e envie APENAS o link da CATEGORIA correspondente usando os LINKS RÁPIDOS acima. NENHUM LINK INVENTADO DE PRODUTO É PERMITIDO.`;

    const currentClientContext = `Nome do WhatsApp: ${pushName}\nTelefone: ${phone}\n`;

    const SYSTEM_PROMPT_ENRIQUECIDO = SYSTEM_PROMPT_BASE + `\n\nCONTEXTO DO CLIENTE ATUAL:\n${currentClientContext}${userOrdersInfo}${searchContext}${categoriesList}${extraInstruction}`;

    messages.push({ role: "system", content: SYSTEM_PROMPT_ENRIQUECIDO });

    if (chatHistory && chatHistory.length > 0) {
      const past = chatHistory.reverse();
      past.pop(); // Remove the current message that was just inserted
      for (const msg of past) {
        messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.message });
      }
    }
    messages.push({ role: "user", content: messageText });

    // 6. Chama OpenAI
    let reply = "";
    if (!OPENAI_KEY) {
      reply = "Luna está configurando o cérebro! (Chave API faltante).";
    } else {
      console.log(`[OPENAI] Gerando resposta para ${phone}...`);
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messages,
          temperature: 0.7,
          max_tokens: 300,
        })
      });

      if (!aiResponse.ok) {
        throw new Error("Erro OpenAI: " + await aiResponse.text());
      }
      const aiData = await aiResponse.json();
      reply = aiData.choices[0].message.content.trim();
    }

    // 7. Salva a resposta gerada
    await supabase.from("chat_history").insert([
      { contact_phone: phone, role: "assistant", message: reply },
    ]);

    // 8. Trata Retorno Especial da IA (Transferência decidida pela IA)
    if (reply.includes("[TRANSFERIR_HUMANO")) {
      const internalMsg = `🚨 *TRANSFERÊNCIA SOLICITADA PELA IA* 🚨\nCliente: ${pushName} (${phone})\nMensagem Original: "${messageText}"\nLink WhatsApp: wa.me/${phone}`;
      await sendEvolutionMessage(VENDEDOR_NUMBER, internalMsg, instance);
      const friendlyReply = "Já repassei para um dos nossos vendedores atender você por aqui! Logo menos ele manda um oizinho 😊";
      await sendEvolutionMessage(phone, friendlyReply, instance);
      return new Response(JSON.stringify({ reply: "transferido via prompt" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 9. Envia a resposta Final da IA pro cliente via Evolution
    console.log(`[LUNA] Respondendo para ${phone}: ${reply.slice(0, 50)}...`);
    const evoStatus = await sendEvolutionMessage(phone, reply, instance);

    return new Response(JSON.stringify({ reply, evoStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("whatsapp-bot erro crítico:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

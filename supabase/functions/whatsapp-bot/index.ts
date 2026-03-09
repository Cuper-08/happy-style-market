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

const PRODUTOS_CONHECIMENTO = `
🏪 ESTRUTURA DE CATEGORIAS DA LOJA (Use essas URLs para direcionar o cliente):
- 👟 Tênis: ${APP_URL}/categoria/tenis (Inclui: Linha Premium, Grifes Importadas, Infantil) 
- 👜 Bolsas: ${APP_URL}/categoria/bolsas
- 🧳 Malas de Viagem: ${APP_URL}/categoria/malas
- 🧢 Bonés: ${APP_URL}/categoria/bone
- 🧦 Meias: ${APP_URL}/categoria/meias
- 👡 Chinelos: ${APP_URL}/categoria/chinelo
- ⌚ Acessórios: ${APP_URL}/categoria/acessorios

REGRAS DE VENDAS E ESTOQUE:
- TUDO DEPENDE DA BUSCA: Apenas afirme que temos em estoque se o produto aparecer em "Produtos encontrados na Busca Inteligente" no contexto abaixo.
- SE NÃO TIVER EXATAMENTE: Sugira produtos semelhantes que vieram na busca.
- SE A BUSCA VIER VAZIA E FOR SOBRE UMA DA CATEGORIAS ACIMA: Diga educadamente que não encontrou o modelo exato na busca imediata, mas ENVIE O LINK DA CATEGORIA correspondente para o cliente explorar. (Exemplo: "Não localizei aqui agora, mas dê uma olhadinha nos nossos modelos no site: URL_AQUI").
- NÃO INVENTE PREÇOS: Preços ou produtos fora do Contexto gerado não devem ser precificados rigidamente.
- SEMPRE envie o Link do produto retornado na busca para o cliente. O Link é fundamental para ele acessar o App e comprar.
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

5. PRODUTOS: Com base no conhecimento acima, NUNCA diga que não temos um produto que está na lista. Em caso de dúvida, diga que pode verificar com a equipe.

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
      // Tenta busca combinada (AND entre as palavras-chave na mesma query)
      let queryReq = supabase
        .from("products")
        .select("title, slug, price_retail_display, category");
      
      for (const k of keywords) {
         queryReq = queryReq.or(`title.ilike.%${k}%,category.ilike.%${k}%,description.ilike.%${k}%`);
      }
      
      let { data } = await queryReq.limit(5);

      // Se a busca estrita não encontrou, faz um fallback mais solto (OR global em qualquer palavra-chave)
      if (!data || data.length === 0) {
        const orGlobal = keywords.map((k: string) => `title.ilike.%${k}%,category.ilike.%${k}%`).join(",");
        const fallbackRes = await supabase
          .from("products")
          .select("title, slug, price_retail_display, category")
          .or(orGlobal)
          .limit(8);
        data = fallbackRes.data;
      }

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
      ? `\n\nInstrução Extra: Se o cliente perguntou de produto e o sistema encontrou resultados, mostre MUITO ENTUSIASMO sobre as opções encontradas e APRESENTE OS LINKS DOS PRODUTOS NO CHAT AGORA MESMO.`
      : `\n\nInstrução Extra: A busca específica não encontrou modelos, mas se o cliente pediu algo que corresponda a uma das nossas categorias (como Chinelos, Bonés, Tênis, etc), NUNCA diga que não temos! Diga com entusiasmo que temos sim e envie o link da categoria correspondente usando os LINKS RÁPIDOS DAS CATEGORIAS DA LOJA.`;

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

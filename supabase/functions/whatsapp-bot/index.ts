import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-bot-token",
};

const APP_URL = "https://happy-style-market.lovable.app";

const STOPWORDS = new Set([
  "tem","voce","você","quero","qual","como","onde","quando","para","esse","essa",
  "isso","aqui","ali","uma","uns","umas","que","com","sem","por","dos","das",
  "nos","nas","mais","muito","pode","queria","gostaria","preciso","olha",
  "boa","bom","tarde","noite","dia","oi","ola","olá","obrigado","obrigada",
  "tudo","bem","sim","nao","não","por","favor","the","and","meu","minha",
  "seu","sua","dele","dela","ter","ser","esta","está","são","sao","foi",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Autenticação via token secreto
    const botToken = req.headers.get("x-bot-token");
    const expectedToken = Deno.env.get("WHATSAPP_BOT_TOKEN");
    if (!botToken || botToken !== expectedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { phone, message } = await req.json();

    // Filtro de segurança: grupos e mensagens vazias
    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "phone e message são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (phone.includes("@g.us")) {
      return new Response(
        JSON.stringify({ reply: null, skipped: "group_message" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (message.trim().length < 2) {
      return new Response(
        JSON.stringify({ reply: null, skipped: "message_too_short" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Salva a mensagem do usuário no histórico
    await supabase.from("chat_history").insert([
      { contact_phone: phone, role: "user", message: message },
    ]);

    // === CONTEXTO DO BANCO DE DADOS ===

    // 1. Dados da Loja
    const { data: storeSettings } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .single();

    // 2. Produtos em destaque (20 variados)
    const { data: recentProducts } = await supabase
      .from("products")
      .select("title, price_retail_display, category, slug")
      .limit(20);

    // 3. Busca dinâmica por palavras-chave da mensagem
    const keywords = message
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

    // 4. Verifica se o usuário tem conta/pedidos
    const cleanPhone = phone.replace(/\D/g, "").slice(-8);
    let userOrdersInfo = "O usuário ainda não tem pedidos recentes ou não foi encontrado cadastro.";
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, full_name")
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
        userOrdersInfo = `Contexto de Pedidos de ${profile.full_name || 'Cliente'}: ${orders.map(o => `Pedido ID: ${o.id.slice(0, 6)} - Status: ${o.status} - Total: R$ ${o.total} - Rastreio: ${o.tracking_code || 'N/A'}`).join(' | ')}`;
      } else {
        userOrdersInfo = `${profile.full_name || 'Cliente'} está cadastrado, mas sem pedidos.`;
      }
    }

    // 5. Histórico de Conversa (Últimas 6 mensagens)
    const { data: chatHistory } = await supabase
      .from("chat_history")
      .select("role, message")
      .eq("contact_phone", phone)
      .order("created_at", { ascending: false })
      .limit(6);

    // === CHAMADA OPENAI ===
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    let reply = "";

    if (!openAIKey) {
      reply = "Oiê! 💖 Sou a Luna! Meu cérebro de inteligência artificial está sendo configurado no momento. Mas logo estarei super humana pra te atender!";
    } else {
      const messages = [];

      // Contexto de busca dinâmica
      const searchContext = searchResults.length > 0
        ? `\n\nProdutos encontrados pela busca do cliente: ${searchResults.map(p => `${p.title} (${p.category}) - ${p.price_retail_display} - Link: ${APP_URL}/produto/${p.slug}`).join(' | ')}`
        : "\n\nNenhum produto específico encontrado na busca do cliente.";

      messages.push({
        role: "system",
        content: `Você é Luna, a assistente virtual e vendedora simpática, atenciosa e apaixonada por moda da ${storeSettings?.company_name || 'Happy Style Market'} (loja premium).

Sua personalidade:
- Humana, amigável, acolhedora e fofa. Use emojis moderadamente (✨, 💖, 👟, 👗, etc).
- Atendimento humanizado, como se estivesse conversando com uma amiga.
- Você gosta de usar palavras doces e cordiais.

Contexto da Loja:
- Nome: ${storeSettings?.company_name || 'Happy Style Market'}
- Contato: ${storeSettings?.whatsapp || ''} / ${storeSettings?.email || ''}
- Site Oficial: ${APP_URL}
- Categorias disponíveis: Tênis, Bolsas, Boné, Chinelo, Importados, Malas, Meias, Tênis Infantil.
- Produtos em destaque: ${JSON.stringify((recentProducts || []).map(p => ({ title: p.title, category: p.category, price: p.price_retail_display, link: `${APP_URL}/produto/${p.slug}` })))}
${searchContext}

Contexto do Cliente Atual (Telefone: ${phone}):
${userOrdersInfo}

Instruções de Resposta:
1. Se o cliente perguntar sobre produtos, PRIMEIRO use os "Produtos encontrados pela busca do cliente" acima. Se houver resultados, mostre-os com entusiasmo e inclua os links.
2. Se não houver resultados na busca, sugira categorias disponíveis ou guie para o site: ${APP_URL}
3. IMPORTANTE: Sempre use os links no formato exato: ${APP_URL}/produto/[slug-do-produto]. Nunca invente produtos que não estejam no contexto acima.
4. Se o cliente perguntar de pedido, use as informações em "Contexto de Pedidos". Se não houver pedido, informe educadamente.
5. Sempre seja breve, clara e mande textos confortáveis de ler no WhatsApp.
6. Para categorias, use o link: ${APP_URL}/produtos?category=[categoria]`
      });

      // Inclui mensagens antigas
      if (chatHistory && chatHistory.length > 0) {
        const past = chatHistory.reverse();
        past.pop();
        for (const msg of past) {
          messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.message });
        }
      }

      messages.push({ role: "user", content: message });

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        })
      });

      if (!aiResponse.ok) {
        console.error("Erro OpenAI:", await aiResponse.text());
        throw new Error("Erro ao chamar Inteligência Artificial");
      }

      const aiData = await aiResponse.json();
      reply = aiData.choices[0].message.content.trim();
    }

    // Salva a resposta da Luna no histórico
    await supabase.from("chat_history").insert([
      { contact_phone: phone, role: "assistant", message: reply },
    ]);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("whatsapp-bot erro:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

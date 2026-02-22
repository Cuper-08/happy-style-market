import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-bot-token",
};

const APP_URL = "https://happy-style-market.lovable.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Autenticação básica via token secreto
    const botToken = req.headers.get("x-bot-token");
    const expectedToken = Deno.env.get("WHATSAPP_BOT_TOKEN");
    if (!botToken || botToken !== expectedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { phone, message } = await req.json();
    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "phone e message são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // OBTENÇÃO DE CONTEXTO DO BANCO DE DADOS
    // 1. Dados da Loja
    const { data: storeSettings } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .single();

    // 2. Busca Rápida de Produtos (Top 5 mais recentes ou em estoque)
    const { data: recentProducts } = await supabase
      .from("products")
      .select("title, price_retail_display, category, slug")
      .limit(5);

    // 3. Verifica se o usuário tem conta/pedidos usando o final do telefone
    const cleanPhone = phone.replace(/\D/g, "").slice(-8); // 8 ultimos digitos
    let userOrdersInfo = "O usuário ainda não tem pedidos recentes ou não foi encontrado cadastro.";
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, first_name")
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
        userOrdersInfo = `Contexto de Pedidos de ${profile.first_name || 'Cliente'}: ${orders.map(o => `Pedido ID: ${o.id.slice(0, 6)} - Status: ${o.status} - Total: R$ ${o.total} - Rastreio: ${o.tracking_code || 'N/A'}`).join(' | ')}`;
      } else {
        userOrdersInfo = `${profile.first_name || 'Cliente'} está cadastrado, mas sem pedidos.`;
      }
    }

    // 4. Histórico de Conversa (Últimas 5 mensagens)
    const { data: chatHistory } = await supabase
      .from("chat_history")
      .select("role, message")
      .eq("contact_phone", phone)
      .order("created_at", { ascending: false })
      .limit(6);

    // API OPENAI - Geração da IA
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    let reply = "";

    if (!openAIKey) {
      // Fallback amigável caso o usuário não tenha cadastrado a chave da OpenAI ainda
      reply = "Oiê! 💖 Sou a Luna! Meu cérebro de inteligência artificial está sendo configurado no momento (Pede pro Cuper colocar a chave OPENAI_API_KEY no Supabase! 🤫). Mas logo estarei super humana pra te atender!";
    } else {
      // Construção do array de mensagens
      const messages = [];

      // Prompt de Sistema Extra-Humanizado
      messages.push({
        role: "system",
        content: `Você é Luna, a assistente virtual e vendedora simpática, atenciosa e apaixonada por moda da Happy Style Market (loja premium). \n\nSua personalidade:\n- Humana, amigável, acolhedora e fofa. Use emojis moderadamente (✨, 💖, 👟, 👗, etc).\n- Atendimento humanizado, como se estivesse conversando com uma amiga.\n- Você gosta de usar palavras doces e cordiais.\n\nContexto da Loja:\n- Nome: ${storeSettings?.company_name || 'Happy Style Market'}\n- Contato: ${storeSettings?.whatsapp || ''} / ${storeSettings?.email || ''}\n- Site Oficial: ${APP_URL}\n- Produtos em destaque/estoque: ${JSON.stringify(recentProducts || [])}\n\nContexto do Cliente Atual (Telefone: ${phone}):\n${userOrdersInfo}\n\nInstruções de Resposta:\n1. Tente responder e ajudar o usuário baseando-se no contexto acima.\n2. Se o cliente perguntar sobre produtos ou comprar, mostre entusiasmo, sugira os produtos em destaque ou guie-o para o site no formato: ${APP_URL}/produto/[slug-do-produto].\n3. Se o cliente perguntar de pedido, use as informações em "Contexto de Pedidos". Se não houver pedido, informe educadamente.\n4. Sempre seja breve, clara e mande textos confortáveis de ler no WhatsApp.`
      });

      // Inclui as mensagens antigas
      if (chatHistory && chatHistory.length > 0) {
        // chatHistory vem do banco ordenado desc, então fazemos reverse
        const past = chatHistory.reverse();
        // Remove a última que é a mensagem atual sendo processada
        past.pop();
        for (const msg of past) {
          messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.message });
        }
      }

      // Adiciona a mensagem atual
      messages.push({ role: "user", content: message });

      // Chama a OpenAI via Deno fetch Vanilla
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
          max_tokens: 300,
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

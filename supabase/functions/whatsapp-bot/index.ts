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
    // Auth via secret token
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
        JSON.stringify({ error: "phone and message are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Save user message to chat_history
    await supabase.from("chat_history").insert([
      {
        contact_phone: phone,
        role: "user",
        message: message,
      },
    ]);

    const lowerMsg = message.toLowerCase().trim();
    let reply = "";

    // --- Intent detection ---

    // 1. Order status check
    if (
      lowerMsg.includes("pedido") ||
      lowerMsg.includes("rastreio") ||
      lowerMsg.includes("entrega") ||
      lowerMsg.includes("rastreamento") ||
      lowerMsg.includes("enviado")
    ) {
      reply = await handleOrderQuery(supabase, phone, lowerMsg);
    }
    // 2. Store info
    else if (
      lowerMsg.includes("endereço") ||
      lowerMsg.includes("endereco") ||
      lowerMsg.includes("horário") ||
      lowerMsg.includes("horario") ||
      lowerMsg.includes("telefone") ||
      lowerMsg.includes("contato") ||
      lowerMsg.includes("loja")
    ) {
      reply = await handleStoreInfo(supabase);
    }
    // 3. Greeting
    else if (
      lowerMsg === "oi" ||
      lowerMsg === "olá" ||
      lowerMsg === "ola" ||
      lowerMsg === "bom dia" ||
      lowerMsg === "boa tarde" ||
      lowerMsg === "boa noite" ||
      lowerMsg === "hi" ||
      lowerMsg === "hello"
    ) {
      reply = await handleGreeting(supabase);
    }
    // 4. Product search (default)
    else {
      reply = await handleProductSearch(supabase, lowerMsg);
    }

    // Save bot reply to chat_history
    await supabase.from("chat_history").insert([
      {
        contact_phone: phone,
        role: "assistant",
        message: reply,
      },
    ]);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("whatsapp-bot error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// --- Handlers ---

async function handleGreeting(supabase: any): Promise<string> {
  const { data: settings } = await supabase
    .from("store_settings")
    .select("company_name")
    .limit(1)
    .single();

  const storeName = settings?.company_name || "nossa loja";
  return (
    `Olá! 👋 Bem-vindo(a) à *${storeName}*!\n\n` +
    `Como posso te ajudar?\n\n` +
    `🔍 Envie o nome de um produto para pesquisar\n` +
    `📦 Digite *"meu pedido"* para consultar seu pedido\n` +
    `🏪 Digite *"loja"* para ver nosso endereço e contato\n\n` +
    `Exemplo: _"tênis nike"_ ou _"bolsas"_`
  );
}

async function handleProductSearch(
  supabase: any,
  query: string
): Promise<string> {
  // Search by title and category
  const searchTerms = query
    .replace(/[?!.,;]/g, "")
    .split(" ")
    .filter((w: string) => w.length > 2);

  if (searchTerms.length === 0) {
    return "Não entendi sua busca. Pode repetir com o nome do produto? 🤔";
  }

  // Build OR filter for flexible search
  const orFilters = searchTerms
    .map((term: string) => `title.ilike.%${term}%,category.ilike.%${term}%`)
    .join(",");

  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, slug, price, price_display, price_retail, price_retail_display, category, images")
    .or(orFilters)
    .limit(5);

  if (error || !products || products.length === 0) {
    return (
      `Não encontrei produtos para *"${query}"* 😕\n\n` +
      `Tente buscar por:\n` +
      `• Nome do produto (ex: _"tênis nike"_)\n` +
      `• Categoria (ex: _"bolsas"_, _"meias"_, _"bonés"_)`
    );
  }

  // Check stock for each product
  const productIds = products.map((p: any) => p.id);
  const { data: variants } = await supabase
    .from("product_variants")
    .select("product_id, size, stock")
    .in("product_id", productIds)
    .eq("stock", true);

  const stockMap: Record<string, string[]> = {};
  if (variants) {
    for (const v of variants) {
      if (!stockMap[v.product_id]) stockMap[v.product_id] = [];
      stockMap[v.product_id].push(v.size);
    }
  }

  let reply = `Encontrei *${products.length} produto(s)* para você:\n`;

  for (const p of products) {
    const price = p.price_retail_display || p.price_display || "Consulte";
    const sizes = stockMap[p.id];
    const availability = sizes
      ? `✅ Tamanhos: ${sizes.join(", ")}`
      : "⚠️ Consulte disponibilidade";
    const link = `${APP_URL}/produto/${p.slug}`;

    reply += `\n━━━━━━━━━━━━━━━\n`;
    reply += `👟 *${p.title}*\n`;
    reply += `💰 ${price}\n`;
    reply += `${availability}\n`;
    reply += `🔗 ${link}\n`;
  }

  reply += `\n━━━━━━━━━━━━━━━\n`;
  reply += `Clique no link para ver detalhes e comprar! 🛒`;

  return reply;
}

async function handleOrderQuery(
  supabase: any,
  phone: string,
  _query: string
): Promise<string> {
  // Find user by phone in profiles
  const cleanPhone = phone.replace(/\D/g, "");
  const phoneSuffixes = [cleanPhone, cleanPhone.slice(-11), cleanPhone.slice(-10)];

  let userId: string | null = null;

  for (const suffix of phoneSuffixes) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .ilike("phone", `%${suffix}%`)
      .limit(1)
      .single();

    if (profile) {
      userId = profile.user_id;
      break;
    }
  }

  if (!userId) {
    return (
      `Não encontrei um cadastro vinculado ao seu número 😕\n\n` +
      `Para consultar pedidos, cadastre-se no app com o mesmo número do WhatsApp:\n` +
      `🔗 ${APP_URL}/cadastro`
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, tracking_code, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!orders || orders.length === 0) {
    return "Você ainda não tem pedidos registrados 📭";
  }

  const statusEmoji: Record<string, string> = {
    pending: "⏳ Pendente",
    paid: "✅ Pago",
    processing: "📦 Em preparação",
    shipped: "🚚 Enviado",
    delivered: "✅ Entregue",
    cancelled: "❌ Cancelado",
  };

  let reply = `📋 *Seus últimos pedidos:*\n`;

  for (const o of orders) {
    const status = statusEmoji[o.status] || o.status;
    const date = new Date(o.created_at).toLocaleDateString("pt-BR");
    const total = `R$ ${Number(o.total).toFixed(2).replace(".", ",")}`;

    reply += `\n━━━━━━━━━━━━━━━\n`;
    reply += `🆔 Pedido: ${o.id.slice(0, 8)}...\n`;
    reply += `📅 ${date}\n`;
    reply += `${status}\n`;
    reply += `💰 ${total}\n`;
    if (o.tracking_code) {
      reply += `📬 Rastreio: ${o.tracking_code}\n`;
    }
  }

  return reply;
}

async function handleStoreInfo(supabase: any): Promise<string> {
  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .single();

  if (!settings) {
    return `Informações da loja não disponíveis no momento. Acesse: ${APP_URL}`;
  }

  let reply = `🏪 *${settings.company_name || "Nossa Loja"}*\n\n`;

  if (settings.whatsapp) reply += `📱 WhatsApp: ${settings.whatsapp}\n`;
  if (settings.phone) reply += `📞 Telefone: ${settings.phone}\n`;
  if (settings.email) reply += `📧 Email: ${settings.email}\n`;

  if (settings.address) {
    const addr = settings.address as Record<string, string>;
    if (addr.street) {
      reply += `\n📍 *Endereço:*\n`;
      reply += `${addr.street}`;
      if (addr.number) reply += `, ${addr.number}`;
      reply += `\n`;
      if (addr.neighborhood) reply += `${addr.neighborhood}\n`;
      if (addr.city && addr.state) reply += `${addr.city} - ${addr.state}\n`;
      if (addr.cep) reply += `CEP: ${addr.cep}\n`;
    }
  }

  reply += `\n🌐 Acesse nossa loja: ${APP_URL}`;

  return reply;
}

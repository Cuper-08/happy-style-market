import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SUPERFRETE_TOKEN = Deno.env.get('SUPERFRETE_TOKEN') || '';
const SUPERFRETE_ENV = Deno.env.get('SUPERFRETE_ENV') || 'sandbox';
const SUPERFRETE_BASE_URL = SUPERFRETE_ENV === 'production'
  ? 'https://api.superfrete.com/api/v0'
  : 'https://sandbox.superfrete.com/api/v0';

// Mapping shipping_method -> SuperFrete service id
const SERVICE_MAP: Record<string, number> = {
  pac: 1,
  sedex: 2,
  express: 2, // fallback to sedex
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      throw new Error('orderId é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Pedido não encontrado: ${orderError?.message}`);
    }

    if (order.superfrete_label_id) {
      return new Response(JSON.stringify({ success: true, message: 'Etiqueta já gerada', label_id: order.superfrete_label_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw new Error(`Erro ao buscar itens: ${itemsError.message}`);

    // 3. Fetch buyer profile if user_id exists
    let profile: any = null;
    if (order.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', order.user_id)
        .maybeSingle();
      profile = profileData;
    }

    // 4. Parse shipping address
    const addr = order.shipping_address as Record<string, any> || {};

    // Build recipient name: prefer profile full_name, then address name
    const recipientName = profile?.full_name || addr.name || addr.full_name || 'Cliente';
    const recipientDoc = (profile?.cpf || addr.cpf || addr.document || '').replace(/\D/g, '');

    // 5. Build products array
    const products = (items || []).map((item: any) => ({
      name: item.product_name || 'Produto',
      quantity: item.quantity || 1,
      unitary_value: Number(item.unit_price) || 0,
    }));

    // 6. Calculate total quantity for volume
    const totalQty = (items || []).reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

    // 7. Build SuperFrete payload
    const service = SERVICE_MAP[order.shipping_method || 'pac'] || 1;

    const payload = {
      from: {
        name: 'Brás Conceito',
        address: 'R. Conselheiro Belisário',
        number: '41',
        district: 'Brás',
        city: 'São Paulo',
        state_abbr: 'SP',
        postal_code: '03012000',
        document: '59520505000120',
      },
      to: {
        name: recipientName,
        address: addr.street || addr.address || '',
        number: addr.number || 'S/N',
        complement: addr.complement || '',
        district: addr.neighborhood || addr.district || '',
        city: addr.city || '',
        state_abbr: addr.state || addr.state_abbr || '',
        postal_code: (addr.cep || addr.postal_code || '').replace(/\D/g, ''),
        document: recipientDoc,
      },
      service,
      products,
      volumes: {
        height: 12,
        width: 20,
        length: 32,
        weight: Math.max(totalQty, 1),
      },
      options: {
        insurance_value: Number(order.subtotal) || 0,
        non_commercial: true,
      },
      platform: 'Brás Conceito',
      tag: orderId,
    };

    console.log('[create-shipping-label] Payload:', JSON.stringify(payload));

    // 8. Call SuperFrete /cart
    const response = await fetch(`${SUPERFRETE_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
        'User-Agent': 'Superfrete',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('[create-shipping-label] SuperFrete response:', response.status, responseText);

    if (!response.ok) {
      throw new Error(`SuperFrete erro ${response.status}: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    const labelId = result.id || result.order_id || null;

    // 9. Save label id to order
    if (labelId) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ superfrete_label_id: labelId })
        .eq('id', orderId);

      if (updateError) {
        console.error('[create-shipping-label] Erro ao salvar label_id:', updateError.message);
      }
    }

    return new Response(JSON.stringify({ success: true, label_id: labelId, superfrete_response: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[create-shipping-label] Error:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

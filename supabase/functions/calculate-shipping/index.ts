import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SUPERFRETE_TOKEN = Deno.env.get('SUPERFRETE_TOKEN') || '';
const SUPERFRETE_ENV = Deno.env.get('SUPERFRETE_ENV') || 'sandbox';
const SUPERFRETE_BASE_URL = SUPERFRETE_ENV === 'production'
  ? 'https://api.superfrete.com'
  : 'https://sandbox.superfrete.com';

const CEP_ORIGEM = Deno.env.get('STORE_CEP') || '01001000';

interface ShippingRequest {
  cepDestino: string;
  items: Array<{
    quantity: number;
    weight?: number;
    height?: number;
    width?: number;
    length?: number;
    insurance_value?: number;
  }>;
}

interface ShippingOption {
  id: number;
  name: string;
  company: string;
  price: number;
  delivery_time: number;
  delivery_range?: { min: number; max: number };
}

const fallbackOptions: ShippingOption[] = [
  { id: 1, name: 'PAC', company: 'Correios', price: 29.90, delivery_time: 10 },
  { id: 2, name: 'SEDEX', company: 'Correios', price: 49.90, delivery_time: 5 },
];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const origin = req.headers.get('origin');
  const allowedExactOrigins = ['http://localhost:8080', 'http://localhost:5173'];
  if (origin && !allowedExactOrigins.includes(origin) && !origin.includes('lovable.app') && !origin.includes('brasc')) {
    console.warn(`[Shipping] Origem bloqueada: ${origin}`);
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const body: ShippingRequest = await req.json();
    const { cepDestino, items } = body;

    if (!cepDestino || !items?.length) {
      throw new Error('CEP de destino e itens são obrigatórios');
    }

    const cleanCep = cepDestino.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      throw new Error('CEP inválido. Deve conter 8 dígitos.');
    }

    // Aggregate package dimensions
    let totalWeight = 0;
    let totalInsurance = 0;
    for (const item of items) {
      const qty = item.quantity || 1;
      totalWeight += (item.weight || 0.3) * qty;
      totalInsurance += (item.insurance_value || 0) * qty;
    }

    const packageWeight = Math.max(totalWeight, 0.1);
    const packageHeight = Math.max(5, 2);
    const packageWidth = Math.max(15, 11);
    const packageLength = Math.max(20, 16);

    // Simulation mode when no token
    if (!SUPERFRETE_TOKEN) {
      console.log('[Shipping] No Token found. Using SIMULATION MODE.');
      return new Response(JSON.stringify({
        options: [
          { id: 1, name: 'PAC (Simulado)', company: 'Correios', price: 25.50, delivery_time: 8, delivery_range: { min: 5, max: 10 } },
          { id: 2, name: 'SEDEX (Simulado)', company: 'Correios', price: 45.90, delivery_time: 3, delivery_range: { min: 2, max: 4 } },
          { id: 17, name: 'Mini Envios (Simulado)', company: 'Correios', price: 15.00, delivery_time: 12, delivery_range: { min: 8, max: 15 } },
        ],
        fallback: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call SuperFrete calculator API
    const response = await fetch(`${SUPERFRETE_BASE_URL}/api/v0/calculator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
        'User-Agent': 'BrasConceito (contato@brasconceito.com.br)',
      },
      body: JSON.stringify({
        from: { postal_code: CEP_ORIGEM },
        to: { postal_code: cleanCep },
        services: '1,2,17',
        options: {
          own_hand: false,
          receipt: false,
          insurance_value: totalInsurance || 0,
          use_insurance_value: totalInsurance > 0,
        },
        products: [{
          quantity: 1,
          weight: packageWeight,
          height: packageHeight,
          width: packageWidth,
          length: packageLength,
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Shipping] SuperFrete Error:', response.status, errorText);
      throw new Error('Erro ao consultar frete. Tente novamente.');
    }

    const results = await response.json();

    // Map SuperFrete response to our ShippingOption format
    const validOptions: ShippingOption[] = (Array.isArray(results) ? results : [])
      .filter((r: { error?: string; price?: number | string }) => !r.error && r.price && parseFloat(String(r.price)) > 0)
      .map((r: {
        id?: number;
        name?: string;
        company?: { name?: string };
        price?: number | string;
        discount?: number | string;
        delivery_time?: number;
        delivery_range?: { min: number; max: number };
      }) => ({
        id: r.id || 0,
        name: r.name || '',
        company: r.company?.name || 'Correios',
        price: parseFloat(String(r.discount || r.price)),
        delivery_time: r.delivery_time || 0,
        delivery_range: r.delivery_range,
      }))
      .sort((a: ShippingOption, b: ShippingOption) => a.price - b.price);

    if (validOptions.length === 0) {
      return new Response(JSON.stringify({ options: fallbackOptions, fallback: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ options: validOptions, fallback: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao calcular frete';
    console.error('[Shipping] Error:', message);
    return new Response(JSON.stringify({
      options: fallbackOptions,
      fallback: true,
      error: message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});

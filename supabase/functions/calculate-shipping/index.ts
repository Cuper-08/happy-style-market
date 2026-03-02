// supabase/functions/calculate-shipping/index.ts
// Edge Function para calcular frete via SuperFrete API
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Token recebido com permissão para Cotar.
const SUPERFRETE_TOKEN = Deno.env.get('SUPERFRETE_TOKEN') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI0MTYyMjIsInN1YiI6Im4weEF6WjNjQkdjcWFzTnNrRkhYdlFqSnhjZjIifQ.P7HMmzHIF_WSSn1H9_Vnxi7teTNkDs-uYB40DGTo7qY';
const SUPERFRETE_BASE_URL = 'https://api.superfrete.com/api/v0';

// CEP de origem da loja 
const CEP_ORIGEM = Deno.env.get('STORE_CEP') || '03010000'; // Origem fixa confome requerido

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
  discount?: string | number;
  delivery_time: number;
  delivery_range?: { min: number; max: number };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const origin = req.headers.get('origin');
  const allowedExactOrigins = ['http://localhost:8080', 'http://localhost:5173'];

  if (origin && !allowedExactOrigins.includes(origin) && !origin.includes('lovable.app') && !origin.includes('lovableproject.com') && !origin.includes('brasc')) {
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

    // DIMENSÃO PADRÃO SUPERFRETE DA LOJA: 1Kg, 20cm x 32cm x 12cm
    const defaultWeight = 1;
    const defaultHeight = 12;
    const defaultWidth = 20;
    const defaultLength = 32;

    let totalWeight = 0;
    let totalInsurance = 0;

    let packageHeight = 0;
    let packageWidth = 0;
    let packageLength = 0;

    for (const item of items) {
      const qty = item.quantity || 1;

      // se nao mandar medidas, usa padrao x qtde
      totalWeight += (item.weight || defaultWeight) * qty;
      totalInsurance += (item.insurance_value || 0) * qty;

      // Empilha a altura baseada na qtde
      packageHeight += (item.height || defaultHeight) * qty;
      packageWidth = Math.max(packageWidth, item.width || defaultWidth);
      packageLength = Math.max(packageLength, item.length || defaultLength);
    }

    // Minimos e Máximos obrigatórios superfrete limitados pra não quebrar cálculo (soma > 200 e peso > 30)
    // Limitar dimensão total para tentar passar o payload com infos agrupadas
    const clampedHeight = Math.min(Math.max(packageHeight, 1), 80);
    const clampedWidth = Math.min(Math.max(packageWidth, 11), 80);
    const clampedLength = Math.min(Math.max(packageLength, 16), 80);
    const clampedWeight = Math.min(Math.max(totalWeight, 0.1), 30); // Correio maximo pac/sedex aprox = 30kg

    const packageData = {
      height: clampedHeight,
      width: clampedWidth,
      length: clampedLength,
      weight: clampedWeight,
    };

    if (!SUPERFRETE_TOKEN) {
      throw new Error('Token SuperFrete não configurado.');
    }

    // PAYLOAD EXATO DA SUPERFRETE 
    const superFretePayload = {
      from: { postal_code: CEP_ORIGEM },
      to: { postal_code: cleanCep },
      services: "1,2,3,4,17", // 1(PAC), 2(SEDEX), 3(Jadlog Normal), 4(Jadlog Expresso), 17(MINI)
      options: {
        receipt: false,
        own_hand: false,
        insurance_value: totalInsurance || 0
      },
      package: {
        height: packageData.height,
        width: packageData.width,
        length: packageData.length,
        weight: packageData.weight
      }
    };

    const response = await fetch(`${SUPERFRETE_BASE_URL}/calculator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
        'User-Agent': 'Superfrete'
      },
      body: JSON.stringify(superFretePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Shipping] SuperFrete Error:', response.status, errorText);
      throw new Error('Erro ao consultar frete. Tente novamente ou reduza a quantidade itens.');
    }

    const results = await response.json();

    // Map para o front-end
    const validOptions: ShippingOption[] = (Array.isArray(results) ? results : [results])
      .filter((r: any) => !r.has_error && r.price && parseFloat(String(r.price)) > 0)
      .map((r: any) => ({
        id: r.id || 0,
        name: r.name || '',
        company: r.company?.name || 'Correios',
        price: parseFloat(String(r.price)) * Math.ceil(totalWeight / packageData.weight), // multiplica frete caso tenha diminuido peso.
        discount: parseFloat(String(r.discount || 0)),
        delivery_time: r.delivery_time || 0,
        delivery_range: r.delivery_range,
      }))
      .sort((a: ShippingOption, b: ShippingOption) => a.price - b.price);

    const fallbackOptions = [
      { id: 1, name: 'PAC (Estimado)', company: 'Correios', price: 29.90, delivery_time: 10, delivery_range: { min: 8, max: 15 } },
      { id: 2, name: 'SEDEX (Estimado)', company: 'Correios', price: 49.90, delivery_time: 5, delivery_range: { min: 3, max: 7 } },
    ];

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
      options: [
        { id: 1, name: 'PAC (Estimado)', company: 'Correios', price: 29.90, delivery_time: 10, delivery_range: { min: 8, max: 15 } },
        { id: 2, name: 'SEDEX (Estimado)', company: 'Correios', price: 49.90, delivery_time: 5, delivery_range: { min: 3, max: 7 } },
      ],
      fallback: true,
      error: message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});

// supabase/functions/calculate-shipping/index.ts
// Edge Function para calcular frete via SuperFrete API
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPERFRETE_TOKEN = Deno.env.get('SUPERFRETE_TOKEN') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI0MTYyMjIsInN1YiI6Im4weEF6WjNjQkdjcWFzTnNrRkhYdlFqSnhjZjIifQ.P7HMmzHIF_WSSn1H9_Vnxi7teTNkDs-uYB40DGTo7qY';
const SUPERFRETE_BASE_URL = 'https://api.superfrete.com/api/v0';

// CEP de origem da loja (configurável)
const CEP_ORIGEM = Deno.env.get('STORE_CEP') || '03010000'; // Brás Conceito

interface ShippingRequest {
    cepDestino: string;
    items: Array<{
        quantity: number;
        weight?: number;    // kg
        height?: number;    // cm
        width?: number;     // cm
        length?: number;    // cm
        insurance_value?: number; // valor declarado
    }>;
}

interface ShippingOption {
    id: number;
    name: string;
    company: string;
    price: number;
    delivery_time: number; // days
    delivery_range?: { min: number; max: number };
    error?: string;
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Basic anti-abuse origin validation
    const origin = req.headers.get('origin');
    const allowedExactOrigins = ['http://localhost:8080', 'http://localhost:5173'];

    // Se tiver origem e não for um dos permitidos e nem conter lovable/happy-style/brasc
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

        // Clean CEP (remove dashes and spaces)
        const cleanCep = cepDestino.replace(/\D/g, '');
        if (cleanCep.length !== 8) {
            throw new Error('CEP inválido. Deve conter 8 dígitos.');
        }

        // Default constraints specified by the user
        const defaultWeight = 1; // 1Kg
        const defaultHeight = 12; // 12cm
        const defaultWidth = 20; // 20cm
        const defaultLength = 32; // 32cm

        // Calculate total dimensions and weight based on passed items or defaults
        let totalWeight = 0;
        let totalInsurance = 0;

        let packageHeight = 0;
        let packageWidth = 0;
        let packageLength = 0;

        for (const item of items) {
            const qty = item.quantity || 1;
            totalWeight += (item.weight || defaultWeight) * qty;
            totalInsurance += (item.insurance_value || 0) * qty;

            // Simple approach: max side as width/length, sum heights
            packageHeight += (item.height || defaultHeight) * qty;
            packageWidth = Math.max(packageWidth, item.width || defaultWidth);
            packageLength = Math.max(packageLength, item.length || defaultLength);
        }

        // Ensure minimum dimensions just in case
        const packageData = {
            height: Math.max(packageHeight, 1),
            width: Math.max(packageWidth, 11), // SuperFrete/Correios mins
            length: Math.max(packageLength, 16),
            weight: Math.max(totalWeight, 0.1),
        };

        // Check if token exists
        if (!SUPERFRETE_TOKEN) {
            console.error('[Shipping] No SuperFrete Token found.');
            throw new Error('Chave da API de Frete não configurada corretamente no servidor');
        }

        const superFretePayload = {
            from: { postal_code: CEP_ORIGEM },
            to: { postal_code: cleanCep },
            services: "1,2", // 1=PAC, 2=SEDEX (and optionally others like mini envios)
            options: {
                receipt: false,
                own_hand: false,
                insurance_value: totalInsurance
            },
            package: {
                height: packageData.height,
                width: packageData.width,
                length: packageData.length,
                weight: packageData.weight
            }
        };

        // Calculate shipping via SuperFrete API
        const response = await fetch(`${SUPERFRETE_BASE_URL}/calculator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
                'User-Agent': 'Superfrete',
            },
            body: JSON.stringify(superFretePayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Shipping] SuperFrete Error:', errorText);
            throw new Error('Erro ao consultar frete na transportadora. Tente novamente.');
        }

        const results = await response.json();

        // Convert SuperFrete results to standard ShippingOption format
        const validOptions: ShippingOption[] = results
            .filter((r: any) => !r.has_error && parseFloat(r.price) > 0)
            .map((r: any) => ({
                id: r.id,
                name: r.name,
                company: r.company?.name || 'Correios',
                price: parseFloat(r.price),
                delivery_time: r.delivery_time,
                delivery_range: r.delivery_range,
            }))
            // Adicionalmente podemos puxar opções da tabela de fallback do próprio retorno caso sejam retornadas muitas..
            .sort((a: ShippingOption, b: ShippingOption) => a.price - b.price);

        // If no options from API, return fallback options
        if (validOptions.length === 0) {
            return new Response(JSON.stringify({
                options: [
                    { id: 1, name: 'PAC (Estimado)', company: 'Correios', price: 29.90, delivery_time: 10 },
                    { id: 2, name: 'SEDEX (Estimado)', company: 'Correios', price: 49.90, delivery_time: 5 },
                ],
                fallback: true,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        return new Response(JSON.stringify({ options: validOptions, fallback: false }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao calcular frete';
        console.error('[Shipping] Error:', message);

        // Return fallback shipping options on error
        return new Response(JSON.stringify({
            options: [
                { id: 1, name: 'PAC (Indisponível)', company: 'Correios', price: 35.90, delivery_time: 15 },
            ],
            fallback: true,
            error: message,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
});

// supabase/functions/calculate-shipping/index.ts
// Edge Function para calcular frete via Melhor Envio API
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MELHOR_ENVIO_TOKEN = Deno.env.get('MELHOR_ENVIO_TOKEN') || '';
const MELHOR_ENVIO_ENV = Deno.env.get('MELHOR_ENVIO_ENV') || 'sandbox';
const MELHOR_ENVIO_BASE_URL = MELHOR_ENVIO_ENV === 'production'
    ? 'https://melhorenvio.com.br/api/v2'
    : 'https://sandbox.melhorenvio.com.br/api/v2';

// CEP de origem da loja (configurável)
const CEP_ORIGEM = Deno.env.get('STORE_CEP') || '01001000';

interface ShippingRequest {
    cepDestino: string;
    items: Array<{
        quantity: number;
        weight?: number;    // kg (default: 0.3)
        height?: number;    // cm (default: 5)
        width?: number;     // cm (default: 15)
        length?: number;    // cm (default: 20)
        insurance_value?: number; // valor declarado
    }>;
}

interface ShippingOption {
    id: number;
    name: string;
    company: string;
    price: number;
    delivery_time: number; // days
    error?: string;
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Basic anti-abuse origin validation
    const origin = req.headers.get('origin');
    const allowedExactOrigins = ['http://localhost:8080', 'http://localhost:5173'];

    // Se tiver origem e não for um dos permitidos e nem conter lovable/happy-style
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

        // Calculate total dimensions and weight
        let totalWeight = 0;
        let totalInsurance = 0;
        const maxHeight = 5;
        const maxWidth = 15;
        const maxLength = 20;

        for (const item of items) {
            const qty = item.quantity || 1;
            totalWeight += (item.weight || 0.3) * qty;
            totalInsurance += (item.insurance_value || 0) * qty;
        }

        // Ensure minimum dimensions for Correios
        const packageData = {
            height: Math.max(maxHeight, 2),
            width: Math.max(maxWidth, 11),
            length: Math.max(maxLength, 16),
            weight: Math.max(totalWeight, 0.1),
        };

        // Check if token exists, otherwise use Mock Mode
        if (!MELHOR_ENVIO_TOKEN) {
            console.log('[Shipping] No Token found. Using SIMULATION MODE.');
            return new Response(JSON.stringify({
                options: [
                    { id: 1, name: 'PAC (Simulado)', company: 'Correios', price: 25.50, delivery_time: 8, delivery_range: { min: 5, max: 10 } },
                    { id: 2, name: 'SEDEX (Simulado)', company: 'Correios', price: 45.90, delivery_time: 3, delivery_range: { min: 2, max: 4 } },
                    { id: 3, name: 'JadLog (Simulado)', company: 'JadLog', price: 38.00, delivery_time: 4, delivery_range: { min: 3, max: 5 } }
                ],
                fallback: false
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Calculate shipping via Melhor Envio API
        const response = await fetch(`${MELHOR_ENVIO_BASE_URL}/me/shipment/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
                'Accept': 'application/json',
                'User-Agent': 'HappyStyleMarket contato@happystyle.com.br',
            },
            body: JSON.stringify({
                from: { postal_code: CEP_ORIGEM },
                to: { postal_code: cleanCep },
                products: [{
                    id: 'package',
                    width: packageData.width,
                    height: packageData.height,
                    length: packageData.length,
                    weight: packageData.weight,
                    insurance_value: totalInsurance || 100,
                    quantity: 1,
                }],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Shipping] Melhor Envio Error:', errorText);
            throw new Error('Erro ao consultar frete. Tente novamente.');
        }

        const results = await response.json();

        // Filter and format valid shipping options
        const validOptions: ShippingOption[] = results
            .filter((r: { error?: string; price: string }) => !r.error && parseFloat(r.price) > 0)
            .map((r: {
                id: number;
                name: string;
                company: { name: string };
                price: string;
                custom_price: string;
                delivery_time: number;
                delivery_range: { min: number; max: number };
            }) => ({
                id: r.id,
                name: r.name,
                company: r.company?.name || '',
                price: parseFloat(r.custom_price || r.price),
                delivery_time: r.delivery_time,
                delivery_range: r.delivery_range,
            }))
            .sort((a: ShippingOption, b: ShippingOption) => a.price - b.price);

        // If no options from API, return fallback options
        if (validOptions.length === 0) {
            return new Response(JSON.stringify({
                options: [
                    { id: 1, name: 'PAC', company: 'Correios', price: 29.90, delivery_time: 10 },
                    { id: 2, name: 'SEDEX', company: 'Correios', price: 49.90, delivery_time: 5 },
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
                { id: 1, name: 'PAC', company: 'Correios', price: 29.90, delivery_time: 10 },
                { id: 2, name: 'SEDEX', company: 'Correios', price: 49.90, delivery_time: 5 },
            ],
            fallback: true,
            error: message,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Return 200 even on error so frontend gets fallback
        });
    }
});

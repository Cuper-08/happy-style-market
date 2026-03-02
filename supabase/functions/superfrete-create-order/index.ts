// supabase/functions/superfrete-create-order/index.ts
// Edge Function para gerar o carrinho/etiqueta na SuperFrete quando o pedido for Pago.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPERFRETE_TOKEN = Deno.env.get('SUPERFRETE_TOKEN') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI0MTYyMjIsInN1YiI6Im4weEF6WjNjQkdjcWFzTnNrRkhYdlFqSnhjZjIifQ.P7HMmzHIF_WSSn1H9_Vnxi7teTNkDs-uYB40DGTo7qY';
const SUPERFRETE_BASE_URL = 'https://api.superfrete.com/api/v0';
const CEP_ORIGEM = Deno.env.get('STORE_CEP') || '03010000';

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        console.log('[Webhook] Receive Payload:', JSON.stringify(payload));

        const { type, record, old_record } = payload;

        // Verificar se a trigger foi de atualização para "paid"
        if (type === 'UPDATE' && record?.status === 'paid' && old_record?.status !== 'paid') {
            const orderId = record.id;

            const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
            const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error("Missing Supabase configuration");
            }

            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            // Buscar os Itens do Pedido para compilar pesos e valores
            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);

            if (itemsError) throw itemsError;

            const shippingAddress = record.shipping_address;

            // Se não tiver o ID do serviço superfrete, tentamos usar fallback (1 - PAC) pra evitar falha total (ideal é q orders novas tenham)
            const serviceId = shippingAddress?.superfrete_service_id || 1;

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
                totalWeight += defaultWeight * qty;
                totalInsurance += (item.unit_price || 0) * qty;
                packageHeight += defaultHeight * qty;
                packageWidth = Math.max(packageWidth, defaultWidth);
                packageLength = Math.max(packageLength, defaultLength);
            }

            const clampedHeight = Math.min(Math.max(packageHeight, 1), 80);
            const clampedWidth = Math.min(Math.max(packageWidth, 11), 80);
            const clampedLength = Math.min(Math.max(packageLength, 16), 80);
            const clampedWeight = Math.min(Math.max(totalWeight, 0.1), 30);

            const cartPayload = {
                "from": {
                    "name": "Bras Conceito",
                    "phone": "11910298016",
                    "document": "20593359000100", // Documento da Loja (exemplo, usar real) - Superfrete exige formatação ou só doc.
                    "address": "Rua Barão de Ladário",
                    "number": "27",
                    "complement": "Box ST1-070",
                    "district": "Brás",
                    "city": "São Paulo",
                    "state_abbr": "SP",
                    "country_id": "BR",
                    "postal_code": CEP_ORIGEM.replace(/\D/g, '')
                },
                "to": {
                    "name": shippingAddress?.full_name || "Cliente Desconhecido",
                    "phone": (shippingAddress?.phone || "11999999999").replace(/\D/g, ''),
                    "email": shippingAddress?.email || "cliente@sem-email.com",
                    "document": (shippingAddress?.cpf || "00000000000").replace(/\D/g, ''),
                    "address": shippingAddress?.street || "Não informado",
                    "complement": shippingAddress?.complement || "",
                    "number": shippingAddress?.number || "S/N",
                    "district": shippingAddress?.neighborhood || "Não informado",
                    "city": shippingAddress?.city || "Não informado",
                    "state_abbr": shippingAddress?.state || "SP",
                    "country_id": "BR",
                    "postal_code": (shippingAddress?.cep || "").replace(/\D/g, '')
                },
                "service": Number(serviceId),
                "options": {
                    "receipt": false,
                    "own_hand": false,
                    "non_commercial": true,
                    // declaration de valor e conteudo fica no formato simples p/ etiquetas nao-comerciais (como teste/MEI)
                },
                "external_id": `PedidoAPP_${orderId.substring(0, 8)}`, // Referência para origem/sistema
                "description": `OrigemApp - Itens: ${items.map((i: any) => i.product_name).join(', ').substring(0, 50)}`, // Descrição origem/produto
                // Passa a lista atual de produtos para NF/declaração
                "products": items.map((i: any) => ({
                    "name": i.product_name,
                    "quantity": i.quantity || 1,
                    "unitary_value": Number(i.unit_price || 0)
                })),
                "volumes": [
                    {
                        "format": "box",
                        "weight": clampedWeight,
                        "width": clampedWidth,
                        "height": clampedHeight,
                        "length": clampedLength
                    }
                ]
            };

            console.log('Enviando para o Carrinho SuperFrete:', JSON.stringify(cartPayload));

            const response = await fetch(`${SUPERFRETE_BASE_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
                    'User-Agent': 'Superfrete'
                },
                body: JSON.stringify(cartPayload)
            });

            const responseData = await response.json();
            console.log('SuperFrete Cart Result:', response.status, JSON.stringify(responseData));

            if (!response.ok) {
                throw new Error(`SuperFrete Error: ${JSON.stringify(responseData)}`);
            }

            // Se deu certo, salva o tracking/IDs no banco (Opcional - mas bom para o admin ver o rastreio)
            // A resposta do POST /cart gera itens no carrinho. 
            // Em tese seria responseData.id se a Superfrete retornar o ID do carrinho gerado ou id da tag.
            // E dps atualizar o orders "notes" pra colocar lá.

            await supabase
                .from('orders')
                .update({
                    tracking_code: responseData?.id || responseData?.tracking || null,
                    notes: (record.notes ? record.notes + '\\n' : '') + `Item SuperFrete Adicionado ao Carrinho. Checkout UUID: ${responseData?.id || '?'}`
                })
                .eq('id', orderId);

            return new Response(JSON.stringify({ success: true, superFreteData: responseData }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Not a relevant event' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Webhook processing error:', errorMessage);

        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Returning 200 so Webhook doesn't infinitely retry unless we want it to
        });
    }
});

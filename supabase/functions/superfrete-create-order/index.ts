// supabase/functions/superfrete-create-order/index.ts
// Edge Function acionada via Database Webhook quando pedido muda para status 'paid'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPERFRETE_BASE_URL = 'https://api.superfrete.com/api/v0';

// Helper: limpa e valida campos de texto
function cleanText(value: string | null | undefined, fallback = ''): string {
    return (value || fallback).toString().trim();
}

// Helper: limpa string deixando apenas dígitos
function onlyDigits(value: string | null | undefined): string {
    return (value || '').toString().replace(/\D/g, '');
}

// Helper: salva mensagem de erro/sucesso no campo notes do pedido
async function logToOrder(supabase: any, orderId: string, currentNotes: string | null, message: string) {
    const timestamp = new Date().toISOString();
    const prefix = currentNotes ? currentNotes + '\n' : '';
    await supabase
        .from('orders')
        .update({ notes: `${prefix}[${timestamp}] ${message}` })
        .eq('id', orderId);
}

// Helper: valida campos mínimos antes de chamar a SuperFrete
function validateShippingAddress(addr: any): string | null {
    if (!addr) return 'Endereço de entrega não encontrado no pedido.';
    const cep = onlyDigits(addr.cep);
    if (cep.length !== 8) return `CEP inválido ou ausente: "${addr.cep || 'vazio'}"`;
    if (!cleanText(addr.full_name)) return 'Nome do destinatário ausente.';
    const cpf = onlyDigits(addr.cpf);
    if (cpf.length !== 11 && cpf.length !== 14) return `CPF/CNPJ inválido ou ausente: "${addr.cpf || 'vazio'}"`;
    const phone = onlyDigits(addr.phone);
    if (phone.length < 10) return `Telefone inválido ou ausente: "${addr.phone || 'vazio'}"`;
    if (!cleanText(addr.street)) return 'Logradouro (rua) ausente no endereço.';
    if (!cleanText(addr.city)) return 'Cidade ausente no endereço.';
    if (!cleanText(addr.state)) return 'Estado ausente no endereço.';
    return null; // Tudo válido
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Obter configuração do ambiente (nunca hardcoded)
    const SUPERFRETE_TOKEN = Deno.env.get('SUPERFRETE_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const CEP_ORIGEM = Deno.env.get('STORE_CEP') || '03010000';

    // Verificação imediata de configuração crítica
    if (!SUPERFRETE_TOKEN) {
        console.error('[SuperFrete] ERRO CRÍTICO: Secret SUPERFRETE_TOKEN não configurado nas variáveis de ambiente do Supabase!');
        return new Response(JSON.stringify({ error: 'Configuração de servidor incompleta: SUPERFRETE_TOKEN ausente' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[SuperFrete] ERRO CRÍTICO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes!');
        return new Response(JSON.stringify({ error: 'Configuração de servidor incompleta: variáveis Supabase ausentes' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let orderId: string | null = null; // Definido fora do try para uso no catch

    try {
        const payload = await req.json();
        console.log('[SuperFrete Webhook] Payload recebido:', JSON.stringify(payload).substring(0, 500));

        const { type, record, old_record } = payload;

        // Só processa UPDATE para status 'paid'
        if (type !== 'UPDATE' || record?.status !== 'paid' || old_record?.status === 'paid') {
            return new Response(JSON.stringify({ message: 'Evento ignorado - não é transição para paid' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        orderId = record.id as string;
        if (!orderId) {
            return new Response(JSON.stringify({ error: 'ID do pedido ausente' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }
        console.log(`[SuperFrete] Processando pedido ${orderId}`);

        // Buscar itens do pedido com dados completos
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        if (itemsError) {
            await logToOrder(supabase, orderId, record.notes, `ERRO ao buscar itens: ${itemsError.message}`);
            throw itemsError;
        }

        if (!items || items.length === 0) {
            await logToOrder(supabase, orderId, record.notes, 'ERRO: Nenhum item encontrado para o pedido.');
            throw new Error('Pedido sem itens - impossível criar etiqueta');
        }

        const shippingAddress = record.shipping_address;

        // Validar campos obrigatórios antes de chamar a API
        const validationError = validateShippingAddress(shippingAddress);
        if (validationError) {
            const msg = `ERRO de validação (dados do cliente): ${validationError}`;
            console.error(`[SuperFrete] ${msg}`);
            await logToOrder(supabase, orderId, record.notes, msg);
            return new Response(JSON.stringify({ error: validationError }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // 200 para evitar retry infinito do webhook
            });
        }

        // ID do serviço: usa o que o cliente escolheu, fallback para PAC (1)
        const serviceId = Number(shippingAddress?.superfrete_service_id) || 1;

        // Calcular dimensões e peso acumulado dos itens
        const DEFAULT_WEIGHT = 1;   // kg por item
        const DEFAULT_HEIGHT = 12;  // cm
        const DEFAULT_WIDTH = 20;   // cm
        const DEFAULT_LENGTH = 32;  // cm

        let totalWeight = 0;
        let totalInsurance = 0;
        let packageHeight = 0;
        let packageWidth = 0;
        let packageLength = 0;

        for (const item of items) {
            const qty = item.quantity || 1;
            totalWeight += DEFAULT_WEIGHT * qty;
            totalInsurance += (item.unit_price || 0) * qty;
            packageHeight += DEFAULT_HEIGHT * qty;
            packageWidth = Math.max(packageWidth, DEFAULT_WIDTH);
            packageLength = Math.max(packageLength, DEFAULT_LENGTH);
        }

        // Limites da SuperFrete/Correios
        const clampedHeight = Math.min(Math.max(packageHeight, 2), 80);
        const clampedWidth = Math.min(Math.max(packageWidth, 11), 80);
        const clampedLength = Math.min(Math.max(packageLength, 16), 80);
        const clampedWeight = Math.min(Math.max(totalWeight, 0.1), 30);

        // Limitar soma das dimensões a 200cm (regra Correios)
        const dimSum = clampedHeight + clampedWidth + clampedLength;
        let finalHeight = clampedHeight;
        let finalWidth = clampedWidth;
        let finalLength = clampedLength;
        if (dimSum > 200) {
            const scale = 200 / dimSum;
            finalHeight = Math.floor(clampedHeight * scale);
            finalWidth = Math.floor(clampedWidth * scale);
            finalLength = Math.floor(clampedLength * scale);
        }

        const productNames = items.map((i: any) => cleanText(i.product_name, 'Produto')).join(', ');

        const cartPayload = {
            "from": {
                "name": "Bras Conceito",
                "phone": "11910298016",
                "document": "20593359000100",
                "address": "Rua Barão de Ladário",
                "number": "27",
                "complement": "Box ST1-070",
                "district": "Brás",
                "city": "São Paulo",
                "state_abbr": "SP",
                "country_id": "BR",
                "postal_code": onlyDigits(CEP_ORIGEM)
            },
            "to": {
                "name": cleanText(shippingAddress.full_name),
                "phone": onlyDigits(shippingAddress.phone),
                "email": cleanText(shippingAddress.email, 'cliente@brasoconceito.com.br'),
                "document": onlyDigits(shippingAddress.cpf),
                "address": cleanText(shippingAddress.street),
                "complement": cleanText(shippingAddress.complement),
                "number": cleanText(shippingAddress.number, 'SN'),
                "district": cleanText(shippingAddress.neighborhood, 'Centro'),
                "city": cleanText(shippingAddress.city),
                "state_abbr": cleanText(shippingAddress.state, 'SP'),
                "country_id": "BR",
                "postal_code": onlyDigits(shippingAddress.cep)
            },
            "service": serviceId,
            "options": {
                "receipt": false,
                "own_hand": false,
                "non_commercial": true,
                "insurance_value": totalInsurance
            },
            "external_id": `APP_${orderId.substring(0, 8).toUpperCase()}`,
            "description": productNames.substring(0, 100),
            "products": items.map((i: any) => ({
                "name": cleanText(i.product_name, 'Produto').substring(0, 50),
                "quantity": i.quantity || 1,
                "unitary_value": Number(i.unit_price || 0)
            })),
            "volumes": [
                {
                    "format": "box",
                    "weight": clampedWeight,
                    "width": finalWidth,
                    "height": finalHeight,
                    "length": finalLength
                }
            ]
        };

        console.log('[SuperFrete] Enviando para /cart:', JSON.stringify(cartPayload));

        const response = await fetch(`${SUPERFRETE_BASE_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
                'User-Agent': 'Superfrete'
            },
            body: JSON.stringify(cartPayload)
        });

        const responseText = await response.text();
        let responseData: any;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = { error: 'Resposta não-JSON da SuperFrete', body: responseText };
        }

        console.log('[SuperFrete] Resposta da API:', response.status, JSON.stringify(responseData).substring(0, 500));

        if (!response.ok) {
            // Extrair mensagem de erro legível da resposta da SuperFrete
            const errDetail = responseData?.message || responseData?.error || JSON.stringify(responseData).substring(0, 300);
            const errMsg = `ERRO SuperFrete (HTTP ${response.status}): ${errDetail}`;
            await logToOrder(supabase, orderId, record.notes, errMsg);
            throw new Error(errMsg);
        }

        // Sucesso: salvar o ID do carrinho como código de rastreamento provisório
        const cartId = responseData?.id || responseData?.tracking || null;
        const successMsg = `✅ Etiqueta adicionada ao carrinho SuperFrete. Cart ID: ${cartId || 'não retornado'}. Serviço: ${serviceId}. Produtos: ${productNames.substring(0, 60)}`;

        await supabase
            .from('orders')
            .update({
                tracking_code: cartId,
                notes: (record.notes ? record.notes + '\n' : '') + `[${new Date().toISOString()}] ${successMsg}`
            })
            .eq('id', orderId);

        console.log(`[SuperFrete] Sucesso: ${successMsg}`);

        return new Response(JSON.stringify({ success: true, cartId, superFreteData: responseData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[SuperFrete] Erro fatal:', errorMessage);

        // Tenta salvar o erro no pedido se temos o orderId
        if (orderId) {
            try {
                const { data: ord } = await supabase
                    .from('orders')
                    .select('notes')
                    .eq('id', orderId)
                    .maybeSingle();
                await logToOrder(supabase, orderId, ord?.notes || null, `ERRO FATAL: ${errorMessage.substring(0, 250)}`);
            } catch (saveErr) {
                console.error('[SuperFrete] Não foi possível salvar erro no pedido:', saveErr);
            }
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // 200 para evitar retry loop do webhook
        });
    }
});

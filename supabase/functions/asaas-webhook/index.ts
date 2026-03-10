// supabase/functions/asaas-webhook/index.ts
// Edge Function para processar webhooks do ASAAS (confirmação de pagamento)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-access-token',
};

const WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN') || '';

// Map ASAAS payment status to our order status
function mapPaymentStatus(asaasStatus: string): string {
    switch (asaasStatus) {
        case 'CONFIRMED':
        case 'RECEIVED':
        case 'RECEIVED_IN_CASH':
            return 'paid';
        case 'PENDING':
            return 'awaiting_payment';
        case 'OVERDUE':
            return 'payment_overdue';
        case 'REFUNDED':
        case 'REFUND_REQUESTED':
        case 'CHARGEBACK_REQUESTED':
        case 'CHARGEBACK_DISPUTE':
            return 'refunded';
        case 'DUNNING_REQUESTED':
        case 'DUNNING_RECEIVED':
            return 'dunning';
        default:
            return 'pending';
    }
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Strict Validation: Server MUST have WEBHOOK_TOKEN configured
        if (!WEBHOOK_TOKEN) {
            console.error('[Webhook] Crítico: ASAAS_WEBHOOK_TOKEN ausente nas variáveis de ambiente. Recusando processar p/ segurança.');
            return new Response('Internal Server Error', { status: 500 });
        }

        const receivedToken = req.headers.get('asaas-access-token');
        if (receivedToken !== WEBHOOK_TOKEN) {
            console.warn('[Webhook] Invalid token received');
            return new Response('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        console.log('[Webhook] Event received:', body.event, 'Payment:', body.payment?.id);

        const { event, payment } = body;

        if (!payment?.id) {
            return new Response(JSON.stringify({ message: 'No payment data' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Use service role to update orders (webhook has no user context)
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        // Events we care about
        const paymentEvents = [
            'PAYMENT_CONFIRMED',
            'PAYMENT_RECEIVED',
            'PAYMENT_OVERDUE',
            'PAYMENT_REFUNDED',
            'PAYMENT_DELETED',
            'PAYMENT_UPDATED',
            'PAYMENT_DUNNING_RECEIVED',
        ];

        if (paymentEvents.includes(event)) {
            const newStatus = mapPaymentStatus(payment.status);
            const orderId = payment.externalReference;

            if (orderId) {
                const { error } = await supabase
                    .from('orders')
                    .update({
                        status: newStatus,
                        payment_confirmed_at: ['paid'].includes(newStatus) ? new Date().toISOString() : null,
                    })
                    .eq('id', orderId);

                if (error) {
                    console.error('[Webhook] Error updating order:', error);
                    throw error;
                }

                console.log(`[Webhook] Order ${orderId} updated to status: ${newStatus}`);

                // 🚀 MOMENTO DA EMOÇÃO: Se o pagamento foi confirmado, gera a etiqueta no SuperFrete automaticamente
                if (newStatus === 'paid') {
                    console.log(`[Webhook] Iniciando geração automática de etiqueta para o pedido ${orderId}...`);
                    try {
                        const baseUrl = Deno.env.get('SUPABASE_URL');
                        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
                        
                        // Chamando a Edge Function de etiqueta internamente
                        const shippingResponse = await fetch(`${baseUrl}/functions/v1/create-shipping-label`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${anonKey}`,
                            },
                            body: JSON.stringify({ orderId }),
                        });

                        const shippingResult = await shippingResponse.json();
                        if (shippingResponse.ok) {
                            console.log(`[Webhook] ✅ Etiqueta SuperFrete gerada com sucesso: ${shippingResult.label_id}`);
                        } else {
                            console.error(`[Webhook] ❌ Erro ao gerar etiqueta SuperFrete: ${shippingResult.error}`);
                        }
                    } catch (shippingErr) {
                        console.error('[Webhook] ❌ Falha crítica ao tentar chamar create-shipping-label:', shippingErr);
                    }
                }

                // If payment confirmed, you could trigger additional actions here:
                // - Send confirmation email
                // - Update stock
                // - Notify admin via WhatsApp
            } else {
                // Try to find by asaas_payment_id
                const { error } = await supabase
                    .from('orders')
                    .update({ status: newStatus })
                    .eq('asaas_payment_id', payment.id);

                if (error) {
                    console.error('[Webhook] Error updating order by asaas_payment_id:', error);
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Webhook processing error';
        console.error('[Webhook] Error:', message);
        return new Response(JSON.stringify({ error: message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});

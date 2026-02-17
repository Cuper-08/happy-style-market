// supabase/functions/create-payment/index.ts
// Edge Function para criar cobranças no ASAAS (PIX, Cartão, Boleto)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY') || '';
const ASAAS_BASE_URL = Deno.env.get('ASAAS_ENV') === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';

interface PaymentRequest {
    orderId: string;
    paymentMethod: 'pix' | 'card' | 'boleto';
    customer: {
        name: string;
        email: string;
        cpfCnpj: string;
        phone?: string;
    };
    value: number;
    description?: string;
    // Credit card fields (optional, only for card payments)
    creditCard?: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
    };
    creditCardHolderInfo?: {
        name: string;
        email: string;
        cpfCnpj: string;
        postalCode: string;
        addressNumber: string;
        phone: string;
    };
    installmentCount?: number;
}

async function asaasFetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${ASAAS_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY,
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('[ASAAS Error]', JSON.stringify(data));
        throw new Error(data.errors?.[0]?.description || 'Erro na API do ASAAS');
    }

    return data;
}

async function findOrCreateCustomer(customer: PaymentRequest['customer']) {
    // Try to find existing customer by CPF
    const searchResult = await asaasFetch(`/customers?cpfCnpj=${customer.cpfCnpj}`);

    if (searchResult.data?.length > 0) {
        return searchResult.data[0];
    }

    // Create new customer
    return await asaasFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
            name: customer.name,
            email: customer.email,
            cpfCnpj: customer.cpfCnpj,
            phone: customer.phone,
            notificationDisabled: false,
        }),
    });
}

function mapBillingType(method: string): string {
    switch (method) {
        case 'pix': return 'PIX';
        case 'card': return 'CREDIT_CARD';
        case 'boleto': return 'BOLETO';
        default: return 'PIX';
    }
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Verify authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Token de autenticação não fornecido');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error('Usuário não autenticado');
        }

        const body: PaymentRequest = await req.json();
        const { orderId, paymentMethod, customer, value, description, creditCard, creditCardHolderInfo, installmentCount } = body;

        // Validate required fields
        if (!orderId || !paymentMethod || !customer?.cpfCnpj || !value) {
            throw new Error('Campos obrigatórios: orderId, paymentMethod, customer.cpfCnpj, value');
        }

        // 1. Find or create customer in ASAAS
        const asaasCustomer = await findOrCreateCustomer(customer);

        // 2. Calculate due date (PIX/Boleto: today + 3 days | Card: today)
        const dueDate = new Date();
        if (paymentMethod !== 'card') {
            dueDate.setDate(dueDate.getDate() + 3);
        }
        const dueDateStr = dueDate.toISOString().split('T')[0];

        // 3. Build payment payload
        const paymentPayload: Record<string, unknown> = {
            customer: asaasCustomer.id,
            billingType: mapBillingType(paymentMethod),
            value,
            dueDate: dueDateStr,
            description: description || `Pedido Happy Style #${orderId}`,
            externalReference: orderId,
        };

        // For Credit Card payments, add card data
        if (paymentMethod === 'card' && creditCard) {
            paymentPayload.creditCard = creditCard;
            paymentPayload.creditCardHolderInfo = creditCardHolderInfo;
            if (installmentCount && installmentCount > 1) {
                paymentPayload.installmentCount = installmentCount;
                paymentPayload.installmentValue = Number((value / installmentCount).toFixed(2));
            }
        }

        // 4. Create payment in ASAAS
        const payment = await asaasFetch('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentPayload),
        });

        // 5. Build response based on payment method
        let responseData: Record<string, unknown> = {
            paymentId: payment.id,
            status: payment.status,
            value: payment.value,
            invoiceUrl: payment.invoiceUrl,
            bankSlipUrl: payment.bankSlipUrl,
        };

        // For PIX, get QR Code
        if (paymentMethod === 'pix') {
            // Wait a moment for ASAAS to generate the PIX QR Code
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                const pixData = await asaasFetch(`/payments/${payment.id}/pixQrCode`);
                responseData = {
                    ...responseData,
                    pixQrCode: pixData.encodedImage,
                    pixPayload: pixData.payload,
                    pixExpirationDate: pixData.expirationDate,
                };
            } catch (pixError) {
                console.warn('[ASAAS] PIX QR Code not immediately available, client should poll');
                responseData.pixPending = true;
            }
        }

        // 6. Update order in Supabase with ASAAS payment ID
        await supabase
            .from('orders')
            .update({
                asaas_payment_id: payment.id,
                status: 'awaiting_payment',
            })
            .eq('id', orderId);

        return new Response(JSON.stringify(responseData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro interno no servidor';
        console.error('[create-payment] Error:', message);

        return new Response(JSON.stringify({ error: message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});

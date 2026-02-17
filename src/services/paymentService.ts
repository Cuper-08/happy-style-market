import { supabase } from '@/integrations/supabase/client';

export interface PaymentCustomer {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
}

export interface CreditCardData {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
}

export interface CreditCardHolderInfo {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
}

export interface CreatePaymentRequest {
    orderId: string;
    paymentMethod: 'pix' | 'card' | 'boleto';
    customer: PaymentCustomer;
    value: number;
    description?: string;
    creditCard?: CreditCardData;
    creditCardHolderInfo?: CreditCardHolderInfo;
    installmentCount?: number;
}

export interface PaymentResponse {
    paymentId: string;
    status: string;
    value: number;
    invoiceUrl?: string;
    bankSlipUrl?: string;
    pixQrCode?: string;       // Base64 encoded QR Code image
    pixPayload?: string;      // Pix Copia e Cola
    pixExpirationDate?: string;
    pixPending?: boolean;
    error?: string;
}

export interface ShippingOption {
    id: number;
    name: string;
    company: string;
    price: number;
    delivery_time: number;
    delivery_range?: { min: number; max: number };
}

export interface ShippingResponse {
    options: ShippingOption[];
    fallback: boolean;
    error?: string;
}

/**
 * Creates a payment charge via ASAAS
 */
export async function createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    const { data: result, error } = await supabase.functions.invoke('create-payment', {
        body: data,
    });

    if (error) {
        throw new Error(error.message || 'Erro ao processar pagamento');
    }

    if (result?.error) {
        throw new Error(result.error);
    }

    return result as PaymentResponse;
}

/**
 * Polls for PIX QR Code if it wasn't immediately available
 */
export async function getPixQrCode(paymentId: string): Promise<{ pixQrCode: string; pixPayload: string } | null> {
    // This would call another edge function or directly query ASAAS
    // For now, the QR code is returned directly in createPayment response
    return null;
}

/**
 * Checks payment status by polling the order in Supabase
 */
export async function checkPaymentStatus(orderId: string): Promise<string> {
    const { data, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

    if (error) {
        throw new Error('Erro ao verificar status do pagamento');
    }

    return data?.status || 'pending';
}

/**
 * Calculates shipping options for a given destination CEP
 */
export async function calculateShipping(
    cepDestino: string,
    items: Array<{ quantity: number; weight?: number; insurance_value?: number }>
): Promise<ShippingResponse> {
    const { data: result, error } = await supabase.functions.invoke('calculate-shipping', {
        body: { cepDestino, items },
    });

    if (error) {
        // Return fallback options on error
        return {
            options: [
                { id: 1, name: 'PAC', company: 'Correios', price: 29.90, delivery_time: 10 },
                { id: 2, name: 'SEDEX', company: 'Correios', price: 49.90, delivery_time: 5 },
            ],
            fallback: true,
            error: error.message,
        };
    }

    return result as ShippingResponse;
}

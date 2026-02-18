
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPayment, calculateShipping } from '../services/paymentService'; // Adjust path if needed
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client module
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        functions: {
            invoke: vi.fn()
        }
    }
}));

describe('Payment Service - Sandbox Mock Mode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Spy on console.warn to suppress output and verify calls
        vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    it('createPayment should return mock data when Edge Function fails', async () => {
        // 1. Simulate Edge Function failure (e.g., network error or 500)
        (supabase.functions.invoke as any).mockRejectedValue(new Error('Simulated Network Error'));

        const mockData = {
            customer: {
                name: 'Sandbox Tester',
                cpfCnpj: '12345678900',
                email: 'test@sandbox.com',
                phone: '11999999999',
                address: 'Rua Teste',
                addressNumber: '123',
                province: 'Centro',
                postalCode: '01001000'
            },
            billingType: 'PIX',
            value: 150.00,
            dueDate: '2024-12-31',
            description: 'Teste Sandbox'
        };

        // 2. Call the service
        const result = await createPayment(mockData as any);

        // 3. Verify the Mock Response (Fallback)
        expect(result).toBeDefined();
        expect(result.status).toBe('PENDING');
        expect(result.paymentId).toMatch(/^pay_/); // Should start with 'pay_'
        expect(result.pixQrCode).toBeDefined(); // PIX payload
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('Payment service failed, falling back to SANDBOX MOCK'),
            expect.any(Error)
        );
    });

    it('calculateShipping should return fallback options when Edge Function fails', async () => {
        // 1. Simulate failure
        (supabase.functions.invoke as any).mockRejectedValue(new Error('Simulated Shipping Error'));

        // 2. Call the service
        const result = await calculateShipping('01001000', []);

        // 3. Verify Fallback Options
        expect(result).toBeDefined();
        expect(result.options).toBeInstanceOf(Array);
        expect(result.options.length).toBeGreaterThan(0);
        expect(result.options[0].name).toContain('PAC'); // Default fallback has PAC
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('Shipping service failed, using fallback'),
            expect.any(Error)
        );
    });
});

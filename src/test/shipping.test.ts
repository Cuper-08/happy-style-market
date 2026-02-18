
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateShipping } from '../services/paymentService';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client module
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        functions: {
            invoke: vi.fn()
        }
    }
}));

describe('Shipping Service - CEP Variation Tests (Phase 3)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    const testCeps = [
        { cep: '01001-000', region: 'São Paulo (Capital)' },
        { cep: '20040-002', region: 'Rio de Janeiro (Capital)' },
        { cep: '70040-010', region: 'Brasília (Distrito Federal)' },
        { cep: '69005-000', region: 'Manaus (Norte)' },
        { cep: '88010-000', region: 'Florianópolis (Sul)' }
    ];

    it.each(testCeps)('should calculate shipping for $region ($cep) using fallback', async ({ cep }) => {
        // Simulate failure to trigger fallback logic
        (supabase.functions.invoke as any).mockRejectedValue(new Error('Simulated Melhore-Envio Error'));

        const result = await calculateShipping(cep, []);

        expect(result).toBeDefined();
        expect(result.options).toBeInstanceOf(Array);
        expect(result.options.length).toBeGreaterThan(0);

        // Check if we have standard service types even in mock
        const serviceNames = result.options.map(o => o.name);
        expect(serviceNames).toContain('PAC');
        expect(serviceNames).toContain('SEDEX');

        console.log(`[Test] Frete para ${cep} verificado via Fallback.`);
    });

    it('should return error message in result when fallback is used', async () => {
        (supabase.functions.invoke as any).mockRejectedValue(new Error('Auth failed'));

        const result = await calculateShipping('00000-000', []);

        expect(result.error).toBe('Auth failed');
    });
});

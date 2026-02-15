import { z } from 'zod';

const viaCEPSchema = z.object({
  logradouro: z.string().max(200).optional().default(''),
  bairro: z.string().max(100).optional().default(''),
  localidade: z.string().max(100).optional().default(''),
  uf: z.string().max(2).optional().default(''),
  erro: z.boolean().optional(),
});

export type ViaCEPResult = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

const sanitize = (str: string): string =>
  str.trim().replace(/[<>"']/g, '');

export async function fetchCEP(cep: string): Promise<ViaCEPResult | null> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8 || !/^\d{8}$/.test(clean)) return null;

  const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  if (!response.ok) throw new Error('CEP API error');

  const raw = await response.json();
  const parsed = viaCEPSchema.safeParse(raw);

  if (!parsed.success || parsed.data.erro) return null;

  return {
    street: sanitize(parsed.data.logradouro || ''),
    neighborhood: sanitize(parsed.data.bairro || ''),
    city: sanitize(parsed.data.localidade || ''),
    state: sanitize(parsed.data.uf || ''),
  };
}

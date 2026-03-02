

## Corrigir bloqueio de origem na Edge Function de frete

### Problema identificado
A Edge Function `calculate-shipping` esta rejeitando requisicoes do preview do Lovable (`lovableproject.com`) porque o filtro de origem so permite `localhost`, `lovable.app` e `brasc`. O dominio `lovableproject.com` nao esta na lista permitida.

Alem disso, os headers CORS estao incompletos -- faltam headers que o cliente Supabase envia automaticamente.

### Solucao

**Arquivo:** `supabase/functions/calculate-shipping/index.ts`

1. **Atualizar os CORS headers** para incluir todos os headers enviados pelo cliente Supabase:
   - Adicionar: `x-supabase-client-platform`, `x-supabase-client-platform-version`, `x-supabase-client-runtime`, `x-supabase-client-runtime-version`

2. **Adicionar `lovableproject.com` na lista de origens permitidas**, junto com os dominios ja existentes (`lovable.app`, `brasc`, `localhost`).

3. **Re-deploy** da Edge Function apos a correcao.

### Detalhes tecnicos

Trecho atual que bloqueia:
```text
if (origin && !allowedExactOrigins.includes(origin) 
    && !origin.includes('lovable.app') 
    && !origin.includes('brasc')) {
  return new Response('Forbidden', { status: 403 });
}
```

Sera atualizado para:
```text
if (origin && !allowedExactOrigins.includes(origin) 
    && !origin.includes('lovable.app') 
    && !origin.includes('lovableproject.com')
    && !origin.includes('brasc')) {
  return new Response('Forbidden', { status: 403 });
}
```

E os CORS headers serao atualizados para o padrao completo do Supabase.

### Apos a correcao
- Re-deploy da funcao
- Teste automatico via curl para validar que a funcao responde corretamente

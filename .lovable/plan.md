
# Trocar integração de Melhor Envio para SuperFrete

## O que será feito

Substituir a chamada à API do Melhor Envio pela API do SuperFrete na Edge Function `calculate-shipping`, mantendo o mesmo formato de resposta para o frontend.

## Pré-requisitos do seu cliente

1. Criar conta na SuperFrete (https://web.superfrete.com)
2. Gerar um **token de API** em Integrações > Nova integração > Site próprio
3. Fornecer o token para ser salvo como secret no Supabase

## Alterações

### 1. Secrets do Supabase

- **Renomear/substituir** o secret `MELHOR_ENVIO_TOKEN` por `SUPERFRETE_TOKEN` com o token do cliente
- Manter `STORE_CEP` (CEP de origem da loja)
- Adicionar `SUPERFRETE_ENV` (valor: `sandbox` ou `production`)

### 2. Reescrever `supabase/functions/calculate-shipping/index.ts`

A Edge Function será atualizada para:

- Usar a URL da SuperFrete:
  - Sandbox: `https://sandbox.superfrete.com/api/v0/calculator`
  - Produção: `https://api.superfrete.com/api/v0/calculator`
- Enviar o body no formato da SuperFrete:

```text
{
  "from": { "postal_code": "CEP_ORIGEM" },
  "to": { "postal_code": "CEP_DESTINO" },
  "services": "1,2,17",
  "options": {
    "own_hand": false,
    "receipt": false,
    "insurance_value": 0,
    "use_insurance_value": false
  },
  "products": [
    { "quantity": 1, "weight": 0.3, "height": 5, "width": 15, "length": 20 }
  ]
}
```

- Autenticação via header `Authorization: Bearer {token}` e `User-Agent` obrigatório
- Mapear a resposta da SuperFrete para o mesmo formato `ShippingOption[]` que o frontend já consome (id, name, company, price, delivery_time)
- Manter fallback e modo simulação quando o token não estiver configurado

### 3. Nenhuma alteração no frontend

O `paymentService.ts` e o checkout continuam funcionando sem mudanças, pois o formato de resposta da Edge Function será mantido idêntico.

## Detalhes técnicos

### Mapeamento de serviços SuperFrete

| Código | Serviço |
|--------|---------|
| 1 | PAC |
| 2 | SEDEX |
| 17 | Mini Envios |
| 3 | Jadlog.Package |

### Headers obrigatórios da SuperFrete

```text
Authorization: Bearer {SUPERFRETE_TOKEN}
User-Agent: HappyStyleMarket (contato@email.com)
Content-Type: application/json
Accept: application/json
```

### Resposta esperada da SuperFrete (exemplo)

Cada item do array retornado contém campos como `name`, `price`, `delivery_time`, `error` (se houver), que serão mapeados para o formato existente.

## Arquivos modificados

- `supabase/functions/calculate-shipping/index.ts` - reescrever para usar API SuperFrete

## Passos na ordem

1. Solicitar o token SuperFrete do cliente e salvar como secret `SUPERFRETE_TOKEN`
2. Reescrever a Edge Function com a integração SuperFrete
3. Deploy automático da função
4. Testar o cálculo de frete no checkout

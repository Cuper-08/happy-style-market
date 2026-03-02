

# Integração SuperFrete - Etiqueta ao Marcar como Pago no Painel Admin

## Resumo
Quando o admin mudar o status de um pedido para **"pago"** no painel administrativo, o sistema automaticamente cria uma etiqueta de envio completa no SuperFrete com todos os dados do comprador, endereço, produtos e dimensões.

## Fluxo

```text
Admin muda status para "Pago" (painel)
        |
        v
Frontend detecta status = "paid"
        |
        v
Chama Edge Function "create-shipping-label"
        |
        v
Lê dados completos do pedido (Supabase service role)
  - order_items (nomes, quantidades, valores)
  - shipping_address (endereço do comprador)
  - profile (nome, CPF do comprador)
  - store_settings (remetente: Brás Conceito, CNPJ, endereço)
        |
        v
POST SuperFrete /api/v0/cart (cria etiqueta)
        |
        v
Salva superfrete_label_id no pedido
```

## Mudanças

### 1. Migração no Banco de Dados
Adicionar coluna `superfrete_label_id` (text, nullable) na tabela `orders` para armazenar o ID da etiqueta gerada.

### 2. Nova Edge Function: `create-shipping-label`
Recebe o `orderId`, busca todos os dados necessários do banco (pedido, itens, perfil do comprador, configurações da loja) e envia para a API SuperFrete `POST /api/v0/cart` com:

- **Remetente (from):** Brás Conceito, R. Conselheiro Belisário 41, Brás, São Paulo/SP, CEP 03012-000, CNPJ 59520505000120
- **Destinatário (to):** Nome, endereço, CPF vindos do pedido
- **Produtos:** Nome, quantidade, valor unitário de cada item
- **Volume:** Dimensões padrão (12x20x32cm, 1kg por item)
- **Serviço:** Baseado no `shipping_method` do pedido (pac=1, sedex=2, etc.)
- **Opções:** insurance_value = subtotal do pedido

Após sucesso, salva o `superfrete_label_id` na tabela `orders`.

### 3. Modificar `useAdminOrders.ts`
Na mutation `updateStatus`, quando o novo status for `"paid"`, chamar a edge function `create-shipping-label` logo após atualizar o status no banco. Mostrar toast de sucesso/erro da geração da etiqueta.

### 4. Atualizar `supabase/config.toml`
Registrar a nova função com `verify_jwt = false`.

## Detalhes Técnicos

### Payload SuperFrete `/cart`
```text
{
  from: {
    name: "Brás Conceito",
    address: "R. Conselheiro Belisário",
    number: "41",
    district: "Brás",
    city: "São Paulo",
    state_abbr: "SP",
    postal_code: "03012000",
    document: "59520505000120"
  },
  to: {
    name: "Nome do Comprador",
    address: "Rua do cliente",
    number: "123",
    district: "Bairro",
    city: "Cidade",
    state_abbr: "UF",
    postal_code: "01001000",
    document: "12345678900"
  },
  service: 1,
  products: [
    { name: "Produto X", quantity: 2, unitary_value: 150.00 }
  ],
  volumes: { height: 12, width: 20, length: 32, weight: 1 },
  options: { insurance_value: 300.00, non_commercial: true },
  platform: "Brás Conceito",
  tag: "order-id"
}
```

### Segurança
- Edge function usa `SUPABASE_SERVICE_ROLE_KEY` para ler dados do pedido (sem contexto de usuário)
- Valida que o pedido existe e está com status "paid" antes de gerar etiqueta
- Secrets necessários já configurados: `SUPERFRETE_TOKEN`, `SUPERFRETE_ENV`

### Arquivos
1. **Criar** `supabase/functions/create-shipping-label/index.ts`
2. **Modificar** `src/hooks/admin/useAdminOrders.ts` - chamar a edge function quando status = paid
3. **Modificar** `supabase/config.toml` - registrar nova função
4. **Migração SQL** - adicionar coluna `superfrete_label_id`


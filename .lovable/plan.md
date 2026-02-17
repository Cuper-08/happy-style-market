
## Corrigir Erros de Build TypeScript

Existem 2 erros independentes que precisam ser corrigidos:

---

### Erro 1 — `CheckoutPage.tsx` linha 332: `.insert()` recebe objeto em vez de array

O Supabase tipado espera que `.insert()` receba um **array** de objetos (tipo `Insert[]`), mas o código passa um objeto simples `{}`. O TypeScript está rejeitando porque o tipo esperado inclui métodos de array como `length`, `push`, `pop`, etc.

**Correção**: Envolver `orderData` em um array `[orderData]`.

```typescript
// ANTES (linha 332)
.insert(orderData)

// DEPOIS
.insert([orderData])
```

---

### Erro 2 — `OrderDetailPage.tsx` linhas 156-164: `shippingAddress` tipado como `Record<string, unknown>`

O objeto `shippingAddress` é declarado assim:

```typescript
const shippingAddress = order.shipping_address as Record<string, unknown>;
```

O tipo `unknown` não é atribuível a `ReactNode` diretamente. Ao usar `{shippingAddress.label}`, `{shippingAddress.street}`, etc., o TypeScript não sabe que esses valores são strings.

**Correção**: Fazer um cast mais específico para um tipo com os campos de endereço como `string | undefined`:

```typescript
// ANTES
const shippingAddress = order.shipping_address as Record<string, unknown>;

// DEPOIS
const shippingAddress = order.shipping_address as Record<string, string | null | undefined> | null;
```

Assim, os valores extraídos serão `string | null | undefined`, que é um `ReactNode` válido.

---

### Resumo dos arquivos a alterar

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| `src/pages/CheckoutPage.tsx` | 332 | `.insert(orderData)` → `.insert([orderData])` |
| `src/pages/admin/OrderDetailPage.tsx` | ~58 | Cast de `Record<string, unknown>` para `Record<string, string \| null \| undefined> \| null` |

São 2 mudanças pontuais, sem impacto em lógica ou comportamento do app.

---

### Nota sobre atualizações do GitHub

O Lovable sincroniza automaticamente com o GitHub em tempo real — não é necessário "puxar" manualmente. Qualquer commit feito no repositório já está refletido no código atual. Os erros de build acima já estavam presentes antes das suas edições no GitHub ou foram introduzidos por elas.

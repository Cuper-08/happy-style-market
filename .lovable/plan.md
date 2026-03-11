

# Fix: Campo "featured" não salva no produto

## Problema
O campo `featured` é enviado pelo formulário, mas a interface `ProductFormData` em `src/hooks/admin/useAdminProducts.ts` **não inclui** `featured`. Isso faz com que o TypeScript/Supabase ignore o campo na operação de update/insert, resultando no erro "Não foi possível atualizar o produto".

## Solução
Adicionar `featured?: boolean` à interface `ProductFormData` em `src/hooks/admin/useAdminProducts.ts` (linha ~22).

```typescript
interface ProductFormData {
  title: string;
  slug: string;
  description?: string;
  price?: number | null;
  price_display?: string | null;
  price_retail?: number | null;
  price_retail_display?: string | null;
  images?: string[];
  featured?: boolean;  // ← adicionar
}
```

### Arquivo modificado
- `src/hooks/admin/useAdminProducts.ts` — adicionar `featured` ao tipo `ProductFormData`


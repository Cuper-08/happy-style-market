

# Adicionar campo "Destaque" nos produtos

Excelente ideia. O admin poderá marcar produtos como "destaque" no formulário de cadastro/edição, e a HomePage priorizará esses produtos no topo da seção "Nossos Produtos".

## Mudanças

### 1. Migração no banco de dados
Adicionar coluna `featured` (boolean, default false) na tabela `products`.

```sql
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
```

### 2. Formulário de produto (`src/pages/admin/ProductFormPage.tsx`)
Adicionar um Switch "Produto em Destaque" na seção de informações básicas do formulário. Incluir o campo `featured` no schema zod e no submit.

### 3. Listagem admin (`src/pages/admin/ProductsPage.tsx`)
Mostrar um badge/estrela nos produtos marcados como destaque na tabela de produtos.

### 4. HomePage (`src/pages/HomePage.tsx`)
- Buscar produtos destacados separadamente (`featured = true`, ordenados por `price_retail` desc, limit 8)
- Manter a seção atual de tênis por preço abaixo
- Produtos destacados aparecem primeiro em uma seção "Destaques" ou mesclados no topo do grid

### 5. Hook `useProducts.ts`
Adicionar suporte ao filtro `featured?: boolean` no hook, para que a query filtre por `featured = true` quando solicitado.

### 6. Tipos (`src/integrations/supabase/types.ts`)
Será atualizado automaticamente pela migração.

### Arquivos modificados
1. **Migração SQL** — adicionar coluna `featured`
2. **`src/pages/admin/ProductFormPage.tsx`** — Switch de destaque no form
3. **`src/hooks/useProducts.ts`** — filtro `featured`
4. **`src/pages/HomePage.tsx`** — seção de destaques antes dos demais produtos
5. **`src/hooks/admin/useAdminProducts.ts`** — incluir `featured` no ProductFormData


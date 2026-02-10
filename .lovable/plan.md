

## Plano: Corrigir Erro de SKU Duplicado ao Salvar Produto

### Causa Raiz
A tabela `product_variants` tem uma constraint UNIQUE na coluna `sku`. Quando variantes sao salvas com SKU vazio (`""`), o PostgreSQL trata todas as strings vazias como o mesmo valor, violando a constraint unique.

O fluxo de update agrava o problema: ele deleta as variantes antigas e insere novas, mas se a delecao e insercao nao forem atomicas, pode haver conflito com variantes de OUTROS produtos que tambem tem SKU vazio.

### Solucao

Duas acoes combinadas:

#### 1. Remover a constraint UNIQUE do SKU (migracao SQL)
O SKU e opcional na maioria dos produtos. A constraint unique nao faz sentido para valores vazios/nulos. Vamos:
- Dropar a constraint `product_variants_sku_key`
- Criar um indice unico parcial que so aplica unicidade quando o SKU nao e nulo e nao e vazio

```sql
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_sku_key;
CREATE UNIQUE INDEX product_variants_sku_unique ON product_variants (sku) WHERE sku IS NOT NULL AND sku != '';
```

Isso permite multiplas variantes sem SKU, mas garante que SKUs preenchidos sejam unicos.

#### 2. Converter SKU vazio para null no codigo
Atualizar `useAdminProducts.ts` e `ProductFormPage.tsx` para converter strings vazias de SKU para `null` antes de enviar ao banco, evitando problemas futuros.

**Em `useAdminProducts.ts`** (createProduct e updateProduct mutations):
- Mapear variantes para converter `sku: ""` em `sku: null`

**Em `src/pages/admin/ProductFormPage.tsx`** (onSubmit):
- Na construcao de `validVariants`, converter `v.sku` vazio para `undefined`/`null`

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| Migracao SQL | Dropar constraint unique e criar indice parcial |
| `src/hooks/admin/useAdminProducts.ts` | Converter SKU vazio para null nas mutations |
| `src/pages/admin/ProductFormPage.tsx` | Converter SKU vazio para undefined no onSubmit |
| `src/hooks/admin/useBulkImport.ts` | Converter SKU vazio para null no bulk import |


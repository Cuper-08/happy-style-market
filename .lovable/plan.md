## Adaptar a Interface ao Schema Real do Banco de Dados

### Problema Atual

A interface usa nomes de campos que **nao existem** na tabela `products` real do Supabase. Veja o mapeamento:


| App espera (TypeScript)           | DB tem (real)  |
| --------------------------------- | -------------- |
| `name`                            | `title`        |
| `retail_price`                    | `price_retail` |
| `wholesale_price`                 | `price`        |
| `category_id`, `brand_id`         | nao existem    |
| `featured`, `is_new`, `is_active` | nao existem    |
| `wholesale_min_qty`               | nao existe     |


A tabela `product_variants` tambem difere: o DB tem `size` e `stock` (boolean), enquanto o app espera `color`, `color_hex`, `stock_quantity`, `sku`.

### Abordagem: Adaptar o codigo ao schema real

Em vez de alterar o banco (que voce ja populou), vou adaptar todo o codigo TypeScript para funcionar com o schema real. Campos que nao existem no DB serao tratados como opcionais com valores padrao.

### Arquivos a Modificar

**1. `src/types/index.ts` - Tipo Product**

Atualizar a interface para refletir o schema real:

```text
Product {
  id, title (em vez de name), slug, description,
  price (atacado), price_display,
  price_retail (varejo), price_retail_display,
  images, created_at, original_url,
  variants? (com size e stock boolean)
}
```

**2. `src/hooks/useProducts.ts` - Queries**

- Remover joins com `categories` e `brands` (nao existem FK no schema real)
- Remover filtros por `is_active`, `featured`, `is_new` (colunas inexistentes)
- Select simples: `*, variants:product_variants(*)`

**3. `src/components/product/ProductCard.tsx` - Card do Produto**

- `product.name` -> `product.title`
- `product.retail_price` -> `product.price_retail`
- `product.wholesale_price` -> `product.price`
- Usar `price_retail_display` quando disponivel (ja formatado)
- Remover badge "LANCAMENTO" (sem campo `is_new`)
- Remover logica de `brand.name`
- Remover logica de estoque baseada em `stock_quantity` (agora e boolean `stock`)

**4. `src/pages/ProductDetailPage.tsx` - Pagina de Detalhe**

- Mesmas renomeacoes de campos
- Remover secao de cores (sem `color`/`color_hex` no schema real)
- Tamanhos via `product_variants.size`
- Disponibilidade via `variant.stock` (boolean) em vez de `stock_quantity`
- Remover banner de atacado baseado em `wholesale_min_qty` (campo inexistente)
- Mostrar preco de varejo em destaque, atacado como secundario

**5. `src/pages/ProductsPage.tsx` - Listagem**

- `p.name` -> `p.title`
- `p.retail_price` -> `p.price_retail`
- Remover filtros `featured`/`is_new` dos searchParams

**6. `src/pages/CartPage.tsx` e `src/hooks/useCart.ts` - Carrinho**

- `product.name` -> `product.title`
- `product.retail_price` -> `product.price_retail`
- `product.wholesale_price` -> `product.price`
- Simplificar logica de preco (sem `wholesale_min_qty`, usar preco de varejo como padrao)

**7. `src/pages/CheckoutPage.tsx` - Checkout**

- `item.product.name` -> `item.product.title`
- Ajustar campos na criacao de order_items

**8. `src/pages/HomePage.tsx` - Home**

- Remover filtros `featured`/`isNew` (colunas inexistentes)
- Mostrar todos os produtos ou organizar de outra forma

**9. `src/components/home/ProductSection.tsx**`

- Nenhuma mudanca estrutural (usa ProductCard que sera atualizado)

**10. Admin (useAdminProducts, ProductsPage, ProductFormPage, etc.)**

- Adaptar para o schema real
- Remover campos inexistentes dos formularios e queries

### Regras de Exibicao (conforme sua especificacao)

- **Grid**: Imagem (`images[0]`), Titulo (`title`), Preco Varejo (`price_retail_display` ou formatado de `price_retail`)
- **Detalhe**: Todas as imagens no viewer 360, titulo, descricao, precos, tamanhos disponiveis
- **Atacado**: Mostrar `price_display` como label secundario (sem logica de quantidade minima por enquanto)

### Minha Opiniao sobre Layout

O layout atual dos cards e da pagina de detalhes ja esta muito bom. Sugiro manter:

- Card com imagem principal, titulo e preco de varejo em destaque
- Badge "ATACADO" com preco de atacado visivel apenas como informacao secundaria
- Na pagina de detalhe, preco de varejo grande e preco de atacado menor abaixo
- Viewer 360 para produtos com multiplas imagens (ja implementado)
- Organizar os produtos por linha/modelos.
- Adaptar/criar filtros inteligentes conforme linha dos produtos. Por exemplo, o modelo Air Jordan. O cliente clica nesse filtro e puxa os produtos Air Jordan.

A unica mudanca significativa e remover funcionalidades que dependem de colunas inexistentes (categorias, marcas, featured, is_new) ate que essas colunas sejam adicionadas ao banco futuramente.
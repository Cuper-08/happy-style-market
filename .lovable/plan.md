

## Exibir Produtos em Grid Vertical na Home (7+ linhas)

### Problema Atual

A home page mostra apenas **12 produtos em um carrossel horizontal** (componente `ProductSection` usa `Carousel`). O usuario so ve 2-4 produtos por vez e precisa deslizar para ver mais. Isso limita a visibilidade dos produtos.

### Solucao

Trocar o carrossel horizontal por um **grid vertical** que mostra pelo menos 7 linhas de produtos de uma vez. Aumentar o limite de produtos carregados de 12 para 28.

---

### Mudancas

**1. `src/pages/HomePage.tsx`**
- Aumentar o `limit` de 12 para **28** (7 linhas x 4 colunas no desktop, ou 7 linhas x 2 colunas no mobile = 14 minimo)
- Trocar `ProductSection` por `ProductGrid` na renderizacao dos produtos
- Manter o titulo "Nossos Produtos" e o link "Ver todos"

**2. `src/components/home/ProductSection.tsx`** (opcional - manter para uso futuro)
- Nenhuma alteracao necessaria, apenas deixamos de usa-lo na home

### Detalhes Tecnicos

```text
// HomePage.tsx - antes
const { data: allProducts = [], isLoading } = useProducts({ limit: 12 });
<ProductSection title="Nossos Produtos" products={allProducts} />

// HomePage.tsx - depois
const { data: allProducts = [], isLoading } = useProducts({ limit: 28 });
<section>
  <div> "Nossos Produtos" + "Ver todos" link </div>
  <ProductGrid products={allProducts} columns={4} />  // 2 cols mobile, 4 cols desktop
</section>
```

O `ProductGrid` ja existe em `src/components/product/ProductGrid.tsx` e suporta grids de 2, 3 ou 4 colunas. Com 28 produtos:
- **Mobile (2 colunas)**: 14 linhas
- **Desktop (4 colunas)**: 7 linhas

### Resumo

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/HomePage.tsx` | Aumentar limit para 28, trocar `ProductSection` por `ProductGrid` com header customizado |


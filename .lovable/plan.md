

## Organizar Produtos por Categoria e Implementar Filtros Inteligentes

### Situacao Atual

- **716 produtos** estao na categoria "Outros" quando deveriam estar em categorias especificas
- A pagina de produtos so funciona para "tenis" - todas as outras categorias mostram "Em breve"
- O tipo `Product` no TypeScript nao inclui o campo `category`
- O hook `useProducts` busca TODOS os produtos sem filtro de categoria

Distribuicao atual: Bolsas (15), Bone (45), Chinelo (10), Meias (102), Outros (716), Tenis (395)

---

### Parte 1: Recategorizar Produtos no Banco (SQL)

Executar updates em massa para mover os 716 produtos de "Outros" para suas categorias corretas, baseado nos titulos:

```text
Tenis (maioria dos 716):
- Air Jordan, Air Max, Air Force, Nike Dunk, Yeezy, Adizero, On Cloud, 
  Mizuno, New Balance, Balenciaga (tenis), Bape Sta, Alexander McQueen,
  Brooks, Hoka, Puma, ASICS, Travis Scott (tenis), TN, Zoom, NOCTA

Bolsas:
- Louis Vuitton Keepall, Neverfull, Bumbag, bag
- Gucci Bag, Fendi Bag, Pochete Prada
- ~10 produtos

Tenis Infantil:
- Produtos com "(GS)" no titulo
- ~1-2 produtos

Importados:
- Produtos high-end: Louis Vuitton (tenis), Gucci (tenis), Balenciaga, 
  Amiri, Diesel, Alexander McQueen
- ~30+ produtos
```

Serao executadas 4-5 queries UPDATE com ILIKE para recategorizar em massa.

---

### Parte 2: Atualizar Codigo

**1. Tipo Product (`src/types/index.ts`)**
- Adicionar campo `category?: string | null` ao interface Product

**2. Hook useProducts (`src/hooks/useProducts.ts`)**  
- Adicionar parametro `category` ao hook
- Filtrar por categoria no Supabase quando especificado
- Criar hook `useProductsByCategory(categorySlug)` para uso na pagina

**3. Pagina de Produtos (`src/pages/ProductsPage.tsx`)**
- Remover logica que bloqueia categorias nao-tenis (linhas 90, 104, 139-153)
- Filtrar produtos pela categoria da URL (`categorySlug`)
- Brand chips mostram apenas marcas presentes naquela categoria
- Manter filtros de preco existentes

**4. Filtros Inteligentes por Categoria**
- Cada categoria mostra chips de marca relevantes (extraidos dos produtos daquela categoria)
- Categoria "Tenis": Nike, Jordan, Adidas, New Balance, etc.
- Categoria "Bolsas": Louis Vuitton, Gucci, Fendi, Prada
- Categoria "Importados": todas as marcas premium
- Categorias com poucas marcas (Meias, Chinelo): esconder chips de marca

---

### Parte 3: Detalhes Tecnicos

**SQL de recategorizacao (via migration tool como data update):**

```text
-- 1. Bolsas (bags, keepall, neverfull, bumbag, pochete, bowling bag)
UPDATE products SET category = 'Bolsas' 
WHERE category = 'Outros' AND (
  title ILIKE '%bag%' OR title ILIKE '%keepall%' 
  OR title ILIKE '%neverfull%' OR title ILIKE '%bumbag%' 
  OR title ILIKE '%pochete%' OR title ILIKE '%bowling%'
  OR title ILIKE '%necessaire%'
);

-- 2. Tenis Infantil
UPDATE products SET category = 'Tênis Infantil' 
WHERE category = 'Outros' AND title ILIKE '%(GS)%';

-- 3. Importados (marcas premium que nao sao bolsas)
UPDATE products SET category = 'Importados' 
WHERE category = 'Outros' AND (
  title ILIKE '%louis vuitton%' OR title ILIKE '%gucci%' 
  OR title ILIKE '%balenciaga%' OR title ILIKE '%amiri%' 
  OR title ILIKE '%alexander mcqueen%' OR title ILIKE '%diesel%'
  OR title ILIKE '%fendi%' OR title ILIKE '%prada%'
);

-- 4. Todo o resto de "Outros" vira "Tenis" (sao tenis de diversas marcas)
UPDATE products SET category = 'Tênis' WHERE category = 'Outros';
```

**Mudanca no useProducts:**
```text
export function useProducts(options?: {
  searchQuery?: string;
  category?: string;    // NOVO
  limit?: number;
}) {
  // ...
  if (options?.category) {
    query = query.eq('category', options.category);
  }
}
```

**Mudanca no ProductsPage:**
```text
// Mapear slug da URL para nome de categoria no banco
const categoryMap: Record<string, string> = {
  'tenis': 'Tênis',
  'bolsas': 'Bolsas',
  'bone': 'Boné',
  'meias': 'Meias',
  'chinelo': 'Chinelo',
  'importados': 'Importados',
  'tenis-infantil': 'Tênis Infantil',
  // ... etc
};

// Buscar produtos filtrados por categoria
const categoryName = categorySlug ? categoryMap[categorySlug] : undefined;
const { data: products } = useProducts({ category: categoryName });

// Remover bloqueio de categorias nao-tenis
// Brand chips gerados dinamicamente dos produtos retornados
```

---

### Resumo

| Etapa | Acao | Arquivos |
|-------|------|----------|
| 1 | Recategorizar 716 produtos via SQL | Banco de dados |
| 2 | Adicionar `category` ao tipo Product | `src/types/index.ts` |
| 3 | Filtro por categoria no hook | `src/hooks/useProducts.ts` |
| 4 | Desbloquear todas as categorias | `src/pages/ProductsPage.tsx` |
| 5 | Filtros inteligentes por categoria | `src/pages/ProductsPage.tsx` |




## Plano: Corrigir Filtros do App (Busca + Filtros de Produto)

### Problemas Identificados

1. **Barra de busca no header**: O campo de pesquisa nao tem nenhuma logica conectada - e apenas visual, sem onChange, sem navegacao, sem filtragem.

2. **Filtros laterais (marca/preco)**: O componente `FilterContent` esta definido como uma funcao de componente DENTRO do render do `ProductsPage`. Isso faz o React tratar cada re-render como um componente novo, causando unmount/remount a cada clique de checkbox, o que torna a interacao instavel.

3. **Supabase default limit**: A query do Supabase retorna no maximo 1000 registros por padrao. Com 265 produtos atualmente funciona, mas nao escala para 500+.

### Solucao

#### 1. Barra de Busca Funcional (`src/components/layout/Header.tsx`)
- Adicionar estado `searchQuery` e handler `onSubmit`
- Ao pressionar Enter ou clicar no icone, navegar para `/produtos?q=termo`
- Funciona tanto no desktop quanto no mobile

#### 2. Filtro por busca no ProductsPage (`src/pages/ProductsPage.tsx`)
- Ler parametro `q` dos searchParams
- Filtrar produtos por nome (case-insensitive) usando `product.name.includes(query)`
- Exibir o termo buscado no titulo da pagina

#### 3. Corrigir FilterContent (`src/pages/ProductsPage.tsx`)
- Transformar `FilterContent` de componente interno para JSX inline ou extrair como componente separado fora do render
- Abordagem: extrair para um componente externo que recebe props (selectedBrands, priceRange, handlers, brands)
- Isso evita o bug de remount do React

#### 4. Paginacao no Supabase (`src/hooks/useProducts.ts`)
- Remover o limite padrao de 1000 adicionando `.range(0, 9999)` ou buscar em paginas para suportar 500+ produtos

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/layout/Header.tsx` | Adicionar logica de busca com navegacao para `/produtos?q=...` |
| `src/pages/ProductsPage.tsx` | Extrair FilterContent para fora do render; adicionar filtro por `q` (busca textual) |
| `src/hooks/useProducts.ts` | Garantir que todos os produtos sejam retornados (sem limite de 1000) |

### Detalhes Tecnicos

**Header.tsx:**
- Usar `useNavigate()` do react-router-dom
- Estado local `searchQuery`
- No submit do form (Enter): `navigate(\`/produtos?q=\${encodeURIComponent(searchQuery)}\`)`
- Limpar campo apos navegar

**ProductsPage.tsx:**
- Extrair `FilterContent` como componente separado (fora do ProductsPage) recebendo props:
  - `priceRange`, `setPriceRange`, `selectedBrands`, `toggleBrand`, `brands`, `hasActiveFilters`, `clearFilters`
- Adicionar filtro por texto no useMemo:
  ```
  const searchQuery = searchParams.get('q')?.toLowerCase();
  if (searchQuery) {
    result = result.filter(p => p.name.toLowerCase().includes(searchQuery));
  }
  ```
- Atualizar titulo para mostrar "Resultados para 'termo'" quando houver busca

**useProducts.ts:**
- Adicionar `.range(0, 4999)` na query para suportar ate 5000 produtos sem corte silencioso


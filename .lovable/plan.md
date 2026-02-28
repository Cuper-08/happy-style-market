

# Corrigir filtragem de produtos por categoria (incluir subcategorias)

## Problema

Ao clicar em "Malas", a pagina filtra por `category = 'Malas'` (match exato). Porem os produtos estao cadastrados com a subcategoria `"Malas de Bordo"`, que e filha de "Malas" na tabela `categories`. Por isso, nenhum produto aparece.

Este problema afeta todas as categorias-pai que possuem subcategorias (Malas, Tenis, Bolsas e Acessorios, Grifes Importadas).

## Solucao

Modificar o hook `useProducts` para que, quando uma categoria for informada, busque tambem os produtos das subcategorias.

### Alteracoes

**Arquivo: `src/hooks/useProducts.ts`**

Trocar o filtro `.eq('category', options.category)` por um filtro que inclua a categoria informada E todas as subcategorias dela. Para isso:

1. Antes de buscar os produtos, consultar a tabela `categories` para encontrar o ID da categoria pelo nome
2. Buscar todas as categorias cujo `parent_id` corresponda (filhas diretas e netas)
3. Coletar os nomes de todas essas categorias
4. Usar `.in('category', [...nomes])` em vez de `.eq('category', nome)`

Logica simplificada:

```text
// Dado categoryName = 'Malas'
// 1. Buscar categorias: Malas (id: X), Malas de Bordo (parent_id: X)
// 2. Nomes = ['Malas', 'Malas de Bordo']
// 3. query.in('category', ['Malas', 'Malas de Bordo'])
```

Como a hierarquia tem no maximo 3 niveis, uma unica query buscando todas as categorias e filtrando no JS e suficiente (a tabela categories tem poucas dezenas de registros).

### Nenhuma alteracao no banco de dados

Os dados ja estao corretos. A correcao e apenas no frontend.

### Arquivos modificados

- `src/hooks/useProducts.ts` - alterar filtro de categoria para incluir subcategorias


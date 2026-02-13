## Criar Categorias e Marcas Automaticamente na Importacao CSV

### Problema identificado

A importacao CSV apenas faz correspondencia (match) de categorias e marcas ja existentes no banco de dados. Se o nome no CSV nao corresponder exatamente a uma categoria/marca cadastrada, o produto fica sem categoria ou e marcado com erro. Alem disso, a comparacao nao normaliza acentos, entao "Tenis" (banco) nao corresponde a "Tênis" (CSV).

### Solucao

Alterar o fluxo de importacao para **criar automaticamente** categorias e marcas que nao existem no banco antes de inserir os produtos.

### Mudancas tecnicas

**1. Arquivo: `src/components/admin/csvTemplate.ts**`

- Melhorar a funcao `parseCSV` para normalizar acentos na comparacao de nomes (remover diacriticos com `normalize('NFD')`)
- Em vez de marcar erro quando categoria/marca nao existe, guardar o nome para criacao posterior
- Exportar uma nova interface `ParseResult` que inclua listas de categorias e marcas a criar

**2. Arquivo: `src/components/admin/BulkImportModal.tsx**`

- Antes de iniciar a importacao, verificar se ha categorias/marcas novas para criar
- Chamar `supabase.from('categories').insert(...)` e `supabase.from('brands').insert(...)` para criar as que nao existem
- Atualizar os `category_id` e `brand_id` nos produtos parseados com os IDs recebidos
- Invalidar as queries de categorias e marcas apos criacao

**3. Arquivo: `src/components/admin/csvTemplate.ts` - Normalizacao de nomes**

Adicionar funcao auxiliar para normalizar strings (remover acentos e converter para minusculo):

```
function normalize(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
```

Usar essa funcao tanto na criacao do mapa de categorias/marcas quanto na busca:

```
const catMap = new Map(categories.map(c => [normalize(c.name), c.id]));
const category_id = categoryName ? catMap.get(normalize(categoryName)) : undefined;
```

### Fluxo atualizado

1. Usuario faz upload do CSV
2. `parseCSV` identifica categorias/marcas que nao existem (sem marcar como erro)
3. Na tela de preview, categorias/marcas novas sao mostradas com badge indicativo
4. Ao clicar "Importar", o sistema primeiro cria as categorias/marcas novas no banco
5. Com os novos IDs, atualiza os produtos e insere tudo normalmente
6. Corrige letras com possuem caracteres especiais

### Resultado esperado

O usuario pode digitar qualquer nome de categoria/marca no CSV e o sistema cria automaticamente as que nao existirem, eliminando erros de correspondencia.
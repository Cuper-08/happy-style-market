

## Exportacao com Variantes + Deteccao Automatica de Cores

### Resumo

Duas melhorias no fluxo de exportacao/importacao:

1. **Incluir variantes (tamanho, cor, estoque) na planilha de exportacao/atualizacao** para permitir edicao em massa de tamanhos
2. **Detectar cores automaticamente pela nomenclatura do produto** ao importar, criando as variantes de cor sem precisar preencher manualmente

### Como vai funcionar

**Exportacao expandida:**
- O CSV exportado tera uma linha por variante (nao por produto)
- Produtos com 3 variantes geram 3 linhas, cada uma com os dados do produto + dados da variante
- Novas colunas: `variant_id`, `tamanho`, `cor`, `cor_hex`, `estoque`, `sku`
- Voce edita os tamanhos no Excel e reimporta normalmente

**Deteccao de cores na importacao:**
- Ao importar produtos via CSV, se a coluna `cor` estiver vazia, o sistema analisa o nome do produto
- Exemplo: "Adizero Adios Pro 4 VERMELHO-PRETO" gera automaticamente cor = "Vermelho-Preto" com hex aproximado
- Um dicionario de ~30 cores (preto, branco, vermelho, azul, verde, rosa, etc.) mapeia nomes para codigos hex
- Cores compostas como "BRANCO-VERMELHO" sao tratadas usando a primeira cor como hex principal

### Detalhes Tecnicos

**Arquivo 1: `src/components/admin/csvExportProducts.ts`** (editar)
- Expandir a exportacao para gerar uma linha por variante
- Adicionar colunas: `variant_id`, `tamanho`, `cor`, `cor_hex`, `estoque`, `sku`
- Produtos sem variantes geram 1 linha com campos de variante vazios

Formato do CSV:
```
id;variant_id;nome;slug;categoria;marca;preco_varejo;preco_atacado;qtd_min_atacado;destaque;novo;ativo;tamanho;cor;cor_hex;estoque;sku
```

**Arquivo 2: `src/components/admin/csvTemplate.ts`** (editar)
- Atualizar `parseUpdateCSV` para processar as novas colunas de variante
- Agrupar linhas pelo `id` do produto (varias linhas = varias variantes do mesmo produto)
- Detectar mudancas em campos de variante (tamanho, cor, estoque) alem dos campos de produto
- Novo tipo `VariantDiff` para representar mudancas em variantes
- Adicionar funcao `extractColorFromName(productName)` com dicionario de cores PT-BR para hex
- Integrar deteccao de cores no `parseCSV` (importacao de novos produtos): se `cor` estiver vazia, extrair do nome

Dicionario de cores incluira: preto (#000000), branco (#FFFFFF), vermelho (#FF0000), azul (#0000FF), verde (#008000), amarelo (#FFD700), rosa (#FF69B4), laranja (#FF8C00), cinza (#808080), marrom (#8B4513), bege (#F5DEB3), prata (#C0C0C0), dourado (#FFD700), lilas (#9370DB), roxo (#800080), ciano (#00CED1), fluorescente (#ADFF2F), cafe (#6F4E37), off white (#FAF9F6), entre outros.

**Arquivo 3: `src/hooks/admin/useBulkUpdate.ts`** (editar)
- Expandir a mutation para tambem atualizar/criar variantes em `product_variants`
- Novo campo `variantChanges` no tipo `ProductChange` para alteracoes em variantes
- Para variantes existentes (com `variant_id`): atualizar size, color, color_hex, stock_quantity
- Para variantes novas (sem `variant_id`): inserir nova variante

**Arquivo 4: `src/components/admin/BulkUpdateModal.tsx`** (editar)
- Expandir o tipo `ProductDiff` para incluir mudancas de variantes
- Exibir mudancas de variantes no resumo de revisao (ex: "Tamanho: 42 -> 38")
- Adicionar labels para novos campos: Tamanho, Cor, Estoque

**Arquivo 5: `src/hooks/admin/useBulkImport.ts`** (editar)
- Garantir que variantes criadas pela deteccao automatica de cores sejam inseridas corretamente

### Logica de deteccao de cores

```text
Nome: "Adizero Adios Pro 4 VERMELHO-PRETO"
                          ^^^^^^^^^^^^^^^^^
                          Parte em MAIUSCULAS apos o modelo

1. Separar a parte em maiusculas do final do nome
2. Dividir por "-" para identificar cores individuais
3. Buscar cada cor no dicionario
4. Usar o hex da primeira cor encontrada como cor principal
5. Nome da cor = parte completa formatada (ex: "Vermelho-Preto")
```


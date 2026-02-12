

## Correcao da Deteccao Automatica de Cores + Guia de Tamanhos no CSV

### Problema Atual

A deteccao de cores pelo nome do produto existe no codigo, mas **so funciona quando a coluna `tamanho` esta preenchida**. Se voce importa um produto sem preencher tamanho, nenhuma variante e criada, e portanto a cor tambem nao e gerada. Alem disso, o fluxo de **atualizacao via CSV** nao aplica deteccao de cores para produtos que ainda nao tem variantes.

### Como cadastrar tamanhos na planilha

Cada **linha** do CSV representa uma variante. Para um tenis com tamanhos 41, 42 e 43, voce precisa de **3 linhas** com o mesmo nome:

```text
nome;slug;...;tamanho;cor;cor_hex;estoque;sku
Adizero Pro VERMELHO;adizero-pro-vermelho;...;41;;;50;
Adizero Pro VERMELHO;adizero-pro-vermelho;...;42;;;30;
Adizero Pro VERMELHO;adizero-pro-vermelho;...;43;;;20;
```

Nao precisa separar por virgula. O sistema agrupa as linhas pelo nome e cria uma variante por linha. A cor sera detectada automaticamente do nome ("VERMELHO") e aplicada a todas as 3 variantes.

### O que sera corrigido

**1. Importacao de novos produtos (`parseCSV` em `csvTemplate.ts`)**
- Se um produto nao tem nenhuma variante no CSV (nenhuma linha com `tamanho`), mas o nome contem uma cor detectavel, criar automaticamente uma variante com `size = "Unico"` e a cor extraida do nome
- Se as variantes existem mas nao tem cor preenchida, aplicar a cor detectada (isso ja funciona)

**2. Atualizacao via CSV (`parseUpdateCSV` em `csvTemplate.ts`)**
- Ao processar produtos no fluxo de atualizacao, se o produto nao tem variantes no banco E nao tem linhas de variante no CSV, mas o nome contem cor, criar nova variante com `size = "Unico"` e cor detectada
- Isso permite que produtos ja cadastrados sem variantes ganhem a cor automaticamente ao reimportar

**3. Importacao em massa (`useBulkImport.ts`)**
- Garantir que variantes com `size = "Unico"` sejam inseridas corretamente (ja funciona, sem alteracao necessaria)

### Detalhes Tecnicos

**Arquivo: `src/components/admin/csvTemplate.ts`**

Na funcao `parseCSV` (importacao de novos):
- Apos montar o array `variants`, verificar se esta vazio
- Se vazio e `extractColorFromName(name)` retorna resultado, criar uma variante: `{ size: 'Unico', color, color_hex, stock_quantity: 0 }`

Na funcao `parseUpdateCSV` (atualizacao):
- Apos processar todas as linhas de um produto, se `newVariants` esta vazio e `variantDiffs` esta vazio e o produto no banco nao tem variantes
- Executar `extractColorFromName(current.name)` e, se encontrar cor, adicionar em `newVariants`

**Arquivo: `src/components/admin/BulkUpdateModal.tsx`**
- No resumo de revisao, exibir novas variantes criadas por deteccao automatica com um indicador visual (ex: badge "Auto" ou "Detectada do nome")

Alteracoes em 2 arquivos, sem mudanca de banco de dados.


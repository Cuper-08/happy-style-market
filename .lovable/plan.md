

## Edicao em Massa via Exportacao/Importacao de Planilha

### Por que a abordagem de planilha e melhor

Entre as duas opcoes que voce mencionou, a **exportacao + reimportacao de planilha** e a mais adequada para o seu caso:

- Voce tem 255+ produtos e precisa editar muitos de uma vez
- O Excel/Google Sheets oferece filtros, busca e edicao muito mais rapidos que qualquer interface web
- Funciona para qualquer campo futuro (numeracao, categorias, etc.) sem precisar alterar a tela
- So atualiza no banco o que realmente mudou no arquivo

### Como vai funcionar

1. Voce clica em **"Exportar Produtos"** na tela de produtos
2. Um arquivo CSV e baixado com todos os produtos (id, nome, preco varejo, preco atacado, etc.)
3. Voce abre no Excel, filtra por "Adizero", altera os precos, salva
4. Voce clica em **"Atualizar via CSV"** e envia o arquivo de volta
5. O sistema compara cada linha com o banco e **so atualiza os campos que mudaram**
6. Um resumo mostra quantos produtos foram atualizados

### Detalhes Tecnicos

**Arquivo 1: `src/components/admin/csvExportProducts.ts`** (novo)
- Funcao `exportProductsCSV(products)` que gera um CSV com colunas: `id`, `nome`, `slug`, `categoria`, `marca`, `preco_varejo`, `preco_atacado`, `qtd_min_atacado`, `destaque`, `novo`, `ativo`
- O `id` e essencial para vincular cada linha ao produto correto no banco
- Formato identico ao template de importacao, com a adicao da coluna `id`

**Arquivo 2: `src/components/admin/BulkUpdateModal.tsx`** (novo)
- Modal para upload do CSV de atualizacao
- Parseia o CSV e compara cada campo com os dados atuais dos produtos (recebidos via props)
- Exibe um resumo de diferencas antes de confirmar (ex: "12 produtos serao atualizados")
- Lista os campos alterados por produto para revisao
- Botao de confirmar executa as atualizacoes

**Arquivo 3: `src/hooks/admin/useBulkUpdate.ts`** (novo)
- Mutation `useBulkUpdateProducts` que recebe array de `{ id, changes }` 
- Executa updates individuais no Supabase (apenas os campos que mudaram)
- Processa em lotes de 10 para estabilidade
- Invalida o cache de produtos apos sucesso

**Arquivo 4: `src/pages/admin/ProductsPage.tsx`** (editar)
- Adicionar botao "Exportar Produtos" ao lado de "Baixar Modelo"
- Adicionar botao "Atualizar via CSV" ao lado de "Importar CSV"
- Integrar o `BulkUpdateModal`
- Passar os produtos atuais para o modal (para comparacao de diferencas)

**Arquivo 5: `src/components/admin/csvTemplate.ts`** (editar)
- Adicionar funcao `parseUpdateCSV` que le o CSV de atualizacao (com coluna `id`)
- Retorna apenas os campos que diferem dos valores atuais

### Colunas do CSV de exportacao

```
id;nome;slug;categoria;marca;preco_varejo;preco_atacado;qtd_min_atacado;destaque;novo;ativo
```

### Logica de comparacao (diff)

Para cada linha do CSV reimportado:
1. Localiza o produto pelo `id`
2. Compara `preco_varejo`, `preco_atacado`, `qtd_min_atacado`, `destaque`, `novo`, `ativo`
3. Monta um objeto apenas com os campos que mudaram
4. Se nenhum campo mudou, ignora a linha
5. Exibe resumo antes de executar


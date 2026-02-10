

## Plano: Importacao em Massa de Produtos via CSV

### Visao Geral
Adicionar na pagina de Produtos do painel admin:
1. Botao "Importar CSV" ao lado do botao "Novo Produto"
2. Botao "Baixar Modelo" para download de um arquivo CSV padrao preenchivel
3. Modal de importacao com upload, preview dos dados, e processamento em lote
4. Aumento do limite de imagens por produto de 5 para 10

### Modelo CSV Padrao
O arquivo tera as seguintes colunas (separadas por ponto e virgula para compatibilidade com Excel BR):

```text
nome;slug;descricao;categoria;marca;preco_varejo;preco_atacado;qtd_min_atacado;destaque;novo;ativo;tamanho;cor;cor_hex;estoque;sku
Tenis Exemplo;tenis-exemplo;Descricao do produto;Tenis;Nike;299.90;199.90;6;sim;sim;sim;38;Preto;#000000;50;SKU001
Tenis Exemplo;tenis-exemplo;;Tenis;Nike;299.90;199.90;6;sim;sim;sim;39;Preto;#000000;30;SKU002
```

- Cada linha com variante diferente do mesmo produto repete o nome/slug
- Categoria e marca sao referenciadas pelo **nome** (mais facil de preencher)
- Campos opcionais podem ficar vazios
- O sistema agrupa automaticamente variantes pelo slug

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/admin/BulkImportModal.tsx` | **Criar** - Modal com upload CSV, preview em tabela, e botao de importar |
| `src/components/admin/csvTemplate.ts` | **Criar** - Funcao para gerar e baixar o modelo CSV |
| `src/pages/admin/ProductsPage.tsx` | **Modificar** - Adicionar botoes "Importar CSV" e "Baixar Modelo" |
| `src/hooks/admin/useAdminProducts.ts` | **Modificar** - Adicionar mutation de importacao em lote |
| `src/components/admin/ImageUploader.tsx` | **Modificar** - Aumentar limite padrao de imagens para 10 |

### Detalhes Tecnicos

**1. csvTemplate.ts**
- Funcao `downloadCSVTemplate()` que gera um arquivo CSV com headers e 2 linhas de exemplo
- Usa `Blob` + `URL.createObjectURL` para download direto no navegador
- Separador `;` para compatibilidade com Excel em portugues

**2. BulkImportModal.tsx**
- Dialog com dropzone para upload do arquivo CSV
- Parser de CSV que:
  - Detecta separador (`;` ou `,`)
  - Ignora linhas vazias
  - Agrupa linhas pelo slug para montar produto + variantes
  - Resolve nomes de categoria/marca para IDs reais do banco
- Tabela de preview mostrando produtos detectados, quantidade de variantes, e status de validacao
- Indicadores de erro (categoria/marca nao encontrada, campos obrigatorios faltando)
- Barra de progresso durante importacao
- Processamento em lotes de 10 produtos por vez para nao sobrecarregar o banco
- Slug auto-gerado se nao informado

**3. ProductsPage.tsx**
- Adicionar botao "Importar CSV" com icone Upload
- Adicionar botao "Baixar Modelo" com icone Download
- Ambos no header, ao lado do "Novo Produto"

**4. useAdminProducts.ts**
- Nova mutation `bulkCreateProducts` que recebe array de produtos com variantes
- Insere produtos em lotes de 10 usando `supabase.from('products').insert(batch).select()`
- Apos inserir cada lote de produtos, insere as variantes correspondentes
- Retorna contagem de sucessos e falhas

**5. ImageUploader.tsx**
- Aumentar `maxImages` padrao de 5 para 10 para suportar mais de 2000 imagens distribuidas em 500 produtos

### Fluxo do Usuario

```text
1. Clica "Baixar Modelo" -> baixa CSV padrao
2. Preenche no Excel/Google Sheets com seus 500 produtos
3. Salva como CSV (separado por ;)
4. Clica "Importar CSV" -> abre modal
5. Arrasta ou seleciona o arquivo CSV
6. Ve preview com lista de produtos detectados
7. Corrige erros se houver (categoria/marca nao encontrada)
8. Clica "Importar Todos"
9. Barra de progresso mostra andamento
10. Ao finalizar, lista de produtos atualiza automaticamente
11. Depois, edita cada produto individualmente para adicionar imagens
```

### Consideracoes de Performance para 500+ Produtos
- Insercao em lotes de 10 produtos por vez
- Uso de `Promise.all` controlado para nao estourar limites do Supabase
- A query de listagem ja usa paginacao implicita (limite de 1000 do Supabase e suficiente para 500 produtos)
- O preview da tabela usa virtualizacao basica (mostra apenas primeiros 50 e indica total)


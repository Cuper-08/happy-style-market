

## Variantes na Mesma Linha do CSV (separadas por virgula)

### Como vai funcionar

Hoje, para cadastrar um produto com 5 tamanhos, voce precisa de 5 linhas. Com a nova logica, basta **1 linha**:

```text
nome;slug;...;tamanho;cor;cor_hex;estoque;sku
Tenis Runner;tenis-runner;...;38,39,40,41,42;Preto;#000000;50;
```

Isso gera automaticamente **5 variantes** (uma por tamanho), todas com cor "Preto", hex "#000000" e estoque 50.

### Combinacoes tamanho x cor

Se voce tambem informar varias cores separadas por virgula, o sistema cria o **produto cartesiano** (todas as combinacoes):

```text
tamanho: 38,39,40
cor: Preto,Branco
cor_hex: #000000,#FFFFFF
```

Resultado: 6 variantes (38/Preto, 38/Branco, 39/Preto, 39/Branco, 40/Preto, 40/Branco), todas com o mesmo estoque.

### Regras

- Separador de variantes dentro da celula: **virgula ( , )**
- Separador de colunas do CSV continua sendo **ponto e virgula ( ; )**
- Estoque: o valor informado e aplicado igualmente a todas as variantes geradas
- SKU: quando ha multiplas variantes, o SKU nao e aplicado (pois precisa ser unico por variante)
- A logica antiga (linhas duplicadas) continua funcionando normalmente

### Mudancas tecnicas

**Arquivo: `src/components/admin/csvTemplate.ts`**

1. **Template de exemplo** (`downloadCSVTemplate`): Atualizar o exemplo para mostrar multiplos tamanhos na mesma celula (ex: `38,39,40,41,42`) em vez de linhas duplicadas.

2. **Funcao `parseCSV`** (linhas 353-366): Alterar a logica de geracao de variantes para:
   - Verificar se o campo `tamanho` contem virgulas; se sim, dividir em array de tamanhos
   - Verificar se o campo `cor` contem virgulas; se sim, dividir em array de cores (e `cor_hex` tambem)
   - Gerar o produto cartesiano de tamanhos x cores
   - Aplicar o mesmo estoque para todas as variantes geradas
   - SKU so e aplicado quando resulta em exatamente 1 variante

3. **Funcao `parseUpdateCSV`**: Manter como esta (atualizar variantes existentes usa IDs individuais, entao nao faz sentido multiplos valores na mesma celula).

Nenhuma alteracao no banco de dados ou nas funcoes de bulk import/update e necessaria, pois elas ja recebem arrays de variantes prontos.

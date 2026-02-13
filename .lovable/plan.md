

## Expansao Visual de Variantes no Formulario + Correcao na Pagina do Produto

### O que muda

Duas correcoes principais:

### 1. Formulario admin: botao "Gerar Variantes" (ProductFormPage.tsx)

Hoje, ao digitar "38,39,40" no tamanho e "Preto,Branco" na cor, o sistema so expande na hora de salvar (invisivel para o usuario). A mudanca adiciona um **botao "Gerar Variantes"** ao lado de cada linha que contenha virgulas, que ao ser clicado:

- Detecta virgulas nos campos tamanho e/ou cor
- Expande imediatamente em linhas individuais no formulario
- Remove a linha original e substitui pelas linhas expandidas

**Exemplo visual:**

Antes (1 linha):
```text
Tamanho: 38,39,40  |  Cor: Preto,Branco  |  Estoque: 162
```

Depois de clicar "Gerar" (6 linhas):
```text
Tamanho: 38  |  Cor: Preto   |  Hex: #000000  |  Estoque: 162
Tamanho: 38  |  Cor: Branco  |  Hex: #FFFFFF  |  Estoque: 162
Tamanho: 39  |  Cor: Preto   |  Hex: #000000  |  Estoque: 162
Tamanho: 39  |  Cor: Branco  |  Hex: #FFFFFF  |  Estoque: 162
Tamanho: 40  |  Cor: Preto   |  Hex: #000000  |  Estoque: 162
Tamanho: 40  |  Cor: Branco  |  Hex: #FFFFFF  |  Estoque: 162
```

Assim voce ve exatamente o que sera criado antes de salvar.

### 2. Pagina do produto: selecao de cor e tamanho independentes (ProductDetailPage.tsx)

A selecao de variantes atual tem um bug: ao clicar na cor, o estado inteiro e substituido, e ao clicar no tamanho, perde a cor selecionada. A correcao separa em dois estados independentes (`selectedColor` e `selectedSize`), e o sistema busca a variante correta na intersecao dos dois.

Fluxo corrigido (igual Netshoes):
1. Usuario clica numa **cor** - mostra os tamanhos disponiveis para aquela cor
2. Usuario clica num **tamanho** - o sistema encontra a variante exata (cor + tamanho)
3. Estoque e preco refletem a variante selecionada

### 3. Limpeza do banco de dados

Deletar a variante antiga mal formatada (ID `a65a78fe-...`) que contem "38,39,40,42,43" como texto literal no campo tamanho.

### Detalhes tecnicos

**Arquivo: `src/pages/admin/ProductFormPage.tsx`**

- Adicionar funcao `expandVariants(index)` que:
  - Le os valores da linha no indice informado
  - Divide `size` e `color` por virgula
  - Gera o produto cartesiano
  - Remove a linha original com `remove(index)`
  - Insere as novas linhas com `append()` para cada combinacao
- Adicionar botao "Gerar" ao lado do botao de lixeira em cada linha de variante
- O botao so aparece quando o campo tamanho ou cor contem virgulas

**Arquivo: `src/pages/ProductDetailPage.tsx`**

- Substituir `selectedVariant` por dois estados: `selectedColor` (string | null) e `selectedSize` (string | null)
- Derivar `selectedVariant` com `useMemo`: buscar em `product.variants` a variante onde `color === selectedColor && size === selectedSize`
- Ao clicar numa cor: setar `selectedColor`, resetar `selectedSize`
- Ao clicar num tamanho: setar `selectedSize`
- Filtrar tamanhos disponiveis baseado na cor selecionada
- Manter compatibilidade com produtos sem variantes


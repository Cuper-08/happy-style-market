

## Destaque de Desconto Atacado na Pagina do Produto

### Problema

Na pagina de detalhes do produto, nao ha nenhum aviso claro sobre o desconto de atacado. O preco de atacado so aparece quando `wholesale_price < retail_price`, e mesmo assim sem destaque visual. O usuario quer um banner chamativo informando que a partir de X unidades, o preco unitario cai para o preco de atacado, e que o desconto seja aplicado automaticamente ao atingir a quantidade.

### Solucao

**Arquivo: `src/pages/ProductDetailPage.tsx`**

1. **Banner de atacado destacado**: Adicionar um card/banner visualmente chamativo (com fundo colorido, icone de etiqueta) logo abaixo dos precos, mostrando:
   - Preco de atacado por unidade
   - Quantidade minima necessaria (usando `wholesale_min_qty` do produto)
   - Economia por unidade e economia total estimada
   - Exemplo: "Compre a partir de 6 unidades por R$ 199,27 cada! Economize R$ 100,00 por unidade"

2. **Indicador dinamico na quantidade**: Quando o usuario estiver abaixo da quantidade minima, mostrar quantas unidades faltam. Quando atingir, mostrar confirmacao visual de que o preco de atacado foi aplicado.

3. **Atualizar total automaticamente**: O calculo do total ja existe no codigo (`currentPrice * quantity`), mas a condicao `hasWholesale` precisa considerar quando `wholesale_price` existe (independente de ser menor que o retail, ja que o usuario quer sempre usar a coluna atacado).

**Arquivo: `src/pages/CartPage.tsx`**

4. **Indicador no carrinho**: Adicionar uma dica abaixo de cada item mostrando quantas unidades faltam para atingir o preco de atacado (quando aplicavel).

### Detalhes Tecnicos

**`src/pages/ProductDetailPage.tsx`**:
- Alterar condicao `hasWholesale` para: `product.wholesale_price != null && product.wholesale_price > 0`
- Adicionar um componente de banner entre a secao de precos e a selecao de cor/tamanho
- O banner tera fundo `bg-green-50 dark:bg-green-950` com borda, icone de Tag/Percent e texto informativo
- Atualizar o indicador na secao de quantidade para ser mais visivel (badge colorido)

**`src/hooks/useCart.ts`**:
- Verificar que `getItemPrice` usa `wholesale_min_qty` do produto (ja faz isso, sem alteracao necessaria)

**`src/pages/CartPage.tsx`**:
- Adicionar hint abaixo de cada item: "Adicione mais X para preco de atacado" quando a quantidade estiver abaixo do minimo e o produto tiver preco de atacado

Alteracoes em 2 arquivos, sem mudanca de banco de dados.


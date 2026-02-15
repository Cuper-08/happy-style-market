

## Organizar Produtos por Categorias, Limpar Descrições e Desconto Atacado 6+

### 1. Filtros Inteligentes por Marca/Linha (extraídos do título)

Como a tabela `products` não tem coluna `category_id` ou `brand`, vamos extrair a marca/linha automaticamente do campo `title` usando um dicionário no frontend.

**Marcas detectadas nos seus produtos atuais:**
- Air Jordan
- Balenciaga
- Nike (SB Dunk, etc.)
- Adidas (Superstar, Yeezy)
- On Cloudtilt
- New Balance
- Gucci
- Louis Vuitton
- Travis Scott (collabs)

**Arquivo novo: `src/lib/productCategories.ts`**
- Dicionário de marcas com palavras-chave para match no título
- Função `extractBrand(title)` que retorna a marca do produto
- Função `getAvailableBrands(products)` que retorna marcas presentes nos produtos carregados

**Modificações em `src/pages/ProductsPage.tsx`:**
- Adicionar filtro por marca na sidebar e no Sheet mobile
- Chips/botões clicáveis por marca no topo da página
- Combinar com o filtro de preço existente
- URL query param `?marca=air-jordan` para links diretos

**Modificações em `src/pages/HomePage.tsx`:**
- Seção de marcas clicáveis acima dos produtos (chips horizontais com scroll)
- Ao clicar, redireciona para `/produtos?marca=air-jordan`

---

### 2. Limpar Descrições HTML

O campo `description` contém HTML bruto com tags `<style>`, `<div>`, `<p>`, etc. Precisamos extrair apenas o texto limpo.

**Arquivo novo: `src/lib/sanitizeDescription.ts`**
- Função `stripHtml(html: string): string` que:
  - Remove tags `<style>...</style>` completamente
  - Remove todas as tags HTML restantes
  - Decodifica entidades HTML (`&apos;` etc.)
  - Remove espaços duplicados e linhas vazias
  - Retorna texto limpo e legível

**Modificações em `src/pages/ProductDetailPage.tsx`:**
- Aplicar `stripHtml()` ao `product.description` antes de renderizar
- Manter `whitespace-pre-line` para preservar quebras de linha do texto limpo

**Modificações em `src/components/product/ProductCard.tsx`:**
- Se houver descrição curta no card, também aplicar sanitização

---

### 3. Lógica de Desconto Atacado (6+ produtos)

Conforme as descrições dos produtos: "Atacado: acima de 6 pares". O preço de atacado (`price`) se aplica quando o carrinho tem 6 ou mais itens no total.

**Modificações em `src/hooks/useCart.ts`:**
- `getItemPrice(item)`: verificar se `totalItems >= 6`
  - Se sim, usar `product.price` (atacado)
  - Se não, usar `product.price_retail` (varejo)
- Recalcular `subtotal` com base nessa lógica
- Exportar flag `isWholesale: boolean` para a UI

**Modificações em `src/pages/CartPage.tsx`:**
- Mostrar banner informativo: "Adicione X mais itens para preço de atacado!"
- Quando ativo, mostrar badge "ATACADO ATIVO" e preços com destaque
- Mostrar economia total vs. preço de varejo

**Modificações em `src/pages/ProductDetailPage.tsx`:**
- Informar: "Compre 6+ itens e pague preço de atacado"
- Mostrar ambos os preços com explicação clara

**Modificações em `src/pages/CheckoutPage.tsx`:**
- Usar a mesma lógica de preço do carrinho

---

### 4. Levantamento de Melhorias (após implementação)

Após concluir os 3 itens acima, farei um levantamento completo analisando:
- Performance (lazy loading de imagens, paginação)
- SEO (meta tags, títulos dinâmicos)
- UX mobile (navegação, tamanho de botões)
- Funcionalidades faltantes (busca no header, ordenação)
- Integridade dos dados (slugs duplicados detectados no DB)
- Segurança (RLS policies)

---

### Detalhes Técnicos

**Arquivos a criar:**
1. `src/lib/productCategories.ts` - dicionário de marcas e funções de extração
2. `src/lib/sanitizeDescription.ts` - função para limpar HTML das descrições

**Arquivos a modificar:**
1. `src/pages/ProductsPage.tsx` - filtros por marca + preço
2. `src/pages/HomePage.tsx` - chips de marcas na home
3. `src/pages/ProductDetailPage.tsx` - descrição limpa + info atacado 6+
4. `src/hooks/useCart.ts` - lógica de preço atacado quando 6+ itens
5. `src/pages/CartPage.tsx` - banner de desconto e preços atacado
6. `src/pages/CheckoutPage.tsx` - preços consistentes com carrinho

**Observação sobre dados:** Detectei vários produtos com slugs duplicados no banco (ex: múltiplos "Balenciaga Tênis 3XL com cadarço" e "On Cloudtilt" com slugs diferentes). Isso será mencionado no levantamento de melhorias, pois pode indicar dados duplicados.


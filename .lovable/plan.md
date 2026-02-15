

## Reorganizar Home por Tipo de Produto + Categorias no Supabase

### O que muda

A seção "Categorias" na Home será renomeada para **"Produtos"** e exibirá chips por **tipo de produto** (Tênis, Boné, Meias, etc.) em vez de por marca. As marcas (Air Jordan, Nike, Gucci) continuarão disponíveis como **sub-filtros** dentro de cada tipo de produto.

### 1. Inserir categorias faltantes no Supabase

A tabela `categories` já possui: Tenis, Boné, Acessórios, Roupas, Esportivos, HIGH QUALITY.

Inserir as que faltam via SQL:
- Meias (slug: meias)
- Bolsas (slug: bolsas)
- Cintos (slug: cintos)
- Malas (slug: malas)
- Chinelo (slug: chinelo)
- Importados (slug: importados)
- Tênis Infantil (slug: tenis-infantil)

### 2. Modificar `src/pages/HomePage.tsx`

- Trocar o título "Categorias" por **"Produtos"**
- Buscar categorias da tabela `categories` do Supabase (em vez de extrair marcas do título)
- Exibir apenas as categorias desejadas: Tênis, Boné, Meias, Bolsas, Cintos, Malas, Chinelo, Importados, Tênis Infantil
- Cada chip linka para `/categoria/:slug` (rota já existente no App.tsx)

### 3. Modificar `src/pages/ProductsPage.tsx`

- Quando acessado via `/categoria/tenis`, mostrar todos os produtos atuais (que são todos tênis)
- Quando acessado via `/categoria/bone`, `/categoria/meias`, etc., mostrar apenas produtos daquela categoria (vazio por enquanto -- mensagem "Em breve")
- Manter os filtros por marca como sub-filtros dentro da categoria Tênis
- Ler o param `categorySlug` da URL para filtrar

### 4. Lógica de categorização dos produtos

Como a tabela `products` não tem coluna `category_id`, todos os produtos atuais serão considerados como "Tênis" por padrão. Quando novas categorias receberem produtos no futuro, será necessário adicionar um campo `category_id` à tabela products ou usar detecção por título.

Por agora: `/categoria/tenis` mostra todos os produtos; outras categorias ficam preparadas mas vazias.

### 5. Desconto Atacado 6+ itens

A lógica já está implementada no `useCart.ts`:
- `isWholesale = totalItems >= 6`
- Quando ativo, usa `product.price` (atacado) em vez de `product.price_retail` (varejo)
- Exemplo: Louis Vuitton R$ 2.100 varejo / R$ 1.800 atacado -- com 6+ itens, cada unidade sai por R$ 1.800

Verificar que esta lógica está sendo corretamente aplicada no `CartPage`, `CheckoutPage` e `ProductDetailPage`. Ajustes pontuais se necessário.

### 6. Admin - Gestão de Categorias

O painel admin (`/admin/categorias`) já possui CRUD completo para categorias, conectado ao Supabase. Nenhuma mudança estrutural necessária -- apenas garantir que as novas categorias apareçam lá corretamente após a inserção.

### Detalhes Técnicos

**Arquivos a modificar:**
1. `src/pages/HomePage.tsx` -- trocar "Categorias" por "Produtos", buscar da tabela `categories`, filtrar os tipos desejados
2. `src/pages/ProductsPage.tsx` -- suportar rota `/categoria/:categorySlug`, considerar todos os produtos como "tenis" por padrão
3. `src/hooks/useProducts.ts` -- adicionar hook ou query para buscar categorias do Supabase

**SQL a executar:**
Inserir categorias faltantes na tabela `categories` (Meias, Bolsas, Cintos, Malas, Chinelo, Importados, Tênis Infantil)

**Nenhuma mudança necessária em:**
- `useCart.ts` (lógica de atacado 6+ já funciona)
- `CartPage.tsx` (banner de atacado já implementado)
- `CheckoutPage.tsx` (usa `getItemPrice` do carrinho)
- Admin CategoriesPage (CRUD já funcional)


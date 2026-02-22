

## Tres Alteracoes no App

### 1. Remover badge "ATACADO" dos cards de produto

Remover o badge "ATACADO" que aparece sobre a imagem nos cards de produto (ProductCard) e tambem na pagina de detalhe do produto (ProductDetailPage). O preco de atacado continua visivel no texto abaixo do card -- apenas o badge visual sobre a imagem sera removido.

**Arquivos:**
- `src/components/product/ProductCard.tsx` -- remover linhas 63-68 (badge ATACADO)
- `src/pages/ProductDetailPage.tsx` -- remover linhas 148-153 (badge ATACADO na pagina de detalhe)

### 2. Botao "Voltar" na pagina de produto

Adicionar um botao "Voltar" no topo da pagina de detalhe do produto que usa `navigate(-1)` para voltar a pagina anterior do historico (funciona tanto vindo da home, catalogo, ou qualquer outra pagina).

**Arquivo:** `src/pages/ProductDetailPage.tsx` -- adicionar botao com icone ArrowLeft antes do grid de imagem/detalhes

### 3. Gerar 3 novas imagens de banner com IA

As 3 imagens de fallback atuais em `public/banners/` nao ficam boas no layout responsivo. Vou criar uma Edge Function temporaria que usa a API de geracao de imagens (Nano banana via `LOVABLE_API_KEY`) para gerar 3 banners tematicos de loja de tenis/moda urbana em alta qualidade, faz upload para o bucket `banners` no Supabase Storage, e retorna as URLs publicas. Depois atualizo o `HeroBanner.tsx` com as novas URLs.

**Temas dos 3 banners:**
1. Colecao de tenis esportivos/streetwear em fundo escuro elegante
2. Acessorios (bones, bolsas, meias) em composicao lifestyle
3. Promocao/frete gratis com visual moderno e vibrante

**Arquivos:**
- `supabase/functions/generate-banners/index.ts` -- nova edge function (temporaria)
- `src/components/home/HeroBanner.tsx` -- atualizar URLs dos defaultBanners com as imagens geradas

---

### Detalhes tecnicos

**ProductCard.tsx (remocao do badge):**
Remover o bloco do badge ATACADO dentro da div de badges (linhas 64-68). Manter o badge ESGOTADO intacto.

**ProductDetailPage.tsx (remocao do badge + botao voltar):**
- Remover o bloco de badges ATACADO (linhas 148-153)
- Importar `ArrowLeft` do lucide-react
- Adicionar antes do grid: `<button onClick={() => navigate(-1)}` com icone ArrowLeft e texto "Voltar"

**Edge Function generate-banners:**
- Chama `https://ai.gateway.lovable.dev/v1/chat/completions` com model `google/gemini-2.5-flash-image`
- Gera 3 imagens com prompts descritivos para banners de loja de tenis/streetwear, proporcao 3:1 (1920x640)
- Faz upload de cada imagem base64 para o bucket `banners` no Supabase Storage
- Retorna as 3 URLs publicas
- Apos execucao e confirmacao, atualizo os defaultBanners no HeroBanner.tsx com as URLs geradas




## Otimizacao de Performance e Correcao de Overflow de Imagens

### Problemas Identificados

**1. Imagem ultrapassando a margem do app (visivel no print)**
O screenshot mostra a imagem do produto "Gucci X Disney Donald Duck Duffle" com zoom aplicado (105%) ultrapassando os limites do container. O `ProductViewer360` aplica `transform: scale()` na imagem, mas o container pai nao tem protecao contra o conteudo escalado vazar para fora. Alem disso, a fila de miniaturas (thumbnails) abaixo da imagem principal tambem pode vazar horizontalmente em telas pequenas.

**2. Carregamento lento de imagens**
O app carrega ate 36 imagens por produto sem nenhum tipo de lazy loading progressivo. O `ProductViewer360` pre-carrega TODAS as imagens ao mesmo tempo no `useEffect`, o que bloqueia a rede. Os cards de produto na home carregam 28 produtos de uma vez, cada um com uma imagem.

---

### Correcoes

#### A. Corrigir overflow da imagem com zoom (ProductViewer360.tsx)

O problema principal e que `overflow-hidden` ja esta no container, mas `transform: scale()` com valores acima de 1 pode vazar visualmente dependendo do contexto de stacking. A correcao:

- Adicionar `will-change: transform` e `transform-origin: center` no container
- Limitar o zoom maximo de 3x para 2x (mais que isso nao faz sentido em mobile)
- Resetar o zoom automaticamente ao trocar de imagem (evita o estado confuso mostrado no print)
- Garantir que o container da imagem com zoom tenha `isolation: isolate` para criar um novo stacking context

**Arquivo:** `src/components/product/ProductViewer360.tsx`

#### B. Corrigir overflow das miniaturas (ProductDetailPage.tsx)

A fila de miniaturas ja tem `overflow-x-auto`, mas precisa de `max-w-full` no container pai para garantir que nao ultrapasse a margem do app em telas estreitas.

**Arquivo:** `src/pages/ProductDetailPage.tsx`

#### C. Otimizar carregamento de imagens no ProductViewer360

Em vez de pre-carregar todas as 36 imagens de uma vez:
- Carregar apenas a primeira imagem imediatamente
- Pre-carregar as proximas 2-3 imagens adjacentes ao indice atual (lazy preload)
- Carregar o restante sob demanda conforme o usuario arrasta

**Arquivo:** `src/components/product/ProductViewer360.tsx`

#### D. Otimizar renderizacao dos cards de produto

- Adicionar `loading="lazy"` e `decoding="async"` nas miniaturas da pagina de detalhe (ja existe nos cards, mas nao nas thumbs)
- Adicionar `will-change: auto` nos cards para evitar criacao excessiva de GPU layers

**Arquivos:** `src/pages/ProductDetailPage.tsx`, `src/components/product/ProductCard.tsx`

#### E. Otimizar a HomePage

A home carrega 28 produtos de uma vez com `useProducts({ limit: 28 })`. Reduzir para 16 no carregamento inicial para diminuir o payload e o numero de imagens carregadas simultaneamente.

**Arquivo:** `src/pages/HomePage.tsx`

---

### Detalhes tecnicos

**ProductViewer360.tsx -- mudancas principais:**
- Container: adicionar `style={{ isolation: 'isolate' }}` para conter o zoom
- Imagem: limitar `scale` maximo para 2 (`Math.min(2, ...)` em vez de `Math.min(3, ...)`)
- Resetar zoom ao mudar `currentIndex`: `useEffect` que seta `scale(1)` quando o indice muda externamente
- Preload inteligente: substituir o preload de todas as imagens por um preload de janela deslizante (current -2 a current +2)

**ProductDetailPage.tsx -- mudancas:**
- Container das miniaturas: adicionar `max-w-full` e `overflow-hidden` no wrapper
- Miniaturas: adicionar `loading="lazy"` e `decoding="async"`

**HomePage.tsx:**
- Mudar `useProducts({ limit: 28 })` para `useProducts({ limit: 16 })`

**ProductCard.tsx:**
- Remover `will-change` implicito do hover (a animacao `group-hover:scale-110` cria GPU layers desnecessarias em 28+ cards). Trocar por uma transicao mais leve ou usar `will-change: auto`.


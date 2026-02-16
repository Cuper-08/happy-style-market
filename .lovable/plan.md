

## Corrigir Scroll ao Abrir Produto + Melhorar Visualizador 360

### Problema 1: Pagina desce ao abrir produto

O React Router nao faz scroll para o topo automaticamente quando voce navega para uma nova pagina. Quando voce clica num card de produto, a pagina do detalhe abre na mesma posicao de scroll que voce estava antes. Como a pagina de produto e menor que a home (que agora tem 28 produtos), o navegador "pula" para o final.

**Solucao:** Criar um componente `ScrollToTop` que escuta mudancas de rota e faz `window.scrollTo(0, 0)` automaticamente.

### Problema 2: Visualizador 360 pode ser melhorado

O visualizador atual funciona, mas pode ser mais intuitivo e bonito.

---

### Mudancas

**1. Novo componente `src/components/ScrollToTop.tsx`**
- Usa `useLocation()` do React Router
- Em cada mudanca de rota, executa `window.scrollTo(0, 0)`
- Componente simples, sem render visual

**2. `src/App.tsx`**
- Adicionar `<ScrollToTop />` dentro do `<BrowserRouter>`, antes do `<Routes>`

**3. `src/components/product/ProductViewer360.tsx` - Melhorias**
- Adicionar barra de progresso visual na parte inferior mostrando em qual imagem o usuario esta (dots ou barra)
- Botao de reset de zoom (quando zoom esta ativo)
- Animacao de entrada mais suave na imagem
- Auto-play sutil: ao carregar, rotacionar automaticamente uma vez para indicar que e interativo (substitui o hint de texto)
- Melhorar transicao entre frames para ficar mais fluida
- Esconder o hint "Arraste para girar" apos 3 segundos automaticamente

**4. `src/pages/ProductDetailPage.tsx`**
- Nenhuma mudanca estrutural necessaria, apenas se beneficia do ScrollToTop

---

### Detalhes Tecnicos

**ScrollToTop:**
```text
// src/components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
```

**App.tsx:**
```text
<BrowserRouter>
  <ScrollToTop />
  <Routes>...</Routes>
</BrowserRouter>
```

**ProductViewer360 melhorias:**
- Auto-rotate: ao montar, animar do frame 0 ao 3 e voltar ao 0 em ~1.5s usando requestAnimationFrame, depois parar
- Dots de navegacao: pequenos circulos na parte inferior indicando o frame atual
- Botao de reset zoom: aparece quando scale > 1, clica para voltar a scale=1
- Hint some apos 3s com setTimeout + fade-out

### Resumo

| Arquivo | Mudanca |
|---------|---------|
| `src/components/ScrollToTop.tsx` | Novo - scroll para topo em cada navegacao |
| `src/App.tsx` | Adicionar ScrollToTop dentro do BrowserRouter |
| `src/components/product/ProductViewer360.tsx` | Auto-rotate inicial, dots de navegacao, botao reset zoom, hint com auto-hide |


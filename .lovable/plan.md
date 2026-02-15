

## Corrigir Carrossel Travado e Zoom no Mobile (iPhone)

### Problemas Identificados

**1. Carrossel nao troca automaticamente**: O `goToSlide` usa `isTransitioning` como dependencia do `useCallback`, criando um problema de closure obsoleto (stale closure). Quando o `setInterval` dispara, ele chama uma versao antiga de `goToSlide` que ve `isTransitioning = true` e retorna sem fazer nada. Resultado: o carrossel trava no primeiro slide.

**2. Imagem cortada no mobile**: Com `aspect-[3/2]` e `object-cover`, as imagens 1920x1920 (quadradas) sao cortadas excessivamente, escondendo partes importantes do conteudo (texto e branding ficam cortados nas laterais).

---

### Correcoes

**Arquivo: `src/components/home/HeroBanner.tsx`**

**1. Corrigir auto-slide com `useRef`**: Substituir o estado `isTransitioning` por um `useRef` para evitar o problema de stale closure. O `useEffect` do intervalo usara diretamente o ref, garantindo que sempre tenha o valor atualizado.

```text
// Antes: estado causa stale closure
const [isTransitioning, setIsTransitioning] = useState(false);
const goToSlide = useCallback((index) => {
  if (isTransitioning) return;  // valor obsoleto!
  ...
}, [isTransitioning]);

// Depois: ref sempre atualizado
const isTransitioning = useRef(false);
const goToSlide = useCallback((index) => {
  if (isTransitioning.current) return;  // sempre correto
  isTransitioning.current = true;
  setCurrent(index);
  setTimeout(() => { isTransitioning.current = false; }, 700);
}, []);
```

**2. Simplificar o auto-play**: Remover `goToSlide` e `current` das dependencias do `useEffect` do intervalo. Usar um ref para `current` tambem, ou usar o pattern `setCurrent(prev => ...)` funcional que sempre tem o valor mais recente.

```text
useEffect(() => {
  const timer = setInterval(() => {
    setCurrent(prev => (prev + 1) % banners.length);
  }, 6000);
  return () => clearInterval(timer);
}, [banners.length]);
```

**3. Ajustar aspect ratio mobile**: Mudar de `aspect-[3/2]` para `aspect-[1/1]` no mobile para imagens quadradas (1920x1920), reduzindo o corte. Manter `sm:aspect-[2/1]` e `md:aspect-[3/1]` para telas maiores.

---

### Resumo das mudancas

- **Arquivo unico**: `src/components/home/HeroBanner.tsx`
- Trocar `useState(false)` de transicao por `useRef(false)`
- Simplificar `useEffect` do auto-play com `setCurrent(prev => ...)`
- Remover dependencias desnecessarias que causam re-criacao do intervalo
- Ajustar aspect ratio mobile para `aspect-[1/1]` (imagens quadradas)


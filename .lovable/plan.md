
## Transformar o Marquee de Categorias em Carrossel Interativo

### O que será mudado

O componente `CategoryMarquee` hoje é um marquee automático, sem interação do usuário. O objetivo é:

1. **Tornar clicável** — já está com `<Link>` mas a animação contínua dificulta o clique. A solução é **pausar a animação ao passar o mouse/toque** (já possível com CSS) e garantir que o toque rápido seja interpretado como clique e não como scroll.

2. **Permitir arrastar/deslizar** — o usuário deve poder puxar o carrossel para os lados com o dedo (mobile) ou mouse (desktop), navegando entre as categorias de forma manual, como um carrossel real.

### Abordagem: Substituir o marquee CSS por um scroll horizontal com drag/swipe

Em vez de manter a animação CSS infinita com triplicação de items, converteremos para um **scroll horizontal com Embla Carousel** (já instalado no projeto como `embla-carousel-react`). Isso entrega:

- Swipe nativo no mobile
- Drag com mouse no desktop
- Loop infinito real (via `loop: true` do Embla)
- Autoplay desativável ao interagir (via plugin `AutoScroll` do Embla, já disponível na lib)
- Todos os items continuam clicáveis como `<Link>`

### Detalhes Técnicos

**`src/components/home/CategoryMarquee.tsx`**

Substituir o marquee CSS por Embla Carousel:

```tsx
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

export function CategoryMarquee() {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, align: 'start' },
    [AutoScroll({ speed: 1, stopOnInteraction: true })]
  );

  return (
    <section className="py-6 md:py-8 space-y-4">
      <h2>NAVEGUE POR CATEGORIAS</h2>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {categories.map((cat) => (
            <Link key={cat.name} to={cat.link} className="flex-shrink-0 ...">
              <img src={cat.image} ... />
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- `loop: true` — cria loop infinito nativo sem duplicar items
- `dragFree: true` — scroll livre ao arrastar (sem snap agressivo)
- `AutoScroll` — auto-desliza automaticamente como o marquee, mas **para ao interagir**
- `stopOnInteraction: true` — pausa o autoplay quando o usuário toca/arrasta
- O clique no Link funciona normalmente pois o Embla distingue drag de tap

**`src/index.css`**

Remover as classes `animate-marquee-categories` e o keyframe `marquee-categories`, que não serão mais usados.

**Instalação de plugin**

O pacote `embla-carousel-auto-scroll` precisará ser instalado. É o plugin oficial do Embla para autoplay suave, compatível com a versão já instalada no projeto (`embla-carousel-react ^8.6.0`).

### Resumo das mudanças

| Arquivo | Mudança |
|---------|---------|
| `src/components/home/CategoryMarquee.tsx` | Substituir marquee CSS por Embla Carousel com loop, drag e autoplay |
| `src/index.css` | Remover keyframe e classe `animate-marquee-categories` |
| `package.json` | Adicionar `embla-carousel-auto-scroll` |

### Resultado Final

- No mobile: o usuário arrasta o carrossel com o dedo e clica na categoria desejada
- No desktop: o carrossel desliza automaticamente; o usuário pode arrastar com o mouse ou clicar
- A navegação para `/categoria/...` continua funcionando normalmente ao clicar/tocar


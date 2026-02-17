

## Corrigir Carrossel Infinito de Categorias e Carregamento de Imagens

### Problema 1: Marquee corta no mobile

O marquee atual duplica os 6 itens apenas 1 vez (total 12). No mobile, com itens de ~140px de largura + margens, o conteudo total e de aproximadamente 1000px. Quando a animacao translateX(-50%) chega ao meio, o conteudo visivel acaba antes de completar o loop, causando um "pulo" visivel. A solucao e triplicar (ou quadruplicar) os itens para garantir que sempre haja conteudo suficiente para preencher a tela enquanto a animacao roda.

### Problema 2: Imagens dos produtos demoram para carregar

As imagens dos produtos vem do Supabase Storage e nao possuem nenhuma otimizacao de carregamento. Nao ha placeholder, skeleton, nem lazy loading eficiente. Alem disso, o ProductCard nao tem `loading="lazy"` no img.

### Mudancas Planejadas

**1. `src/components/home/CategoryMarquee.tsx`**
- Triplicar os itens em vez de duplicar (3 copias = 18 itens) para garantir cobertura total no mobile
- Remover `loading="lazy"` das imagens do marquee (sao poucas e precisam estar visiveis imediatamente)
- Adicionar `will-change: transform` via CSS para performance mais suave no mobile

**2. `src/index.css`**
- Alterar a animacao `animate-marquee-categories` para usar `translateX(-33.33%)` (ja que agora sao 3 copias, o ponto de reset e 1/3)
- Adicionar `will-change: transform` na classe do marquee

**3. `src/components/product/ProductCard.tsx`**
- Adicionar `loading="lazy"` na tag img dos produtos
- Adicionar `decoding="async"` para nao bloquear o render
- Usar um placeholder de cor de fundo (`bg-gray-100`) enquanto a imagem carrega, com transicao de opacidade

### Detalhes Tecnicos

```text
// CategoryMarquee.tsx - triplicar itens
const items = [...categories, ...categories, ...categories]; // 18 itens

// index.css - ajustar keyframe para 3 copias
.animate-marquee-categories {
  animation: marquee-categories 30s linear infinite;
  will-change: transform;
}

@keyframes marquee-categories {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.33%); }
}

// ProductCard.tsx - otimizar carregamento de imagem
<img
  src={product.images?.[0] || '/placeholder.svg'}
  alt={product.title}
  loading="lazy"
  decoding="async"
  className="..."
/>
```

### Resumo

| Arquivo | Mudanca |
|---------|---------|
| `src/components/home/CategoryMarquee.tsx` | Triplicar itens, remover lazy loading |
| `src/index.css` | Nova keyframe com translateX(-33.33%), will-change |
| `src/components/product/ProductCard.tsx` | Adicionar loading=lazy e decoding=async |


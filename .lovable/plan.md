

## Banners Responsivos com Imagens Mobile + Desktop

### Problema atual

O banner usa `aspect-square` (1:1) no mobile e `aspect-[3/1]` no desktop. As imagens atuais sao 3:1 (1920x640), entao no mobile a imagem e cortada drasticamente pelo `object-cover`, mostrando apenas uma faixa central -- o conteudo principal fica cortado.

### Solucao

Usar o elemento `<picture>` com duas versoes de cada banner:
- **Mobile** (1080x1080, 1:1) -- otimizada para telas pequenas, conteudo centralizado e visivel
- **Desktop** (1920x640, 3:1) -- panoramica para telas grandes

O navegador automaticamente escolhe a imagem correta baseado no tamanho da tela.

### Imagens a gerar (6 total)

| Banner | Mobile (1080x1080) | Desktop (1920x640) |
|--------|-------------------|-------------------|
| 1 - Tenis/Streetwear | `slide-1-mobile.webp` | `slide-1-desktop.webp` |
| 2 - Acessorios | `slide-2-mobile.webp` | `slide-2-desktop.webp` |
| 3 - Frete Gratis | `slide-3-mobile.webp` | `slide-3-desktop.webp` |

Cada par tera o mesmo tema visual, mas com composicao adaptada ao formato.

### Alteracoes

**`src/components/home/HeroBanner.tsx`:**
- Atualizar `defaultBanners` para incluir campos `image_mobile` e `image_desktop` em vez de um unico `image`
- Trocar a tag `<img>` por `<picture>` com `<source media="(min-width: 640px)">` para desktop e fallback mobile
- Manter toda a logica existente de carrossel, transicoes e auto-play

**`public/banners/`:**
- Gerar e salvar 6 novas imagens (3 mobile + 3 desktop)
- As imagens antigas podem ser mantidas como backup

### Detalhes tecnicos

Estrutura do `<picture>`:
```text
<picture>
  <source media="(min-width: 640px)" srcSet={desktopImage} />
  <img src={mobileImage} alt={title} class="h-full w-full object-cover" />
</picture>
```

O breakpoint `640px` corresponde ao `sm:` do Tailwind, que e onde o aspect ratio muda de 1:1 para 2:1.

Os banners do banco de dados (quando existirem 2+) continuam usando o campo `image_url` unico como antes -- a logica de `<picture>` se aplica apenas aos banners de fallback.

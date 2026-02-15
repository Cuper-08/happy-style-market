

## Adicionar Imagens ao Banner Carrossel (Mobile-First)

### O que sera feito

As 3 imagens enviadas serao copiadas para o projeto e usadas como banners no carrossel da home. Como as imagens ja possuem texto e branding embutidos (titulos, subtitulos, logo Bras Conceito), o overlay de texto do carrossel sera removido para esses banners, exibindo apenas a imagem pura.

### 1. Copiar imagens para o projeto

Copiar as 3 imagens para `public/banners/`:
- `public/banners/slide-artistas.webp` (A Loja Que Veste Os Artistas)
- `public/banners/slide-loja-fisica.webp` (Loja Fisica)
- `public/banners/slide-frete-gratis.webp` (Frete Gratis)

### 2. Ajustar HeroBanner para mobile

**Modificar `src/components/home/HeroBanner.tsx`:**

- Atualizar os `defaultBanners` para usar as 3 novas imagens locais
- Remover o overlay de texto (gradientes + titulo + subtitulo + botao) pois as imagens ja contem todo o conteudo visual
- Ajustar aspect ratio para mobile: mudar de `aspect-[16/9]` para `aspect-[16/7]` no mobile, garantindo que a imagem apareca mais alta e com melhor enquadramento no celular
- Usar `object-center` para manter o foco no centro da imagem em todas as telas
- Manter os dots de navegacao na parte inferior
- Manter o auto-slide a cada 6 segundos

### 3. Logica de fallback

- Se houver banners cadastrados no Supabase (via admin), esses continuam tendo prioridade e o overlay de texto continua funcionando para eles
- Os defaultBanners (as 3 imagens novas) so aparecem quando nao ha banners no banco de dados
- Para os defaultBanners, o overlay de texto/gradiente sera ocultado pois o conteudo ja esta na imagem

### Detalhes Tecnicos

**Arquivos a criar (copia de assets):**
- `public/banners/slide-artistas.webp`
- `public/banners/slide-loja-fisica.webp`
- `public/banners/slide-frete-gratis.webp`

**Arquivo a modificar:**
- `src/components/home/HeroBanner.tsx` -- novos defaultBanners, aspect ratio mobile ajustado, overlay condicional




## Corrigir Banners Cortados no Mobile

### Problema

O banner usa `aspect-[2/1]` no mobile (proporcao 2:1 — muito largo e baixo). Combinado com `object-cover`, a imagem e cortada significativamente no topo e na base, perdendo conteudo importante (como o tenis no screenshot).

### Solucao

Ajustar o aspect ratio para ser mais alto no mobile, mostrando mais da imagem. Tambem mudar o `object-fit` para `object-contain` no mobile para garantir que a imagem inteira apareca sem corte.

### Mudancas no arquivo `src/components/home/HeroBanner.tsx`

**1. Aspect ratio responsivo (mais alto no mobile)**

Trocar:
- Mobile: `aspect-[2/1]` -> `aspect-[4/3]` (mostra muito mais da imagem)
- Tablet: adicionar `sm:aspect-[2/1]` (transicao suave)  
- Desktop: manter `md:aspect-[3/1]`

Isso se aplica em 2 lugares: o skeleton loader (linha 76) e o container principal (linha 81).

**2. Object-fit responsivo na imagem**

Trocar `object-cover` por `object-contain` no mobile e manter `object-cover` no desktop:
- `object-contain md:object-cover` na tag `<img>` (linha 92)

**3. Fundo preto atras da imagem**

Adicionar `bg-black` ou `bg-[#0D0D0D]` no container da imagem para que, quando `object-contain` deixar espacos vazios no mobile, o fundo seja preto (combinando com a estetica do app).

### Resumo das alteracoes

| Linha | De | Para |
|-------|-----|------|
| 76 | `aspect-[2/1] md:aspect-[3/1]` | `aspect-[4/3] sm:aspect-[2/1] md:aspect-[3/1]` |
| 81 | `aspect-[2/1] md:aspect-[3/1]` | `aspect-[4/3] sm:aspect-[2/1] md:aspect-[3/1]` |
| 80 | (sem bg) | Adicionar `bg-[#0D0D0D]` |
| 92 | `object-cover` | `object-contain md:object-cover` |

### Resultado esperado

- **Mobile**: Imagem completa visivel com proporcao 4:3, sem corte, fundo preto nas laterais se necessario
- **Tablet**: Proporcao 2:1, transicao suave
- **Desktop**: Mantido como esta (3:1 com object-cover)


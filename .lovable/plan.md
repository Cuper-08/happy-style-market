
## Corrigir Zoom Excessivo nos Banners Mobile

### Problema

O `aspect-[4/3]` no mobile cria um container muito alto para imagens que sao panoramicas (proporcao ~2:1). Com `object-cover`, a imagem precisa dar um zoom enorme para preencher esse espaco vertical, cortando muito conteudo nas laterais.

### Solucao

Usar `aspect-[16/9]` no mobile em vez de `aspect-[4/3]`. O 16:9 e um meio-termo ideal:
- Mais alto que o 2:1 original (mostra mais da imagem verticalmente)
- Menos alto que o 4:3 (evita zoom excessivo)
- Proporcao natural para imagens panoramicas

### Mudancas no arquivo `src/components/home/HeroBanner.tsx`

| Local | De | Para |
|-------|-----|------|
| Skeleton (linha 76) | `aspect-[4/3] sm:aspect-[2/1] md:aspect-[3/1]` | `aspect-[16/9] sm:aspect-[2/1] md:aspect-[3/1]` |
| Container (linha 81) | `aspect-[4/3] sm:aspect-[2/1] md:aspect-[3/1]` | `aspect-[16/9] sm:aspect-[2/1] md:aspect-[3/1]` |

Manter `object-cover` na imagem (sem barras pretas) e todo o resto inalterado.

### Resultado esperado

- **Mobile**: Imagem preenche o banner com zoom moderado, mostrando muito mais conteudo que o 4:3
- **Tablet/Desktop**: Sem alteracao

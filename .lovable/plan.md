## Corrigir Banners no Mobile — Remover Barras Pretas

### Problema

O `object-contain` esta criando barras pretas acima e abaixo da imagem no mobile. O usuario quer a imagem expandida preenchendo todo o espaco, sem barras.

### Solucao

Voltar para `object-cover` (que preenche todo o espaco sem barras), mas manter o aspect ratio mais alto (`aspect-[4/3]`) no mobile. Isso garante que a imagem preencha o banner inteiro, e como o banner agora e mais alto no mobile, muito menos conteudo sera cortado comparado ao formato original `aspect-[2/1]`.

### Mudanca no arquivo `src/components/home/HeroBanner.tsx`

Apenas 1 alteracao:


| Linha | De                               | Para           |
| ----- | -------------------------------- | -------------- |
| 92    | `object-contain md:object-cover` | `object-cover` |


Manter tudo o resto como esta (aspect-[4/3] no mobile, bg-[#0D0D0D], etc).

### Resultado esperado

- **Mobile**: Imagem preenche todo o banner sem barras pretas, com proporcao 4:3 (mais alta que antes), mostrando toda a imagem com qualidade e sem cortes.
- **Desktop**: Sem alteracao
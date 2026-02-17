

## Atualizar imagens de categorias (sem fundo)

Substituir as 6 imagens atuais em `public/categories/` pelas novas versoes sem fundo enviadas pelo usuario.

### Mapeamento

| Arquivo enviado | Destino |
|-----------------|---------|
| content1-removebg-preview.png | public/categories/malas.png |
| content2-removebg-preview.png | public/categories/bolsas.png |
| content3-removebg-preview.png | public/categories/grifes.png |
| content4-removebg-preview.png | public/categories/meias.png |
| content5-removebg-preview.png | public/categories/bones.png |
| content6-removebg-preview.png | public/categories/tenis.png |

### O que muda

Apenas os arquivos de imagem serao substituidos. Nenhum codigo precisa ser alterado, pois o componente `CategoryMarquee.tsx` ja referencia esses mesmos caminhos (`/categories/malas.png`, etc.).

As imagens agora terao fundo transparente, o que vai dar um visual mais limpo e profissional no carrossel de categorias.


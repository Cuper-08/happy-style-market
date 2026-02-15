

## Visualizador 360 graus com Fotos em Sequencia

### Como funciona

O admin sobe varias fotos do produto tiradas em angulos diferentes (ex: 12, 24 ou 36 fotos girando o produto). Na pagina do produto, em vez da galeria de fotos tradicional, aparece um visualizador interativo onde o cliente arrasta para girar o produto e pode dar zoom com pinch/scroll.

### Mudancas

**1. Novo componente: `src/components/product/ProductViewer360.tsx`**

Componente que recebe um array de imagens e permite:
- Arrastar horizontalmente (mouse ou touch) para girar o produto entre as fotos
- Scroll do mouse ou pinch para dar zoom
- Indicador visual "Arraste para girar" na primeira interacao
- Fallback: se houver apenas 1 imagem, mostra a imagem normal com zoom

Logica principal:
- Dividir a largura do container pelo numero de imagens para calcular o "passo" de rotacao
- Ao arrastar, calcular o delta X e avançar/retroceder no indice da imagem (loop circular)
- Zoom com CSS `transform: scale()` controlado por scroll/pinch

**2. Modificar: `src/pages/ProductDetailPage.tsx`**

- Substituir a secao de imagens atual pelo `ProductViewer360` quando o produto tiver mais de 1 imagem
- Manter a galeria de thumbnails abaixo como opcao de navegacao direta
- Manter a imagem simples para produtos com 1 foto apenas

**3. Modificar: `src/pages/admin/ProductFormPage.tsx`**

- Aumentar o limite de upload de imagens de 5 para 36 (para acomodar fotos 360)
- Adicionar uma dica visual: "Para visualizacao 360, suba fotos do produto em sequencia de angulos"

### Comportamento do visualizador

- **Desktop**: arrastar com mouse para girar, scroll para zoom
- **Mobile**: arrastar com dedo para girar, pinch para zoom
- **Cursor**: muda para "grab" / "grabbing" durante o arraste
- **Loop**: ao chegar na ultima foto, volta para a primeira (rotacao continua)
- **Icone**: mostra um icone de rotacao 360 no canto para indicar a funcionalidade
- **Performance**: usa `will-change: transform` e pre-carrega todas as imagens

### Detalhes tecnicos

O componente nao usa bibliotecas externas — apenas eventos de mouse/touch nativos do React:

```
onMouseDown -> salva posicao inicial, ativa "dragging"
onMouseMove -> calcula deltaX, atualiza indice da imagem
onMouseUp -> desativa "dragging"
onTouchStart/Move/End -> mesma logica para mobile
onWheel -> controla zoom (scale 1x ate 3x)
```

Pre-carregamento das imagens com `new Image()` no `useEffect` para evitar piscar durante a rotacao.


## Corrigir Fundo dos Icones PWA para Preto

### Problema

A imagem da aguia tem fundo transparente/branco. O iOS (e Android em alguns casos) exibe o fundo branco no icone do app na tela inicial. O `background_color` do manifest so afeta a splash screen, nao o icone em si.

### Solucao

Como nao temos ferramentas de processamento de imagem no ambiente, a abordagem sera:

**1. Usar a imagem com fundo preto fornecida pelo usuario**

O usuario precisa fornecer uma versao da logo da aguia com fundo preto (ou podemos criar um SVG com fundo preto que referencia a aguia). Como alternativa pratica:

**2. Criar um SVG com fundo preto e a aguia como icone base**

Atualizar `public/mask-icon.svg` para ter fundo preto, e usar esse SVG como referencia visual.

**3. Abordagem mais eficaz: apple-touch-icon com fundo preto via HTML**

Na verdade, a melhor solucao possivel dentro do ambiente e:

- Atualizar o `apple-touch-icon.png` e todos os `icon-*.png` copiando a nova imagem que o usuario forneceu (`logo_bras_conceito-2.webp`) — porem o problema permanece pois essa imagem tambem tem fundo branco/transparente.

### Solucao recomendada

Solicitar ao usuario uma versao da logo com fundo preto (#0D0D0D) ja embutido na imagem, OU criar os icones programaticamente:

**Opcao A — Pedir imagem pronta (mais simples)**

Pedir ao usuario que forneca a logo da aguia ja com fundo preto em formato PNG.

**Opcao B — Criar via SVG e usar como icone (possivel no ambiente)**

Criar um SVG com retangulo preto de fundo + imagem da aguia centralizada, e usar como base para os icones. Limitacao: SVG com imagem embutida em base64 pode ser grande, mas funciona para `mask-icon.svg` e `favicon`.

**Opcao C — Usar CSS/manifest (limitado)**

O `background_color` no manifest ja esta como `#0D0D0D`. Para iOS especificamente, nao ha como definir cor de fundo do icone via manifest — precisa estar na propria imagem.

### Plano de implementacao (Opcao B — viavel agora)

1. **Copiar a nova imagem** `user-uploads://logo_bras_conceito-2.webp` para `public/logo_bras_conceito.webp` (substituindo a atual)
2. **Copiar a mesma imagem** para `src/assets/logo.webp`
3. **Sobrescrever todos os icones PWA** com a nova imagem (mesmo processo anterior)
4. **Atualizar `index.html**` para adicionar `<meta name="apple-mobile-web-app-capable">` e garantir que o `background_color` meta tag esta correto

### Limitacao importante

Mesmo com essas mudancas, o fundo do icone no iOS continuara branco/transparente porque a **imagem em si** tem fundo transparente. Para ter fundo preto no icone do iOS, e necessario que a imagem PNG/WebP tenha o fundo preto pintado na propria imagem.

**Recomendacao**: Faca a logo da aguia com fundo preto em qualquer editor de imagem (Canva, Photoshop, etc.) e envie aqui. Assim posso atualizar todos os icones com o fundo correto. Isso e a unica forma garantida de funcionar no iOS.

Enquanto isso, posso atualizar a nova imagem da aguia fornecida e ajustar o `mask-icon.svg` para ter fundo preto.

### Arquivos a alterar


| Arquivo                          | Acao                        |
| -------------------------------- | --------------------------- |
| `public/logo_bras_conceito.webp` | Substituir pela nova imagem |
| `src/assets/logo.webp`           | Substituir pela nova imagem |
| `public/apple-touch-icon.png`    | Substituir pela nova imagem |
| `public/icon-*.png` (8 arquivos) | Substituir pela nova imagem |
| `public/favicon.ico`             | Substituir pela nova imagem |
| `public/mask-icon.svg`           | Atualizar com fundo preto   |


**Nota**: Para resultado perfeito no iOS, envie uma versao da logo com fundo preto ja embutido na imagem.
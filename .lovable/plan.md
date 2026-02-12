

## Substituir Logo do App pela Aguia

### O que sera feito

Substituir a logo atual (texto "BC") pela imagem da aguia dourada em todos os lugares do app:

### Arquivos alterados

**1. Copiar a imagem**
- Copiar `user-uploads://logo_bras_conceito.webp` para `src/assets/logo.webp`
- Copiar tambem para `public/logo_bras_conceito.webp` (para uso em favicon/PWA)

**2. Atualizar imports da logo (3 arquivos)**

Todos os arquivos que importam `src/assets/logo.png` serao atualizados para importar `src/assets/logo.webp`:

- `src/components/layout/Header.tsx` - logo no header da loja
- `src/components/admin/AdminSidebar.tsx` - logo no sidebar do admin
- `src/components/admin/AdminMobileHeader.tsx` - logo no header mobile do admin

**3. Atualizar favicon e icones PWA**

- `index.html` - atualizar referencia do favicon para a nova imagem
- `public/mask-icon.svg` - atualizar o SVG (trocar o texto "BC" por referencia a imagem ou simplificar)

### Detalhes tecnicos

- O arquivo antigo `src/assets/logo.png` pode ser mantido como backup ou removido
- A imagem webp tem fundo transparente, ideal para uso sobre fundo escuro (header preto)
- Os estilos existentes (drop-shadow dourado, dimensoes) serao mantidos pois ja combinam com a estetica da aguia




## Gerenciamento de Banners no Painel Admin

### O que sera criado

Uma nova secao "Banners" no painel administrativo para cadastrar, editar, reordenar e excluir os banners do carrossel da home page. Atualmente os banners sao fixos no codigo (hardcoded). Com essa mudanca, eles virao do banco de dados e serao editaveis pelo admin.

### Estrutura

**1. Nova tabela `banners` no Supabase**

Colunas:
- `id` (uuid, PK)
- `title` (text, obrigatorio) - titulo exibido sobre o banner
- `subtitle` (text, opcional) - subtitulo
- `image_url` (text, obrigatorio) - URL da imagem
- `button_text` (text, opcional) - texto do botao CTA
- `button_link` (text, opcional) - link do botao
- `sort_order` (integer, default 0) - ordem de exibicao
- `is_active` (boolean, default true) - ativar/desativar sem excluir
- `created_at` (timestamptz)

RLS: leitura publica para banners ativos, CRUD completo para admins/managers.

**2. Bucket de storage `banners`**

Para upload das imagens dos banners (reutilizando o padrao do ImageUploader existente).

**3. Nova pagina `/admin/banners` (`src/pages/admin/BannersPage.tsx`)**

Funcionalidades:
- Lista de banners em cards com preview da imagem
- Botao "Novo Banner" abre dialog/formulario
- Campos: imagem (upload via drag-and-drop), titulo, subtitulo, texto do botao, link do botao, ativo (switch)
- Editar banner existente
- Excluir banner com confirmacao
- Reordenar (setas cima/baixo ou drag)
- Toggle ativar/desativar

**4. Hook `src/hooks/admin/useAdminBanners.ts`**

- `useBanners()` - listar banners ordenados
- `useCreateBanner()` - criar
- `useUpdateBanner()` - editar
- `useDeleteBanner()` - excluir
- `useUploadBannerImage()` - upload de imagem para o bucket

**5. Atualizar sidebar (`src/components/admin/AdminSidebar.tsx`)**

- Adicionar item "Banners" com icone `ImageIcon` entre "Marcas" e "Clientes"

**6. Atualizar rotas (`src/App.tsx`)**

- Nova rota `/admin/banners` apontando para `BannersPage`

**7. Atualizar HeroBanner (`src/components/home/HeroBanner.tsx`)**

- Buscar banners ativos do banco de dados ordenados por `sort_order`
- Fallback para banners padrao caso nao haja banners no banco
- Exibir skeleton/loading durante carregamento

**8. Atualizar exports**

- `src/pages/admin/index.ts` - exportar BannersPage
- `src/hooks/admin/index.ts` - exportar hooks de banners

### Resumo de arquivos

| Arquivo | Acao |
|---------|------|
| Migration SQL (banners table + storage bucket) | Criar |
| `src/pages/admin/BannersPage.tsx` | Criar |
| `src/hooks/admin/useAdminBanners.ts` | Criar |
| `src/components/admin/AdminSidebar.tsx` | Editar (novo item menu) |
| `src/App.tsx` | Editar (nova rota) |
| `src/components/home/HeroBanner.tsx` | Editar (fetch do banco) |
| `src/pages/admin/index.ts` | Editar (export) |
| `src/hooks/admin/index.ts` | Editar (export) |
| `src/components/admin/index.ts` | Sem alteracao |




# Plano de Correções para Produção

## Correção 1: Bug do Redirect Admin (Crítico)
**Arquivo:** `src/pages/admin/AdminLayout.tsx` (linha 44)
- Alterar `<Navigate to="/login" replace />` para `<Navigate to="/login" state={{ from: window.location.pathname }} replace />`
- Isso garante que ao fazer login vindo do `/admin`, o usuário volte para o painel admin

## Correção 2: Remover Payment Fallback Mock (Crítico)
**Arquivo:** `src/services/paymentService.ts` (linhas 83-102)
- Remover o bloco `catch` que retorna um pagamento fake "bem-sucedido"
- Substituir por `throw` real do erro para que o checkout mostre o erro ao usuário
- Em produção, se o ASAAS falhar, o pedido NÃO deve ser criado como pago

## Correção 3: Funções DB sem search_path (Segurança)
- Executar SQL para adicionar `SET search_path = public` nas funções `handle_new_user` e `update_updated_at_column`

## Correção 4: Acessibilidade dos Dialogs
- Adicionar `DialogTitle` visualmente oculto nos componentes `Sheet` e `Dialog` que estão sem título (ex: `AdminLayout.tsx` mobile sidebar, `BulkImportModal`, etc.)

## Correção 5: Code Splitting no App.tsx
**Arquivo:** `src/App.tsx`
- Converter imports de páginas para `React.lazy()` + `Suspense`
- Separar rotas admin, institucional e loja em chunks distintos
- Reduz o bundle inicial significativamente

## Resumo da Análise

### Pronto para produção:
- Arquitetura bem organizada (hooks, components, pages, services)
- TypeScript consistente
- RLS correto nas tabelas principais (orders, profiles, addresses, favorites)
- PWA configurado
- Cart persistido no localStorage
- Lazy loading de imagens
- Compressão WebP automática no upload

### Bloqueadores (corrigidos neste plano):
1. Bug do redirect admin (1 linha)
2. Payment fallback mock (risco financeiro)

### Melhorias recomendadas pós-lançamento:
- Página de recuperação de senha (`/esqueci-senha`)
- Meta tags dinâmicas para SEO
- Sitemap.xml
- Email transacional de confirmação de pedido
- Error boundary global


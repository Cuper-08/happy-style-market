
## Manter a pagina atual ao voltar da criacao/edicao de produto

### Problema

Ao salvar um produto (novo ou editado), o `ProductFormPage` faz `navigate('/admin/produtos')`, que sempre volta para a pagina 1 da listagem. Se voce estava na pagina 12 antes de criar/editar, perde a posicao.

### Solucao

Usar **query parameters** na URL para persistir a pagina atual. O fluxo sera:

1. **ProductsPage**: Guardar `currentPage` na URL como `?page=X` (ex: `/admin/produtos?page=12`)
2. **ProductsPage**: Ao clicar em "Novo Produto" ou "Editar", passar a pagina atual como parametro (ex: `/admin/produtos/novo?page=12`)
3. **ProductFormPage**: Ao salvar com sucesso, redirecionar para `/admin/produtos?page=12` em vez de apenas `/admin/produtos`
4. **ProductFormPage**: O botao de voltar (seta) tambem preserva a pagina

### Detalhes Tecnicos

**Arquivo 1: `src/pages/admin/ProductsPage.tsx`**
- Ler `page` dos query params com `useSearchParams` para inicializar `currentPage`
- Atualizar a URL quando a pagina muda (`setSearchParams`)
- Passar `?page=X` nos links de "Novo Produto" e "Editar"

**Arquivo 2: `src/pages/admin/ProductFormPage.tsx`**
- Ler o parametro `page` da URL com `useSearchParams`
- Nas 2 chamadas `onSuccess`, trocar `navigate('/admin/produtos')` por `navigate('/admin/produtos?page=X')`
- No botao de voltar (seta), trocar `navigate('/admin/produtos')` por `navigate('/admin/produtos?page=X')`

Alteracao simples em 2 arquivos, sem mudanca de banco de dados.

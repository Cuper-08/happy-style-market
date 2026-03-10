

# Analise do Painel Administrativo -- Pontos de Melhoria

Revisei todas as telas do painel admin (Dashboard, Pedidos, Detalhe do Pedido, Produtos, Clientes, Relatorios, Configuracoes, Banners). O painel ja esta bem construido -- responsivo, com animacoes, filtros e boa organizacao. Mas ha oportunidades claras de melhoria para chegar ao nivel "premium" que o projeto busca:

---

## 1. Tela de Pedidos (`OrdersPage`)

**O que falta:**
- **Busca por nome do cliente** -- hoje so busca por ID e codigo de rastreio. O cliente deveria poder buscar pelo nome de quem comprou.
- **Filtro por data** -- o hook ja suporta `startDate`/`endDate` mas a UI nao expoe isso. Um date range picker faria muita diferenca.
- **Paginacao** -- se houver muitos pedidos, carrega tudo de uma vez. Precisa de paginacao (como ja existe na tela de Produtos).
- **Contadores por status** -- mostrar mini-badges no topo com a quantidade de pedidos por status (ex: 3 pendentes, 5 pagos, 2 enviados) para visao rapida.
- **Exportar pedidos** -- botao para exportar CSV/Excel dos pedidos filtrados.

## 2. Detalhe do Pedido (`OrderDetailPage`)

**O que falta:**
- **Timeline/historico de status** -- hoje so mostra o status atual. Deveria ter uma timeline visual mostrando a progressao (Pendente > Pago > Preparando > Enviado > Entregue).
- **Imagem do produto** nos itens do pedido -- hoje so mostra nome e preco.
- **Botao de imprimir/PDF** -- para imprimir comprovante do pedido.
- **Link direto para o produto** no admin -- clicar no item deveria levar ao produto.
- **Notas internas** -- campo para o admin adicionar observacoes sobre o pedido (hoje so mostra `order.notes` que vem do sistema).

## 3. Dashboard

**O que falta:**
- **Stat de conversao** -- taxa de conversao (visitantes vs pedidos).
- **Grafico de pedidos por status** -- um donut chart mostrando distribuicao dos status.

## 4. Tela de Produtos

**O que falta:**
- **Filtro por categoria** -- hoje so tem busca por texto.
- **Filtro por status de estoque** (com estoque / sem estoque).
- **Acoes em massa** -- selecionar multiplos produtos e excluir/ativar/desativar de uma vez.
- **Ordenacao por colunas** (clicar no cabecalho da tabela para ordenar por preco, nome, estoque).

## 5. Tela de Clientes

**O que falta:**
- **Paginacao** -- carrega todos os clientes de uma vez.
- **Historico de compras inline** -- clicar no cliente nao leva a nenhuma pagina de detalhe util.

## 6. Consistencia Visual

- A tela de **Pedidos** tem um estilo "premium" (glassmorphism toolbar, glow effects, gradients) que as outras telas (Produtos, Clientes, Categorias) nao tem. Deveria padronizar o header e a toolbar em todas as telas.

---

## Plano de Implementacao (priorizado)

### Fase 1 -- Impacto imediato na operacao
1. **Pedidos: busca por nome do cliente + filtro por data** -- adicionar campo `customer_name` na query de orders e date range picker na toolbar
2. **Pedidos: paginacao** -- limitar a 20 por pagina com controles
3. **Pedidos: contadores por status** -- cards/chips no topo com contagem rapida
4. **Detalhe do Pedido: timeline de status** -- componente visual de progressao

### Fase 2 -- Polimento
5. **Produtos: filtro por categoria + status de estoque**
6. **Padronizar headers** de todas as telas admin com o mesmo estilo premium da tela de Pedidos
7. **Detalhe do Pedido: imagens dos produtos + link para editar produto**
8. **Pedidos e Clientes: exportar CSV**

### Fase 3 -- Recursos avancados
9. **Produtos: acoes em massa**
10. **Produtos: ordenacao por colunas**
11. **Dashboard: grafico de distribuicao por status**

---

### Detalhes tecnicos

- **Busca por cliente nos pedidos**: fazer join com `profiles` na query do `useAdminOrders` para trazer `full_name` e filtrar no campo de busca.
- **Date range picker**: usar `react-day-picker` (ja instalado) dentro de um Popover.
- **Paginacao de pedidos**: adicionar `range()` no Supabase query + state de pagina.
- **Contadores por status**: uma query separada com `group by status` ou contar do array carregado.
- **Timeline de status**: componente visual com steps (Pendente > Pago > Preparando > Enviado > Entregue), destacando o passo atual.
- **Headers padronizados**: extrair o header premium da OrdersPage em um componente reutilizavel `AdminPageHeader`.

Posso implementar todas as fases ou comecar pela Fase 1 se preferir ir por partes.


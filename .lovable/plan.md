

# Ordenar "Nossos Produtos" por maior valor (preço)

## Problema
Atualmente os produtos na HomePage são ordenados por `created_at` (mais recentes primeiro). O pedido e que os produtos de maior valor agregado apareçam primeiro em todas as "dobras" (linhas do grid).

## Solucao

Mudanca simples: alterar a ordenacao da query em `useProducts` quando usada na HomePage.

### Mudancas

**1. `src/hooks/useProducts.ts`** — Adicionar opcao `orderBy` ao hook:
- Novo parametro opcional: `orderBy?: { column: string; ascending: boolean }`
- Quando fornecido, usa esse campo para ordenar em vez de `created_at`

**2. `src/pages/HomePage.tsx`** — Passar ordenacao por preco:
- Mudar a chamada de `useProducts({ limit: 16 })` para `useProducts({ limit: 16, orderBy: { column: 'price_retail', ascending: false } })`
- Isso fara os tenis mais caros aparecerem primeiro em todas as linhas do grid

Resultado: os 16 produtos exibidos serao os de maior `price_retail`, garantindo que tenis esportivos e premium aparecam nas primeiras dobras.


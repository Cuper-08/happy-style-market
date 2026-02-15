

## Corrigir Desconto Atacado 6+ e Implementar Sub-Páginas da Conta

### Problema 1: Desconto Atacado

A lógica no `useCart.ts` está **correta** -- quando `totalItems >= 6`, usa `product.price` (atacado) em vez de `product.price_retail` (varejo). Porém, há dois problemas de visibilidade:

1. **No Checkout**: o resumo do pedido **não mostra** a economia de atacado. Só mostra desconto do método de pagamento (PIX 10%, Boleto 5%). O usuário não consegue ver que o preço já está com atacado aplicado.
2. **No Checkout**: não importa `isWholesale` nem `wholesaleSavings` do contexto do carrinho, então não há indicação visual de que o atacado está ativo.

**Correção no `src/pages/CheckoutPage.tsx`:**
- Importar `isWholesale` e `wholesaleSavings` do `useCart`
- Mostrar linha "Economia atacado" no resumo quando aplicável
- Mostrar badge "ATACADO ATIVO" quando `isWholesale = true`

---

### Problema 2: Sub-Páginas da Conta (Meus Pedidos, Enderecos, Perfil)

As rotas `/minha-conta/pedidos`, `/minha-conta/enderecos` e `/minha-conta/perfil` todas apontam para o mesmo `AccountPage` que é apenas o **menu**. Não existe conteúdo real nessas páginas.

**Solução: Criar 3 novas páginas completas:**

**1. `src/pages/account/OrdersPage.tsx` -- Meus Pedidos**
- Buscar pedidos do usuário logado via `supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id)`
- Listar pedidos com: data, status (badge colorido), total, itens
- Expandir detalhes de cada pedido (itens, endereço, rastreio)
- Estado vazio: "Você ainda não fez nenhum pedido"

**2. `src/pages/account/AddressesPage.tsx` -- Enderecos**
- Buscar endereços via `supabase.from('addresses').select('*').eq('user_id', user.id)`
- Listar endereços com: label, rua, número, bairro, cidade, CEP
- Permitir adicionar novo endereço (formulário com busca CEP via ViaCEP)
- Permitir editar e excluir endereços existentes
- Marcar endereço como padrão

**3. `src/pages/account/ProfilePage.tsx` -- Dados Pessoais**
- Buscar perfil via `supabase.from('profiles').select('*').eq('user_id', user.id)`
- Formulário editável: Nome completo, Telefone, CPF
- Mostrar e-mail (somente leitura, vem do auth)
- Botão "Salvar Alterações" com feedback visual
- Máscaras de CPF e telefone (reutilizar do checkout)

**Atualizar rotas no `src/App.tsx`:**
```text
/minha-conta/pedidos   -> OrdersPage (novo)
/minha-conta/enderecos -> AddressesPage (novo)
/minha-conta/perfil    -> ProfilePage (novo)
```

---

### Detalhes Técnicos

**Arquivos a criar:**
1. `src/pages/account/OrdersPage.tsx`
2. `src/pages/account/AddressesPage.tsx`
3. `src/pages/account/ProfilePage.tsx`

**Arquivos a modificar:**
1. `src/App.tsx` -- atualizar rotas das sub-páginas
2. `src/pages/CheckoutPage.tsx` -- adicionar indicadores visuais de atacado no resumo

**Segurança (já ok):**
- RLS de `orders` e `order_items`: usuario só vê os seus próprios (`auth.uid() = user_id`)
- RLS de `addresses`: usuario só vê/edita/deleta os seus próprios
- RLS de `profiles`: usuario só vê/edita o seu próprio

**Nenhuma mudança no banco necessária** -- todas as tabelas e políticas já existem.


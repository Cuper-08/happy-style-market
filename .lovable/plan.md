

## Plano: Salvar Dados do Usuario no Checkout

### Problema
O checkout salva endereco e dados pessoais apenas no JSON do pedido (`shipping_address`), mas nao atualiza o perfil nem a tabela de enderecos. Por isso, a area "Minha Conta" aparece sem telefone, CPF e enderecos.

### Solucao
Ao finalizar o pedido, alem de criar o pedido, tambem:
1. Atualizar o perfil do usuario (nome, telefone, CPF)
2. Salvar o endereco na tabela `addresses`

### Alteracoes

**Arquivo**: `src/pages/CheckoutPage.tsx`

Na funcao `handlePaymentSubmit`, apos criar o pedido com sucesso, adicionar:

1. **Atualizar perfil** - Salvar `full_name`, `phone` e `cpf` na tabela `profiles`:
```typescript
await supabase
  .from('profiles')
  .update({
    full_name: shippingData.fullName,
    phone: shippingData.phone,
    cpf: shippingData.cpf,
  })
  .eq('user_id', user.id);
```

2. **Salvar endereco** - Inserir na tabela `addresses` (verificando se ja nao existe um com mesmo CEP+numero):
```typescript
const { data: existingAddr } = await supabase
  .from('addresses')
  .select('id')
  .eq('user_id', user.id)
  .eq('cep', shippingData.cep)
  .eq('number', shippingData.number)
  .maybeSingle();

if (!existingAddr) {
  await supabase.from('addresses').insert({
    user_id: user.id,
    label: 'Casa',
    cep: shippingData.cep,
    street: shippingData.street,
    number: shippingData.number,
    complement: shippingData.complement || null,
    neighborhood: shippingData.neighborhood,
    city: shippingData.city,
    state: shippingData.state,
    is_default: true,
  });
}
```

3. **Pre-carregar dados do perfil** - Ao abrir o checkout, preencher o formulario com dados ja salvos no perfil e ultimo endereco:
```typescript
// Carregar endereco padrao do usuario
useEffect(() => {
  if (user) {
    supabase.from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setShippingData(prev => ({
            ...prev,
            cep: data.cep,
            street: data.street,
            number: data.number,
            complement: data.complement || '',
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
          }));
        }
      });
  }
}, [user]);
```

### Resultado
- Apos a primeira compra, os dados pessoais e endereco ficam salvos
- Em compras futuras, os campos ja virao preenchidos automaticamente
- A area "Minha Conta" mostrara telefone, CPF e enderecos corretamente

### Arquivo modificado
| Arquivo | Acao |
|---------|------|
| `src/pages/CheckoutPage.tsx` | Modificar |


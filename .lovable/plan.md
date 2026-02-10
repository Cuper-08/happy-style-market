

## Plano: Desativar Confirmacao de E-mail

A solucao e simples e nao requer alteracao de codigo. Basta ajustar uma configuracao no painel do Supabase.

---

### Passo Unico: Desativar no Supabase Dashboard

1. Acesse o [Supabase Dashboard - Auth Settings](https://supabase.com/dashboard/project/zcoixlvbkssvuxamzwvs/auth/providers)
2. Na secao **Email**, encontre a opcao **"Confirm email"**
3. **Desative** o toggle (desmarque)
4. Clique em **Save**

---

### O que acontece apos desativar

- Novos usuarios terao acesso imediato apos o cadastro, sem precisar confirmar o e-mail
- O usuario `cuper.nascimento@gmail.com` ja esta confirmado e pode fazer login normalmente
- Outros usuarios que cadastraram mas nao confirmaram (como `sdadapdsapn@gmail.com`) precisarao cadastrar novamente ou voce pode confirma-los manualmente no painel de [Usuarios do Supabase](https://supabase.com/dashboard/project/zcoixlvbkssvuxamzwvs/auth/users)

---

### Importante

Nenhuma alteracao de codigo e necessaria. Apenas a configuracao no painel do Supabase.


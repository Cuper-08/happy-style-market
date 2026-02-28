

# Correcao do Fluxo de Login Admin

## Problema Identificado

Ao acessar `/admin` sem estar logado, o usuario e redirecionado para `/login`. Apos o login, o redirect de volta para `/admin` pode falhar por dois motivos:

1. **Race condition**: O `useAdminAuth` inicia com `isLoading: true`, mas ha um breve momento entre o redirect para `/admin` e a verificacao completa da role onde `isAdminOrManager` pode retornar `false` antes do carregamento terminar
2. **Unico admin cadastrado**: Apenas `project_apk001@outlook.com` tem role `admin` na tabela `user_roles`

## Correcoes Planejadas

### 1. Melhorar o hook `useAdminAuth` para evitar race condition

**Arquivo:** `src/hooks/admin/useAdminAuth.ts`

- Garantir que `isLoading` permanece `true` ate que tanto o auth quanto o role fetch estejam completos
- Adicionar dependencia no `user?.id` (nao apenas `user`) para evitar re-fetch desnecessario
- Resetar `isLoading` para `true` quando o user mudar (evita flash de "nao autorizado" durante troca de sessao)

### 2. Melhorar o LoginPage para aguardar a sessao antes de redirecionar

**Arquivo:** `src/pages/LoginPage.tsx`

- Apos o `signIn()`, adicionar um pequeno delay ou aguardar o `onAuthStateChange` confirmar a sessao antes de navegar
- Isso evita que o redirect chegue ao AdminLayout antes da sessao estar propagada

### 3. (Opcional) Adicionar outro usuario como admin

Se necessario, executar uma migration SQL para inserir um novo registro na tabela `user_roles` com o `user_id` do email desejado e `role: 'admin'`.

## Detalhes Tecnicos

### Hook `useAdminAuth` corrigido:

```typescript
export function useAdminAuth(): UseAdminAuthReturn {
  const { user, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    // Reset role loading when user changes
    setRoleLoading(true);
    
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }
      // ... fetch role from user_roles ...
      setRoleLoading(false);
    }

    if (!authLoading) {
      fetchRole();
    }
  }, [user?.id, authLoading]); // user?.id instead of user

  return {
    // ...
    isLoading: authLoading || roleLoading,
  };
}
```

### LoginPage - aguardar sessao:

No `handleSubmit`, apos o `signIn()`, usar o `onAuthStateChange` para confirmar que a sessao esta ativa antes de fazer o `navigate()`:

```typescript
await signIn(email, password);
// Aguardar a sessao ser confirmada pelo listener
// antes de redirecionar
```

## Arquivos que serao modificados:
- `src/hooks/admin/useAdminAuth.ts` - corrigir race condition no loading
- `src/pages/LoginPage.tsx` - aguardar sessao antes de redirecionar


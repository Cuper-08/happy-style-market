
## Corrigir Logo Quebrada e Remover Login com Google

### Problema 1: Logo quebrada no Header

A logo está importada como `import logo from '@/assets/logo.webp'`. O arquivo `logo.webp` existe na pasta `src/assets/`, mas como você fez atualizações via GitHub, é possível que o arquivo `.webp` tenha sido corrompido ou substituído. A solução mais robusta é mudar o import para usar `logo.png` (que também existe em `src/assets/`), pois PNG tem suporte universal garantido em todos os navegadores e ambientes de build.

### Problema 2: Botão "Continuar com Google" na tela de login

O `LoginPage.tsx` renderiza:
- Um botão "Continuar com Google" (linhas 152–161)
- Um separador "ou" (linhas 163–168)
- A função `handleGoogleSignIn` (linhas 50–63)
- O import do ícone `Chrome` do lucide-react (linha 11)
- O import do `Separator` (linha 12)

Todos esses elementos serão removidos. O `Separator` pode ser mantido importado caso seja usado em outro lugar — verificar antes de remover o import.

### Mudanças Planejadas

**1. `src/components/layout/Header.tsx`**
- Trocar `import logo from '@/assets/logo.webp'` por `import logo from '@/assets/logo.png'`
- Isso garante compatibilidade máxima e evita problemas de build com `.webp`

**2. `src/pages/LoginPage.tsx`**
- Remover o bloco do botão Google (linhas 152–161)
- Remover o separador "ou" (linhas 163–168)
- Remover a função `handleGoogleSignIn` (linhas 50–63)
- Remover os imports não utilizados: `Chrome` do lucide-react e `Separator` do ui/separator

### Resumo

| Arquivo | Mudança |
|---------|---------|
| `src/components/layout/Header.tsx` | Import `logo.webp` → `logo.png` |
| `src/pages/LoginPage.tsx` | Remover botão Google, separador, função e imports não utilizados |

São mudanças pontuais e seguras, sem impacto em nenhuma outra funcionalidade do app.

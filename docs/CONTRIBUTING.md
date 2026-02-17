# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Happy Style Market**! Este documento fornece diretrizes para contribuir com o projeto.

---

## 📋 Índice

1. [Código de Conduta](#-código-de-conduta)
2. [Como Contribuir](#-como-contribuir)
3. [Padrões de Código](#-padrões-de-código)
4. [Commits](#-commits)
5. [Pull Requests](#-pull-requests)
6. [Testes](#-testes)
7. [Documentação](#-documentação)

---

## 📜 Código de Conduta

Este projeto adere a um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e colaborativo.

### **Comportamentos Esperados**

- ✅ Seja respeitoso e inclusivo
- ✅ Aceite críticas construtivas
- ✅ Foque no que é melhor para a comunidade
- ✅ Mostre empatia com outros membros

### **Comportamentos Inaceitáveis**

- ❌ Linguagem ofensiva ou discriminatória
- ❌ Assédio de qualquer tipo
- ❌ Ataques pessoais
- ❌ Spam ou trolling

---

## 🚀 Como Contribuir

### **1. Fork o Repositório**

```bash
# Clone seu fork
git clone https://github.com/SEU-USUARIO/happy-style-market.git
cd happy-style-market

# Adicione o repositório original como upstream
git remote add upstream https://github.com/Cuper-08/happy-style-market.git
```

---

### **2. Crie uma Branch**

Sempre crie uma branch para suas alterações:

```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie uma nova branch
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

**Convenção de nomes de branches:**
- `feature/` - Nova funcionalidade
- `fix/` - Correção de bug
- `docs/` - Alterações na documentação
- `refactor/` - Refatoração de código
- `test/` - Adição ou correção de testes
- `chore/` - Tarefas de manutenção

---

### **3. Faça suas Alterações**

- Siga os [padrões de código](#-padrões-de-código)
- Adicione testes quando aplicável
- Atualize a documentação se necessário

---

### **4. Teste suas Alterações**

```bash
# Execute os testes
npm run test

# Execute o linter
npm run lint

# Teste localmente
npm run dev
```

---

### **5. Commit suas Alterações**

Siga o padrão de [commits convencionais](#-commits):

```bash
git add .
git commit -m "feat: adiciona filtro de produtos por marca"
```

---

### **6. Push para seu Fork**

```bash
git push origin feature/nome-da-feature
```

---

### **7. Abra um Pull Request**

1. Vá para o repositório original no GitHub
2. Clique em "New Pull Request"
3. Selecione sua branch
4. Preencha o template de PR
5. Aguarde a revisão

---

## 💻 Padrões de Código

### **TypeScript**

- ✅ Use TypeScript para todo código novo
- ✅ Evite `any` - use tipos específicos
- ✅ Use interfaces para objetos complexos
- ✅ Use enums para valores fixos

```typescript
// ✅ BOM
interface Product {
  id: string;
  title: string;
  price: number;
}

function getProduct(id: string): Promise<Product> {
  // ...
}

// ❌ RUIM
function getProduct(id: any): any {
  // ...
}
```

---

### **React**

- ✅ Use componentes funcionais
- ✅ Use hooks ao invés de classes
- ✅ Extraia lógica complexa para custom hooks
- ✅ Use `React.memo()` para componentes pesados

```tsx
// ✅ BOM
import { memo } from 'react';

interface Props {
  title: string;
  onClick: () => void;
}

export const Button = memo(({ title, onClick }: Props) => {
  return <button onClick={onClick}>{title}</button>;
});

// ❌ RUIM
export function Button(props) {
  return <button onClick={props.onClick}>{props.title}</button>;
}
```

---

### **Nomenclatura**

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `ProductCard` |
| Hooks | camelCase com `use` | `useProducts` |
| Funções | camelCase | `calculateTotal` |
| Constantes | UPPER_SNAKE_CASE | `MAX_ITEMS` |
| Interfaces | PascalCase | `ProductProps` |
| Types | PascalCase | `OrderStatus` |

---

### **Imports**

Organize imports na seguinte ordem:

```typescript
// 1. Bibliotecas externas
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Imports internos (componentes, hooks, utils)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils';

// 3. Tipos
import type { Product } from '@/types';

// 4. Estilos (se aplicável)
import './styles.css';
```

---

### **Estilização**

- ✅ Use Tailwind CSS para estilos
- ✅ Use classes utilitárias ao invés de CSS customizado
- ✅ Use `cn()` helper para classes condicionais

```tsx
import { cn } from '@/lib/utils';

<button
  className={cn(
    "px-4 py-2 rounded-lg",
    isActive && "bg-blue-500 text-white",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  Clique aqui
</button>
```

---

## 📝 Commits

Use **Conventional Commits** para mensagens de commit:

### **Formato**

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### **Tipos**

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Alterações na documentação |
| `style` | Formatação, ponto e vírgula, etc |
| `refactor` | Refatoração de código |
| `test` | Adição ou correção de testes |
| `chore` | Tarefas de manutenção |
| `perf` | Melhoria de performance |

### **Exemplos**

```bash
# Nova funcionalidade
git commit -m "feat(products): adiciona filtro por marca"

# Correção de bug
git commit -m "fix(cart): corrige cálculo de total com desconto"

# Documentação
git commit -m "docs(readme): atualiza instruções de instalação"

# Refatoração
git commit -m "refactor(hooks): extrai lógica de autenticação para hook"

# Breaking change
git commit -m "feat(api): altera estrutura de resposta da API

BREAKING CHANGE: campo 'price' agora retorna número ao invés de string"
```

---

## 🔀 Pull Requests

### **Template de PR**

```markdown
## Descrição
Breve descrição das alterações

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. ...

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Não há warnings no console
- [ ] Build passa sem erros
```

---

### **Revisão de Código**

Seu PR será revisado por um mantenedor. Esteja preparado para:

- Responder a perguntas
- Fazer alterações solicitadas
- Discutir abordagens alternativas

---

## 🧪 Testes

### **Executar Testes**

```bash
# Todos os testes
npm run test

# Modo watch
npm run test:watch

# Com coverage
npm run test -- --coverage
```

---

### **Escrever Testes**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza o texto corretamente', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('chama onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    
    fireEvent.click(screen.getByText('Clique'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📚 Documentação

### **Quando Atualizar**

Atualize a documentação quando:

- ✅ Adicionar nova funcionalidade
- ✅ Alterar API pública
- ✅ Adicionar novos componentes/hooks
- ✅ Mudar processo de instalação/deploy

### **Onde Documentar**

| Tipo | Localização |
|------|-------------|
| Visão geral | `docs/README.md` |
| Componentes | `docs/COMPONENTS.md` |
| Hooks | `docs/HOOKS.md` |
| API | `docs/API.md` |
| Banco de dados | `docs/DATABASE.md` |

---

## 🎯 Boas Práticas

### **1. Mantenha PRs Pequenos**

- ✅ Um PR = Uma funcionalidade/correção
- ✅ Facilita revisão
- ✅ Reduz conflitos

---

### **2. Escreva Código Legível**

```typescript
// ✅ BOM - Claro e descritivo
function calculateOrderTotal(items: CartItem[], discount: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return subtotal - discount;
}

// ❌ RUIM - Confuso e sem tipos
function calc(i, d) {
  return i.reduce((s, x) => s + x.p * x.q, 0) - d;
}
```

---

### **3. Comente Quando Necessário**

```typescript
// ✅ BOM - Explica o "porquê"
// Usamos setTimeout para evitar race condition com o Supabase
setTimeout(() => {
  fetchProducts();
}, 100);

// ❌ RUIM - Explica o "o quê" (óbvio)
// Incrementa o contador
counter++;
```

---

### **4. Evite Duplicação**

```typescript
// ✅ BOM - DRY (Don't Repeat Yourself)
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100);
}

const price1 = formatCurrency(39990);
const price2 = formatCurrency(29990);

// ❌ RUIM - Código duplicado
const price1 = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(39990 / 100);

const price2 = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(29990 / 100);
```

---

## 🆘 Precisa de Ajuda?

- 💬 Abra uma [Discussion](https://github.com/Cuper-08/happy-style-market/discussions)
- 🐛 Reporte bugs via [Issues](https://github.com/Cuper-08/happy-style-market/issues)
- 📧 Email: dev@happystylemarket.com

---

## 🙏 Agradecimentos

Obrigado por contribuir com o Happy Style Market! Toda ajuda é bem-vinda. 💙

---

**Última atualização:** 17/02/2026

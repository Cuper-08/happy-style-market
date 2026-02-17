# 🛍️ Happy Style Market

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.91.1-3ECF8E?logo=supabase)
![License](https://img.shields.io/badge/license-Private-red.svg)

> **Plataforma completa de e-commerce moderna e responsiva, construída com React, TypeScript e Supabase.**

---

## ✨ Características

- 🛒 **Loja Virtual Completa** - Catálogo, carrinho, checkout e favoritos
- 👤 **Autenticação de Usuários** - Login, registro e área do cliente
- ⚙️ **Painel Administrativo** - Gerenciamento completo de produtos, pedidos e clientes
- 📱 **PWA** - Instalável como aplicativo nativo
- 🌓 **Tema Dark/Light** - Alternância de temas
- 🎨 **UI Moderna** - Interface premium com shadcn/ui e Tailwind CSS
- 🚀 **Performance** - Build otimizado com Vite
- 📊 **Dashboard** - Métricas e relatórios de vendas

---

## 🚀 Quick Start

### **Pré-requisitos**

- Node.js 18+
- npm, yarn ou pnpm
- Conta no [Supabase](https://supabase.com) (gratuita)

### **Instalação**

```bash
# Clone o repositório
git clone https://github.com/Cuper-08/happy-style-market.git
cd happy-style-market

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Execute as migrações do banco de dados
npx supabase db push

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

---

## 📚 Documentação

A documentação completa está disponível na pasta `docs/`:

- 📖 **[Documentação Completa](./docs/README.md)** - Visão geral do projeto
- 🗄️ **[Banco de Dados](./docs/DATABASE.md)** - Schema e estrutura do banco
- 🧩 **[Componentes](./docs/COMPONENTS.md)** - Guia de componentes React
- 🪝 **[Hooks](./docs/HOOKS.md)** - Custom hooks disponíveis
- 🔌 **[API](./docs/API.md)** - Referência da API Supabase
- 🤝 **[Contribuindo](./docs/CONTRIBUTING.md)** - Como contribuir

---

## 🛠️ Stack Tecnológico

### **Frontend**
- ⚛️ React 18.3.1
- 📘 TypeScript 5.8.3
- ⚡ Vite 5.4.19
- 🎨 Tailwind CSS 3.4.17
- 🧩 shadcn/ui
- 🎭 Framer Motion

### **Backend & Database**
- 🗄️ Supabase (PostgreSQL)
- 🔄 TanStack Query (React Query)

### **Outras Ferramentas**
- 🧭 React Router DOM
- 📝 React Hook Form + Zod
- 🎨 Lucide Icons
- 📱 Vite PWA Plugin

---

## 📁 Estrutura do Projeto

```
happy-style-market/
├── docs/                    # Documentação
├── public/                  # Arquivos estáticos
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/              # Componentes shadcn/ui
│   │   ├── layout/          # Layout (Header, Footer)
│   │   ├── home/            # Componentes da home
│   │   ├── product/         # Componentes de produtos
│   │   ├── admin/           # Componentes admin
│   │   └── pwa/             # Componentes PWA
│   ├── pages/               # Páginas da aplicação
│   │   ├── account/         # Páginas da conta
│   │   └── admin/           # Páginas admin
│   ├── hooks/               # Custom hooks
│   ├── contexts/            # React contexts
│   ├── integrations/        # Integrações (Supabase)
│   ├── lib/                 # Utilitários
│   ├── types/               # Tipos TypeScript
│   └── App.tsx              # Componente principal
├── supabase/
│   └── migrations/          # Migrações do banco
├── .env                     # Variáveis de ambiente
└── package.json
```

---

## 🎯 Funcionalidades Principais

### **🛍️ Loja Virtual**

- ✅ Catálogo de produtos com filtros
- ✅ Busca de produtos
- ✅ Página de detalhes do produto
- ✅ Carrinho de compras
- ✅ Sistema de favoritos
- ✅ Checkout completo
- ✅ Múltiplos métodos de pagamento (PIX, Cartão, Boleto)
- ✅ Cálculo de frete

### **👤 Área do Cliente**

- ✅ Cadastro e login
- ✅ Gerenciamento de perfil
- ✅ Histórico de pedidos
- ✅ Gerenciamento de endereços
- ✅ Lista de favoritos

### **⚙️ Painel Administrativo**

- ✅ Dashboard com métricas
- ✅ Gerenciamento de produtos (CRUD)
- ✅ Gerenciamento de pedidos
- ✅ Gerenciamento de categorias e marcas
- ✅ Gerenciamento de banners
- ✅ Gerenciamento de cupons
- ✅ Visualização de clientes
- ✅ Relatórios de vendas

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Executa o linter |
| `npm run test` | Executa os testes |

---

## 🌐 Deploy

### **Vercel (Recomendado)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Cuper-08/happy-style-market)

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático! ✨

### **Netlify**

```bash
npm run build
# Upload da pasta dist/
```

### **Lovable**

O projeto foi criado com Lovable:

1. Acesse [Lovable](https://lovable.dev)
2. Clique em **Share → Publish**
3. Seu site estará online!

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_URL="https://seu-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"
```

> **Nota:** Nunca commite o arquivo `.env` com credenciais reais!

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o [Guia de Contribuição](./docs/CONTRIBUTING.md) antes de enviar um PR.

### **Como Contribuir**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 🐛 Reportar Bugs

Encontrou um bug? [Abra uma issue](https://github.com/Cuper-08/happy-style-market/issues/new) com:

- Descrição do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Ambiente (navegador, OS, etc)

---

## 📝 Licença

Este projeto é **privado e proprietário**. Todos os direitos reservados.

---

## 👥 Autores

- **Cuper** - [GitHub](https://github.com/Cuper-08)

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ usando:

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

## 📞 Suporte

- 📧 Email: suporte@happystylemarket.com
- 💬 WhatsApp: (XX) XXXXX-XXXX
- 🌐 Website: [happystylemarket.com](https://happystylemarket.com)

---

## 📊 Status do Projeto

🚧 **Em Desenvolvimento Ativo** 🚧

---

<div align="center">

**Feito com ❤️ por [Cuper](https://github.com/Cuper-08)**

⭐ Se este projeto te ajudou, considere dar uma estrela!

</div>

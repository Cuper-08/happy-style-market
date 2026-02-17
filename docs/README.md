# 📚 Happy Style Market - Documentação Completa

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.91.1-3ECF8E?logo=supabase)

## 🎯 Visão Geral

**Happy Style Market** é uma plataforma completa de e-commerce desenvolvida com tecnologias modernas, focada em oferecer uma experiência de compra premium e responsiva. O sistema inclui funcionalidades de loja virtual, painel administrativo completo e suporte a PWA (Progressive Web App).

---

## 📋 Índice

1. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
2. [Arquitetura do Projeto](#-arquitetura-do-projeto)
3. [Estrutura de Diretórios](#-estrutura-de-diretórios)
4. [Banco de Dados](#-banco-de-dados)
5. [Funcionalidades](#-funcionalidades)
6. [Instalação e Configuração](#-instalação-e-configuração)
7. [Scripts Disponíveis](#-scripts-disponíveis)
8. [Guias de Desenvolvimento](#-guias-de-desenvolvimento)
9. [Deploy](#-deploy)

---

## 🚀 Tecnologias Utilizadas

### **Core**
- **React 18.3.1** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.8.3** - Superset JavaScript com tipagem estática
- **Vite 5.4.19** - Build tool e dev server ultrarrápido

### **UI/UX**
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **shadcn/ui** - Componentes React reutilizáveis e acessíveis
- **Radix UI** - Primitivos de UI sem estilo para acessibilidade
- **Framer Motion 12.29.0** - Biblioteca de animações para React
- **Lucide React** - Ícones modernos e customizáveis

### **Backend & Database**
- **Supabase 2.91.1** - Backend-as-a-Service (PostgreSQL)
- **TanStack Query 5.83.0** - Gerenciamento de estado assíncrono

### **Roteamento & Navegação**
- **React Router DOM 6.30.1** - Roteamento declarativo

### **Formulários & Validação**
- **React Hook Form 7.61.1** - Gerenciamento de formulários performático
- **Zod 3.25.76** - Validação de schemas TypeScript-first

### **PWA**
- **Vite Plugin PWA 1.2.0** - Suporte a Progressive Web App

### **Outras Bibliotecas**
- **date-fns 3.6.0** - Manipulação de datas
- **recharts 2.15.4** - Gráficos e visualização de dados
- **react-dropzone 14.3.8** - Upload de arquivos drag-and-drop
- **embla-carousel-react 8.6.0** - Carrossel de imagens

---

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura **modular e escalável**, separando responsabilidades em camadas distintas:

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Pages, Components, UI Elements)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Business Logic Layer           │
│    (Hooks, Contexts, State Management)  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Data Access Layer             │
│      (Supabase Client, API Calls)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│              Database Layer             │
│         (Supabase PostgreSQL)           │
└─────────────────────────────────────────┘
```

### **Padrões de Design Utilizados**

1. **Component-Based Architecture** - Componentes reutilizáveis e isolados
2. **Context API** - Gerenciamento de estado global (Cart, Theme, Auth)
3. **Custom Hooks** - Lógica reutilizável encapsulada
4. **Repository Pattern** - Abstração da camada de dados via Supabase
5. **Atomic Design** - Organização de componentes (atoms, molecules, organisms)

---

## 📁 Estrutura de Diretórios

```
happy-style-market/
│
├── public/                      # Arquivos estáticos
│   ├── icons/                   # Ícones PWA
│   └── images/                  # Imagens públicas
│
├── src/
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes shadcn/ui
│   │   ├── layout/              # Layout components (Header, Footer)
│   │   ├── home/                # Componentes da home page
│   │   ├── product/             # Componentes de produtos
│   │   ├── admin/               # Componentes do painel admin
│   │   └── pwa/                 # Componentes PWA
│   │
│   ├── pages/                   # Páginas da aplicação
│   │   ├── account/             # Páginas da conta do usuário
│   │   ├── admin/               # Páginas do painel administrativo
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── CartPage.tsx
│   │   └── ...
│   │
│   ├── hooks/                   # Custom React Hooks
│   │   ├── admin/               # Hooks administrativos
│   │   ├── useAuth.tsx          # Hook de autenticação
│   │   ├── useCart.ts           # Hook do carrinho
│   │   ├── useFavorites.ts      # Hook de favoritos
│   │   ├── useProducts.ts       # Hook de produtos
│   │   └── usePWA.ts            # Hook PWA
│   │
│   ├── contexts/                # React Contexts
│   │   ├── CartContext.tsx      # Contexto do carrinho
│   │   └── ThemeContext.tsx     # Contexto de tema (dark/light)
│   │
│   ├── integrations/            # Integrações externas
│   │   └── supabase/
│   │       ├── client.ts        # Cliente Supabase
│   │       └── types.ts         # Tipos TypeScript do DB
│   │
│   ├── lib/                     # Utilitários e helpers
│   │   └── utils.ts             # Funções utilitárias
│   │
│   ├── types/                   # Definições de tipos TypeScript
│   │
│   ├── assets/                  # Assets (imagens, fontes)
│   │
│   ├── App.tsx                  # Componente principal
│   ├── main.tsx                 # Entry point
│   └── index.css                # Estilos globais
│
├── supabase/
│   ├── migrations/              # Migrações do banco de dados
│   └── config.toml              # Configuração Supabase
│
├── .env                         # Variáveis de ambiente
├── package.json                 # Dependências do projeto
├── tsconfig.json                # Configuração TypeScript
├── tailwind.config.ts           # Configuração Tailwind CSS
├── vite.config.ts               # Configuração Vite
└── vitest.config.ts             # Configuração de testes
```

---

## 🗄️ Banco de Dados

O projeto utiliza **Supabase (PostgreSQL)** como backend. Veja a documentação completa do schema em:

📄 **[DATABASE.md](./DATABASE.md)** - Schema completo do banco de dados

### **Tabelas Principais**

| Tabela | Descrição |
|--------|-----------|
| `products` | Produtos da loja |
| `categories` | Categorias de produtos |
| `brands` | Marcas dos produtos |
| `orders` | Pedidos realizados |
| `order_items` | Itens dos pedidos |
| `users` | Usuários do sistema |
| `profiles` | Perfis de usuários |
| `addresses` | Endereços de entrega |
| `favorites` | Produtos favoritos |
| `banners` | Banners promocionais |
| `coupons` | Cupons de desconto |
| `store_settings` | Configurações da loja |

---

## ✨ Funcionalidades

### **🛍️ Loja Virtual (Frontend)**

- ✅ Catálogo de produtos com filtros e busca
- ✅ Página de detalhes do produto com galeria de imagens
- ✅ Carrinho de compras persistente
- ✅ Sistema de favoritos
- ✅ Checkout completo com cálculo de frete
- ✅ Múltiplos métodos de pagamento (PIX, Cartão, Boleto)
- ✅ Autenticação de usuários (login/registro)
- ✅ Área do cliente (pedidos, endereços, perfil)
- ✅ Tema claro/escuro
- ✅ Responsivo (mobile-first)
- ✅ PWA (instalável como app)

### **⚙️ Painel Administrativo**

- ✅ Dashboard com métricas e gráficos
- ✅ Gerenciamento de produtos (CRUD completo)
- ✅ Gerenciamento de pedidos
- ✅ Gerenciamento de categorias e marcas
- ✅ Gerenciamento de banners promocionais
- ✅ Gerenciamento de cupons de desconto
- ✅ Visualização de clientes
- ✅ Relatórios de vendas
- ✅ Configurações da loja

### **🔐 Autenticação & Autorização**

- Sistema de roles (admin, manager, user)
- Proteção de rotas administrativas
- Autenticação via Supabase Auth

---

## 🛠️ Instalação e Configuração

### **Pré-requisitos**

- Node.js 18+ e npm/yarn/pnpm
- Conta no Supabase (gratuita)

### **1. Clone o Repositório**

```bash
git clone https://github.com/Cuper-08/happy-style-market.git
cd happy-style-market
```

### **2. Instale as Dependências**

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### **3. Configure as Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_URL="https://seu-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"
```

> **Nota:** As credenciais do Supabase podem ser encontradas no painel do projeto em Settings > API.

### **4. Execute as Migrações do Banco de Dados**

```bash
# Instale o Supabase CLI
npm install -g supabase

# Faça login no Supabase
supabase login

# Link ao projeto
supabase link --project-ref seu-project-id

# Execute as migrações
supabase db push
```

### **5. Inicie o Servidor de Desenvolvimento**

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

---

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run build:dev` | Cria build em modo desenvolvimento |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa o linter (ESLint) |
| `npm run test` | Executa os testes (Vitest) |
| `npm run test:watch` | Executa testes em modo watch |

---

## 📖 Guias de Desenvolvimento

- 📄 **[COMPONENTS.md](./COMPONENTS.md)** - Guia de componentes
- 📄 **[HOOKS.md](./HOOKS.md)** - Documentação dos custom hooks
- 📄 **[API.md](./API.md)** - Referência da API Supabase
- 📄 **[STYLING.md](./STYLING.md)** - Guia de estilização
- 📄 **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Como contribuir

---

## 🚀 Deploy

### **Deploy no Vercel (Recomendado)**

1. Faça push do código para o GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático! ✨

### **Deploy no Netlify**

```bash
npm run build
# Upload da pasta dist/ para o Netlify
```

### **Deploy via Lovable**

O projeto foi criado com Lovable e pode ser deployado diretamente pela plataforma:

1. Acesse o projeto no Lovable
2. Clique em **Share → Publish**
3. Seu site estará no ar!

---

## 📞 Suporte

Para dúvidas ou problemas:

- 📧 Email: suporte@happystylemarket.com
- 💬 WhatsApp: (XX) XXXXX-XXXX
- 🐛 Issues: [GitHub Issues](https://github.com/Cuper-08/happy-style-market/issues)

---

## 📄 Licença

Este projeto é privado e proprietário.

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ usando tecnologias modernas e open-source.

**Stack Principal:**
- React Team
- Vercel (Vite)
- Supabase Team
- shadcn
- Radix UI Team
- Tailwind Labs

---

**Última atualização:** 17/02/2026

# 🗄️ Documentação do Banco de Dados

## Visão Geral

O **Happy Style Market** utiliza **Supabase (PostgreSQL)** como banco de dados. Este documento descreve o schema completo, incluindo tabelas, relacionamentos, enums e funções.

---

## 📊 Diagrama ER (Entity-Relationship)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   users     │       │   profiles   │       │  addresses  │
│  (Supabase) │──────▶│              │──────▶│             │
└─────────────┘       └──────────────┘       └─────────────┘
       │                      │
       │                      │
       ▼                      ▼
┌─────────────┐       ┌──────────────┐
│  user_roles │       │  favorites   │
└─────────────┘       └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │   products   │◀──────┐
                      └──────────────┘       │
                             │               │
                             ▼               │
                      ┌──────────────┐       │
                      │product_      │       │
                      │variants      │       │
                      └──────────────┘       │
                                             │
┌─────────────┐       ┌──────────────┐       │
│   orders    │──────▶│ order_items  │───────┘
└─────────────┘       └──────────────┘

┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│ categories  │  │    brands    │  │   banners   │
└─────────────┘  └──────────────┘  └─────────────┘

┌─────────────┐  ┌──────────────┐
│   coupons   │  │store_settings│
└─────────────┘  └──────────────┘
```

---

## 📋 Tabelas

### 1. **products** (Produtos)

Armazena todos os produtos da loja.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único do produto (PK) |
| `title` | TEXT | NOT NULL | Nome do produto |
| `slug` | TEXT | NOT NULL | URL amigável (único) |
| `description` | TEXT | NULL | Descrição detalhada |
| `category` | TEXT | NULL | Categoria do produto |
| `price` | NUMERIC | NULL | Preço promocional (em centavos) |
| `price_display` | TEXT | NULL | Preço formatado (ex: "R$ 199,90") |
| `price_retail` | NUMERIC | NULL | Preço de varejo original |
| `price_retail_display` | TEXT | NULL | Preço de varejo formatado |
| `images` | TEXT[] | NULL | Array de URLs de imagens |
| `original_url` | TEXT | NULL | URL original (se importado) |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |

**Índices:**
- `slug` (UNIQUE)

**Exemplo:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Tênis Nike Air Max",
  "slug": "tenis-nike-air-max",
  "category": "Tênis",
  "price": 39990,
  "price_display": "R$ 399,90",
  "images": ["url1.jpg", "url2.jpg"]
}
```

---

### 2. **product_variants** (Variantes de Produtos)

Armazena as variações de tamanho e estoque dos produtos.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único da variante (PK) |
| `product_id` | UUID | NULL | Referência ao produto (FK) |
| `size` | TEXT | NOT NULL | Tamanho (ex: "38", "M", "GG") |
| `stock` | BOOLEAN | NULL | Disponibilidade em estoque |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |

**Relacionamentos:**
- `product_id` → `products.id` (ON DELETE CASCADE)

---

### 3. **categories** (Categorias)

Categorias de produtos.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único (PK) |
| `name` | TEXT | NOT NULL | Nome da categoria |
| `slug` | TEXT | NOT NULL | URL amigável (único) |
| `icon` | TEXT | NULL | Nome do ícone (Lucide) |
| `image_url` | TEXT | NULL | URL da imagem da categoria |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |

**Exemplo:**
```json
{
  "id": "...",
  "name": "Tênis",
  "slug": "tenis",
  "icon": "Footprints"
}
```

---

### 4. **brands** (Marcas)

Marcas dos produtos.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único (PK) |
| `name` | TEXT | NOT NULL | Nome da marca |
| `slug` | TEXT | NOT NULL | URL amigável (único) |
| `logo_url` | TEXT | NULL | URL do logo da marca |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |

---

### 5. **orders** (Pedidos)

Pedidos realizados pelos clientes.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único do pedido (PK) |
| `user_id` | UUID | NULL | ID do usuário (FK) |
| `status` | ENUM | NOT NULL | Status do pedido |
| `subtotal` | NUMERIC | NOT NULL | Subtotal (sem frete/desconto) |
| `shipping_cost` | NUMERIC | NULL | Custo do frete |
| `discount` | NUMERIC | NULL | Valor do desconto |
| `total` | NUMERIC | NOT NULL | Total final |
| `payment_method` | ENUM | NULL | Método de pagamento |
| `shipping_method` | ENUM | NULL | Método de envio |
| `shipping_address` | JSON | NULL | Endereço de entrega |
| `tracking_code` | TEXT | NULL | Código de rastreamento |
| `notes` | TEXT | NULL | Observações do pedido |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |
| `updated_at` | TIMESTAMP | NOT NULL | Data de atualização |

**Status possíveis (ENUM `order_status`):**
- `pending` - Pendente
- `paid` - Pago
- `processing` - Em processamento
- `shipped` - Enviado
- `delivered` - Entregue
- `cancelled` - Cancelado

**Métodos de pagamento (ENUM `payment_method`):**
- `pix` - PIX
- `card` - Cartão de crédito
- `boleto` - Boleto bancário

**Métodos de envio (ENUM `shipping_method`):**
- `pac` - PAC (Correios)
- `sedex` - SEDEX (Correios)
- `express` - Entrega expressa

---

### 6. **order_items** (Itens do Pedido)

Itens individuais de cada pedido.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único (PK) |
| `order_id` | UUID | NOT NULL | Referência ao pedido (FK) |
| `product_id` | UUID | NULL | Referência ao produto (FK) |
| `variant_id` | UUID | NULL | Referência à variante |
| `product_name` | TEXT | NOT NULL | Nome do produto (snapshot) |
| `variant_info` | TEXT | NULL | Info da variante (ex: "Tamanho: 42") |
| `quantity` | INTEGER | NOT NULL | Quantidade |
| `unit_price` | NUMERIC | NOT NULL | Preço unitário |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |

**Relacionamentos:**
- `order_id` → `orders.id` (ON DELETE CASCADE)

---

### 7. **profiles** (Perfis de Usuários)

Informações adicionais dos usuários.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único (PK) |
| `user_id` | UUID | NOT NULL | Referência ao usuário Supabase |
| `full_name` | TEXT | NULL | Nome completo |
| `cpf` | TEXT | NULL | CPF |
| `phone` | TEXT | NULL | Telefone |
| `customer_type` | TEXT | NULL | Tipo de cliente (pessoa física/jurídica) |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |
| `updated_at` | TIMESTAMP | NOT NULL | Data de atualização |

---

### 8. **addresses** (Endereços)

Endereços de entrega dos usuários.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único (PK) |
| `user_id` | UUID | NOT NULL | Referência ao usuário |
| `label` | TEXT | NULL | Rótulo (ex: "Casa", "Trabalho") |
| `cep` | TEXT | NOT NULL | CEP |
| `street` | TEXT | NOT NULL | Rua |
| `number` | TEXT | NOT NULL | Número |
| `complement` | TEXT | NULL | Complemento |
| `neighborhood` | TEXT | NOT NULL | Bairro |
| `city` | TEXT | NOT NULL | Cidade |
| `state` | TEXT | NOT NULL | Estado (UF) |
| `is_default` | BOOLEAN | NULL | Endereço padrão |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |

---

### 9. **favorites** (Favoritos)

Produtos favoritados pelos usuários.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único (PK) |
| `user_id` | UUID | NOT NULL | Referência ao usuário |
| `product_id` | UUID | NOT NULL | Referência ao produto |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |

**Índice único:** `(user_id, product_id)`

---

### 10. **banners** (Banners Promocionais)

Banners exibidos na home page.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único (PK) |
| `title` | TEXT | NOT NULL | Título do banner |
| `subtitle` | TEXT | NULL | Subtítulo |
| `image_url` | TEXT | NOT NULL | URL da imagem |
| `button_text` | TEXT | NULL | Texto do botão CTA |
| `button_link` | TEXT | NULL | Link do botão |
| `is_active` | BOOLEAN | NOT NULL | Banner ativo |
| `sort_order` | INTEGER | NOT NULL | Ordem de exibição |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |

---

### 11. **coupons** (Cupons de Desconto)

Cupons promocionais.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único (PK) |
| `code` | TEXT | NOT NULL | Código do cupom (único) |
| `discount_type` | TEXT | NOT NULL | Tipo: "percentage" ou "fixed" |
| `discount_value` | NUMERIC | NOT NULL | Valor do desconto |
| `min_order_value` | NUMERIC | NULL | Valor mínimo do pedido |
| `max_discount` | NUMERIC | NULL | Desconto máximo (para %) |
| `max_uses` | INTEGER | NULL | Usos máximos |
| `uses_count` | INTEGER | NULL | Contador de usos |
| `valid_from` | TIMESTAMP | NULL | Válido a partir de |
| `valid_until` | TIMESTAMP | NULL | Válido até |
| `is_active` | BOOLEAN | NULL | Cupom ativo |
| `created_at` | TIMESTAMP | NULL | Data de criação |

---

### 12. **user_roles** (Roles de Usuários)

Permissões dos usuários.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único (PK) |
| `user_id` | UUID | NOT NULL | Referência ao usuário |
| `role` | ENUM | NOT NULL | Role do usuário |
| `created_at` | TIMESTAMP | NULL | Data de criação |

**Roles possíveis (ENUM `app_role`):**
- `admin` - Administrador completo
- `manager` - Gerente (acesso limitado)
- `user` - Usuário comum

---

### 13. **store_settings** (Configurações da Loja)

Configurações gerais da loja (tabela singleton).

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | UUID | NOT NULL | ID único (PK) |
| `company_name` | TEXT | NULL | Nome da empresa |
| `cnpj` | TEXT | NULL | CNPJ |
| `email` | TEXT | NULL | Email de contato |
| `phone` | TEXT | NULL | Telefone |
| `whatsapp` | TEXT | NULL | WhatsApp |
| `logo_url` | TEXT | NULL | URL do logo |
| `banner_url` | TEXT | NULL | URL do banner |
| `address` | JSON | NULL | Endereço da loja |
| `shipping_config` | JSON | NULL | Configurações de frete |
| `terms_of_service` | TEXT | NULL | Termos de serviço |
| `privacy_policy` | TEXT | NULL | Política de privacidade |
| `exchange_policy` | TEXT | NULL | Política de trocas |
| `created_at` | TIMESTAMP | NULL | Data de criação |
| `updated_at` | TIMESTAMP | NULL | Data de atualização |

---

## 🔧 Funções PostgreSQL

### 1. **has_role()**

Verifica se um usuário possui uma role específica.

```sql
has_role(_role: app_role, _user_id: uuid) RETURNS boolean
```

**Exemplo:**
```sql
SELECT has_role('admin', 'user-uuid-here');
```

---

### 2. **is_admin_or_manager()**

Verifica se um usuário é admin ou manager.

```sql
is_admin_or_manager(_user_id: uuid) RETURNS boolean
```

---

### 3. **decrement_stock()**

Decrementa o estoque de produtos após uma compra.

```sql
decrement_stock(p_items: json) RETURNS boolean
```

**Parâmetro `p_items`:**
```json
[
  { "variant_id": "uuid", "quantity": 2 },
  { "variant_id": "uuid", "quantity": 1 }
]
```

---

## 🔐 Row Level Security (RLS)

O Supabase utiliza **Row Level Security** para proteger os dados. Políticas principais:

### **products**
- ✅ Leitura: Pública
- 🔒 Escrita: Apenas admins/managers

### **orders**
- ✅ Leitura: Próprio usuário ou admin
- 🔒 Criação: Usuário autenticado
- 🔒 Atualização: Apenas admins

### **profiles**
- ✅ Leitura: Próprio usuário ou admin
- 🔒 Atualização: Próprio usuário

---

## 📊 Migrações

As migrações estão localizadas em `supabase/migrations/`.

**Principais migrações:**
1. `20260126053556` - Schema inicial
2. `20260126054705` - Tabelas de produtos e categorias
3. `20260126060151` - Sistema de pedidos
4. `20260210044018` - Cupons e banners
5. `20260212042505` - Políticas RLS
6. `20260215045914` - Ajustes de schema

---

## 🔄 Relacionamentos

```
users (Supabase Auth)
  ├─→ profiles (1:1)
  ├─→ addresses (1:N)
  ├─→ favorites (1:N)
  ├─→ orders (1:N)
  └─→ user_roles (1:N)

products
  ├─→ product_variants (1:N)
  └─→ favorites (1:N)

orders
  └─→ order_items (1:N)
      └─→ products (N:1)
```

---

## 📝 Notas Importantes

1. **UUIDs**: Todas as PKs usam UUID v4
2. **Timestamps**: Todos em UTC com timezone
3. **Soft Deletes**: Não implementado (usar flags `is_active` quando necessário)
4. **Preços**: Armazenados em centavos (INTEGER) para evitar problemas de precisão
5. **Imagens**: URLs armazenadas como TEXT ou TEXT[]

---

**Última atualização:** 17/02/2026

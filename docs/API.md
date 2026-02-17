# 🔌 Documentação da API (Supabase)

## Visão Geral

Este documento descreve como interagir com o banco de dados **Supabase** no projeto **Happy Style Market**. Todas as operações são realizadas através do cliente Supabase.

---

## 🔧 Configuração do Cliente

**Localização:** `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
```

---

## 📦 Operações CRUD

### **Produtos**

#### **Listar Produtos**

```typescript
// Todos os produtos
const { data, error } = await supabase
  .from('products')
  .select('*');

// Com filtro de categoria
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category', 'Tênis');

// Com busca
const { data, error } = await supabase
  .from('products')
  .select('*')
  .ilike('title', '%nike%');

// Com ordenação
const { data, error } = await supabase
  .from('products')
  .select('*')
  .order('price', { ascending: true });

// Com paginação
const { data, error } = await supabase
  .from('products')
  .select('*')
  .range(0, 19); // Primeiros 20 produtos
```

---

#### **Buscar Produto por ID**

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .single();
```

---

#### **Buscar Produto por Slug**

```typescript
const { data, error } = await supabase
  .from('products')
  .select(`
    *,
    product_variants (*)
  `)
  .eq('slug', productSlug)
  .single();
```

---

#### **Criar Produto**

```typescript
const { data, error } = await supabase
  .from('products')
  .insert({
    title: 'Tênis Nike Air Max',
    slug: 'tenis-nike-air-max',
    category: 'Tênis',
    price: 39990,
    price_display: 'R$ 399,90',
    images: ['url1.jpg', 'url2.jpg'],
    description: 'Descrição do produto...'
  })
  .select()
  .single();
```

---

#### **Atualizar Produto**

```typescript
const { data, error } = await supabase
  .from('products')
  .update({
    price: 34990,
    price_display: 'R$ 349,90'
  })
  .eq('id', productId)
  .select()
  .single();
```

---

#### **Deletar Produto**

```typescript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
```

---

### **Pedidos (Orders)**

#### **Criar Pedido**

```typescript
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    status: 'pending',
    subtotal: 39990,
    shipping_cost: 1500,
    total: 41490,
    payment_method: 'pix',
    shipping_method: 'pac',
    shipping_address: {
      street: 'Rua Exemplo',
      number: '123',
      city: 'São Paulo',
      state: 'SP',
      cep: '01234-567'
    }
  })
  .select()
  .single();

// Adicionar itens do pedido
const { error: itemsError } = await supabase
  .from('order_items')
  .insert([
    {
      order_id: order.id,
      product_id: 'product-uuid',
      product_name: 'Tênis Nike Air Max',
      quantity: 1,
      unit_price: 39990
    }
  ]);
```

---

#### **Listar Pedidos do Usuário**

```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      *,
      products (*)
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

---

#### **Atualizar Status do Pedido**

```typescript
const { data, error } = await supabase
  .from('orders')
  .update({
    status: 'shipped',
    tracking_code: 'BR123456789'
  })
  .eq('id', orderId)
  .select()
  .single();
```

---

### **Favoritos**

#### **Adicionar aos Favoritos**

```typescript
const { data, error } = await supabase
  .from('favorites')
  .insert({
    user_id: userId,
    product_id: productId
  })
  .select()
  .single();
```

---

#### **Remover dos Favoritos**

```typescript
const { error } = await supabase
  .from('favorites')
  .delete()
  .eq('user_id', userId)
  .eq('product_id', productId);
```

---

#### **Listar Favoritos**

```typescript
const { data, error } = await supabase
  .from('favorites')
  .select(`
    *,
    products (*)
  `)
  .eq('user_id', userId);
```

---

### **Endereços**

#### **Criar Endereço**

```typescript
const { data, error } = await supabase
  .from('addresses')
  .insert({
    user_id: userId,
    label: 'Casa',
    cep: '01234-567',
    street: 'Rua Exemplo',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    is_default: true
  })
  .select()
  .single();
```

---

#### **Listar Endereços**

```typescript
const { data, error } = await supabase
  .from('addresses')
  .select('*')
  .eq('user_id', userId)
  .order('is_default', { ascending: false });
```

---

### **Categorias**

#### **Listar Categorias**

```typescript
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .order('name');
```

---

### **Banners**

#### **Listar Banners Ativos**

```typescript
const { data, error } = await supabase
  .from('banners')
  .select('*')
  .eq('is_active', true)
  .order('sort_order');
```

---

## 🔐 Autenticação

### **Registro de Usuário**

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'senha123',
  options: {
    data: {
      full_name: 'João Silva',
      phone: '11999999999'
    }
  }
});
```

---

### **Login**

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'senha123'
});
```

---

### **Logout**

```typescript
const { error } = await supabase.auth.signOut();
```

---

### **Obter Usuário Atual**

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

---

### **Verificar Role do Usuário**

```typescript
const { data, error } = await supabase.rpc('has_role', {
  _role: 'admin',
  _user_id: userId
});

// Retorna: true ou false
```

---

## 📊 Queries Avançadas

### **Join com Múltiplas Tabelas**

```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      *,
      products (
        *,
        product_variants (*)
      )
    ),
    profiles (
      full_name,
      phone
    )
  `)
  .eq('id', orderId)
  .single();
```

---

### **Agregações**

```typescript
// Contar produtos por categoria
const { data, error } = await supabase
  .from('products')
  .select('category', { count: 'exact' })
  .eq('category', 'Tênis');

// Total de vendas
const { data, error } = await supabase
  .from('orders')
  .select('total.sum()')
  .eq('status', 'delivered');
```

---

### **Busca Full-Text**

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .textSearch('title', 'nike air max');
```

---

## 🔄 Realtime (Subscriptions)

### **Escutar Mudanças em Produtos**

```typescript
const channel = supabase
  .channel('products-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'products'
    },
    (payload) => {
      console.log('Produto alterado:', payload);
      // Atualizar UI
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

---

### **Escutar Novos Pedidos**

```typescript
const channel = supabase
  .channel('new-orders')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'orders'
    },
    (payload) => {
      console.log('Novo pedido:', payload.new);
      // Notificar admin
    }
  )
  .subscribe();
```

---

## 📤 Upload de Arquivos (Storage)

### **Upload de Imagem**

```typescript
const file = event.target.files[0];

const { data, error } = await supabase.storage
  .from('products')
  .upload(`${productId}/${file.name}`, file, {
    cacheControl: '3600',
    upsert: false
  });

// Obter URL pública
const { data: { publicUrl } } = supabase.storage
  .from('products')
  .getPublicUrl(data.path);
```

---

### **Deletar Imagem**

```typescript
const { error } = await supabase.storage
  .from('products')
  .remove([`${productId}/image.jpg`]);
```

---

## 🔒 Row Level Security (RLS)

### **Políticas Implementadas**

#### **Produtos**
- ✅ **SELECT**: Público (qualquer um pode ler)
- 🔒 **INSERT/UPDATE/DELETE**: Apenas admins/managers

#### **Orders**
- ✅ **SELECT**: Próprio usuário ou admin
- ✅ **INSERT**: Usuário autenticado
- 🔒 **UPDATE/DELETE**: Apenas admins

#### **Favorites**
- ✅ **SELECT**: Próprio usuário
- ✅ **INSERT/DELETE**: Próprio usuário

---

## ⚡ Performance

### **1. Use Select Específico**

```typescript
// ❌ RUIM - Busca tudo
const { data } = await supabase
  .from('products')
  .select('*');

// ✅ BOM - Busca apenas o necessário
const { data } = await supabase
  .from('products')
  .select('id, title, price, images');
```

---

### **2. Use Índices**

Certifique-se de que colunas frequentemente filtradas tenham índices:

```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
```

---

### **3. Paginação**

Sempre use paginação para grandes conjuntos de dados:

```typescript
const pageSize = 20;
const page = 1;

const { data } = await supabase
  .from('products')
  .select('*')
  .range((page - 1) * pageSize, page * pageSize - 1);
```

---

### **4. Cache com React Query**

```typescript
import { useQuery } from '@tanstack/react-query';

function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```

---

## 🐛 Tratamento de Erros

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*');

if (error) {
  console.error('Erro ao buscar produtos:', error);
  
  // Tratar erro específico
  if (error.code === 'PGRST116') {
    // Nenhum resultado encontrado
  }
  
  throw error;
}

// Usar data com segurança
console.log(data);
```

---

## 📚 Recursos Adicionais

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Última atualização:** 17/02/2026

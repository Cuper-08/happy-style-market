# 🪝 Documentação de Custom Hooks

## Visão Geral

Este documento descreve todos os **custom hooks** do projeto **Happy Style Market**. Hooks encapsulam lógica reutilizável e facilitam o gerenciamento de estado e efeitos colaterais.

---

## 📁 Estrutura de Hooks

```
src/hooks/
├── admin/              # Hooks administrativos
├── useAuth.tsx         # Autenticação
├── useCart.ts          # Carrinho de compras
├── useFavorites.ts     # Favoritos
├── useProducts.ts      # Produtos
├── usePWA.ts           # PWA
├── use-mobile.tsx      # Detecção mobile
├── use-toast.ts        # Notificações
└── useInView.ts        # Intersection Observer
```

---

## 🔐 useAuth

**Localização:** `src/hooks/useAuth.tsx`

Hook para gerenciamento de autenticação de usuários.

### **Retorno**

```tsx
interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}
```

### **Uso**

```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, isAdmin, signIn, signOut } = useAuth();

  const handleLogin = async () => {
    await signIn("email@example.com", "password123");
  };

  return (
    <div>
      {user ? (
        <>
          <p>Olá, {user.email}</p>
          {isAdmin && <AdminPanel />}
          <button onClick={signOut}>Sair</button>
        </>
      ) : (
        <button onClick={handleLogin}>Entrar</button>
      )}
    </div>
  );
}
```

### **Funcionalidades**

- ✅ Login/Logout
- ✅ Registro de novos usuários
- ✅ Verificação de roles (admin/manager)
- ✅ Atualização de perfil
- ✅ Persistência de sessão
- ✅ Loading states

---

## 🛒 useCart

**Localização:** `src/hooks/useCart.ts`

Hook para gerenciamento do carrinho de compras.

### **Retorno**

```tsx
interface UseCartReturn {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, variantId?: string) => boolean;
}
```

### **Uso**

```tsx
import { useCart } from "@/hooks/useCart";

function ProductCard({ product }: { product: Product }) {
  const { addItem, isInCart } = useCart();

  const handleAddToCart = () => {
    addItem(product, undefined, 1);
    toast.success("Produto adicionado ao carrinho!");
  };

  return (
    <div>
      <h3>{product.title}</h3>
      <p>{product.price_display}</p>
      <button 
        onClick={handleAddToCart}
        disabled={isInCart(product.id)}
      >
        {isInCart(product.id) ? "No Carrinho" : "Adicionar"}
      </button>
    </div>
  );
}
```

### **Funcionalidades**

- ✅ Adicionar produtos ao carrinho
- ✅ Remover produtos
- ✅ Atualizar quantidade
- ✅ Limpar carrinho
- ✅ Verificar se produto está no carrinho
- ✅ Cálculo automático de totais
- ✅ Persistência no localStorage

---

## ❤️ useFavorites

**Localização:** `src/hooks/useFavorites.ts`

Hook para gerenciamento de produtos favoritos.

### **Retorno**

```tsx
interface UseFavoritesReturn {
  favorites: Product[];
  isLoading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
}
```

### **Uso**

```tsx
import { useFavorites } from "@/hooks/useFavorites";

function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div>
      <h3>{product.title}</h3>
      <button onClick={() => toggleFavorite(product.id)}>
        {isFavorite(product.id) ? "❤️ Favoritado" : "🤍 Favoritar"}
      </button>
    </div>
  );
}
```

### **Funcionalidades**

- ✅ Adicionar/remover favoritos
- ✅ Verificar se produto é favorito
- ✅ Sincronização com Supabase
- ✅ Requer autenticação

---

## 📦 useProducts

**Localização:** `src/hooks/useProducts.ts`

Hook para buscar e filtrar produtos.

### **Retorno**

```tsx
interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### **Parâmetros**

```tsx
interface UseProductsParams {
  category?: string;
  search?: string;
  limit?: number;
  sortBy?: "price_asc" | "price_desc" | "newest";
}
```

### **Uso**

```tsx
import { useProducts } from "@/hooks/useProducts";

function ProductsPage() {
  const { products, isLoading, error } = useProducts({
    category: "tenis",
    sortBy: "price_asc",
    limit: 20
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### **Funcionalidades**

- ✅ Busca de produtos
- ✅ Filtros (categoria, busca)
- ✅ Ordenação
- ✅ Paginação
- ✅ Cache com React Query

---

## 📱 usePWA

**Localização:** `src/hooks/usePWA.ts`

Hook para funcionalidades PWA (Progressive Web App).

### **Retorno**

```tsx
interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  promptInstall: () => Promise<void>;
  dismissInstallPrompt: () => void;
}
```

### **Uso**

```tsx
import { usePWA } from "@/hooks/usePWA";

function InstallBanner() {
  const { isInstallable, promptInstall, dismissInstallPrompt } = usePWA();

  if (!isInstallable) return null;

  return (
    <div className="install-banner">
      <p>Instale nosso app para uma melhor experiência!</p>
      <button onClick={promptInstall}>Instalar</button>
      <button onClick={dismissInstallPrompt}>Agora não</button>
    </div>
  );
}
```

### **Funcionalidades**

- ✅ Detecta se o app pode ser instalado
- ✅ Prompt de instalação
- ✅ Detecta se já está instalado
- ✅ Monitora status online/offline

---

## 📱 useMobile

**Localização:** `src/hooks/use-mobile.tsx`

Hook para detectar se o dispositivo é mobile.

### **Retorno**

```tsx
boolean // true se mobile, false se desktop
```

### **Uso**

```tsx
import { useMobile } from "@/hooks/use-mobile";

function ResponsiveComponent() {
  const isMobile = useMobile();

  return (
    <div>
      {isMobile ? (
        <MobileMenu />
      ) : (
        <DesktopMenu />
      )}
    </div>
  );
}
```

### **Breakpoint**

- Mobile: `< 768px`
- Desktop: `>= 768px`

---

## 🔔 useToast

**Localização:** `src/hooks/use-toast.ts`

Hook para exibir notificações toast.

### **Retorno**

```tsx
interface UseToastReturn {
  toast: (options: ToastOptions) => void;
  toasts: Toast[];
  dismiss: (toastId: string) => void;
}
```

### **Uso**

```tsx
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Sucesso!",
      description: "Produto adicionado ao carrinho",
      variant: "success"
    });
  };

  const handleError = () => {
    toast({
      title: "Erro",
      description: "Não foi possível adicionar o produto",
      variant: "destructive"
    });
  };

  return (
    <>
      <button onClick={handleSuccess}>Sucesso</button>
      <button onClick={handleError}>Erro</button>
    </>
  );
}
```

### **Variantes**

- `default` - Toast padrão
- `success` - Toast de sucesso (verde)
- `destructive` - Toast de erro (vermelho)
- `warning` - Toast de aviso (amarelo)

---

## 👁️ useInView

**Localização:** `src/hooks/useInView.ts`

Hook para detectar quando um elemento entra na viewport (Intersection Observer).

### **Retorno**

```tsx
interface UseInViewReturn {
  ref: RefObject<HTMLElement>;
  isInView: boolean;
}
```

### **Uso**

```tsx
import { useInView } from "@/hooks/useInView";

function LazyImage({ src }: { src: string }) {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref}>
      {isInView ? (
        <img src={src} alt="Lazy loaded" />
      ) : (
        <div className="skeleton" />
      )}
    </div>
  );
}
```

### **Funcionalidades**

- ✅ Lazy loading de imagens
- ✅ Animações ao scroll
- ✅ Infinite scroll
- ✅ Performance otimizada

---

## ⚙️ Hooks Administrativos

### **useOrders**

**Localização:** `src/hooks/admin/useOrders.ts`

Gerenciamento de pedidos no painel admin.

```tsx
const { orders, updateOrderStatus, isLoading } = useOrders();
```

---

### **useCategories**

**Localização:** `src/hooks/admin/useCategories.ts`

CRUD de categorias.

```tsx
const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
```

---

### **useBrands**

**Localização:** `src/hooks/admin/useBrands.ts`

CRUD de marcas.

```tsx
const { brands, createBrand, updateBrand, deleteBrand } = useBrands();
```

---

### **useBanners**

**Localização:** `src/hooks/admin/useBanners.ts`

Gerenciamento de banners promocionais.

```tsx
const { banners, createBanner, updateBanner, deleteBanner } = useBanners();
```

---

### **useStats**

**Localização:** `src/hooks/admin/useStats.ts`

Estatísticas do dashboard.

```tsx
const { stats, isLoading } = useStats();

// stats = {
//   totalSales: 12450.00,
//   totalOrders: 156,
//   totalCustomers: 89,
//   conversionRate: 3.2
// }
```

---

## 🎯 Boas Práticas

### **1. Nomenclatura**

- Sempre prefixe com `use`
- Nome descritivo e claro
- camelCase

```tsx
✅ useAuth
✅ useProducts
✅ useFavorites

❌ auth
❌ getProducts
❌ FavoritesHook
```

---

### **2. Retorno Consistente**

Sempre retorne um objeto com propriedades nomeadas:

```tsx
// ✅ BOM
function useProducts() {
  return { products, isLoading, error };
}

// ❌ RUIM
function useProducts() {
  return [products, isLoading, error]; // confuso
}
```

---

### **3. Loading e Error States**

Sempre inclua estados de loading e erro:

```tsx
function useMyData() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... lógica

  return { data, isLoading, error };
}
```

---

### **4. Cleanup**

Sempre limpe efeitos colaterais:

```tsx
useEffect(() => {
  const subscription = supabase
    .channel('products')
    .on('postgres_changes', handleChange)
    .subscribe();

  return () => {
    subscription.unsubscribe(); // ✅ Cleanup
  };
}, []);
```

---

### **5. Dependências**

Sempre declare todas as dependências no array de dependências:

```tsx
useEffect(() => {
  fetchData(userId, productId);
}, [userId, productId]); // ✅ Todas as deps
```

---

## 📚 Recursos Adicionais

- [React Hooks Docs](https://react.dev/reference/react)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Supabase React Docs](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

---

**Última atualização:** 17/02/2026

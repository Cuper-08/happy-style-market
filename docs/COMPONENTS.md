# 🧩 Documentação de Componentes

## Visão Geral

Este documento descreve todos os componentes React do projeto **Happy Style Market**, organizados por categoria e funcionalidade.

---

## 📁 Estrutura de Componentes

```
src/components/
├── ui/              # Componentes shadcn/ui (primitivos)
├── layout/          # Componentes de layout
├── home/            # Componentes da home page
├── product/         # Componentes relacionados a produtos
├── admin/           # Componentes do painel administrativo
└── pwa/             # Componentes PWA
```

---

## 🎨 Componentes UI (shadcn/ui)

Componentes base construídos com **Radix UI** e estilizados com **Tailwind CSS**.

### **Componentes Disponíveis**

| Componente | Descrição | Importação |
|------------|-----------|------------|
| `Button` | Botão com variantes | `@/components/ui/button` |
| `Input` | Campo de entrada de texto | `@/components/ui/input` |
| `Card` | Container de conteúdo | `@/components/ui/card` |
| `Dialog` | Modal/Dialog | `@/components/ui/dialog` |
| `Dropdown Menu` | Menu dropdown | `@/components/ui/dropdown-menu` |
| `Select` | Seletor customizado | `@/components/ui/select` |
| `Tabs` | Navegação por abas | `@/components/ui/tabs` |
| `Toast` | Notificações | `@/components/ui/toast` |
| `Tooltip` | Dicas de contexto | `@/components/ui/tooltip` |
| `Badge` | Etiquetas/Tags | `@/components/ui/badge` |
| `Avatar` | Avatar de usuário | `@/components/ui/avatar` |
| `Checkbox` | Caixa de seleção | `@/components/ui/checkbox` |
| `Radio Group` | Grupo de opções | `@/components/ui/radio-group` |
| `Switch` | Interruptor on/off | `@/components/ui/switch` |
| `Slider` | Controle deslizante | `@/components/ui/slider` |
| `Progress` | Barra de progresso | `@/components/ui/progress` |
| `Separator` | Divisor visual | `@/components/ui/separator` |
| `Accordion` | Conteúdo expansível | `@/components/ui/accordion` |
| `Alert Dialog` | Diálogo de confirmação | `@/components/ui/alert-dialog` |
| `Carousel` | Carrossel de imagens | `@/components/ui/carousel` |

### **Exemplo de Uso**

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Clique aqui</Button>
      </CardContent>
    </Card>
  );
}
```

---

## 🏗️ Componentes de Layout

### **1. Header**

**Localização:** `src/components/layout/Header.tsx`

Cabeçalho principal do site com navegação, busca e carrinho.

**Props:**
- Nenhuma (usa contextos globais)

**Funcionalidades:**
- Logo da loja
- Menu de navegação
- Barra de busca
- Ícone do carrinho com contador
- Menu de usuário (login/perfil)
- Tema switcher (dark/light)

**Exemplo:**
```tsx
import Header from "@/components/layout/Header";

<Header />
```

---

### **2. Footer**

**Localização:** `src/components/layout/Footer.tsx`

Rodapé com links úteis e informações da loja.

**Seções:**
- Informações da empresa
- Links rápidos
- Redes sociais
- Formas de pagamento
- Copyright

---

### **3. Sidebar (Admin)**

**Localização:** `src/components/layout/AdminSidebar.tsx`

Menu lateral do painel administrativo.

**Itens do menu:**
- Dashboard
- Pedidos
- Produtos
- Categorias
- Marcas
- Banners
- Clientes
- Relatórios
- Configurações

---

## 🏠 Componentes da Home Page

### **1. HeroSection**

**Localização:** `src/components/home/HeroSection.tsx`

Seção hero com carrossel de banners promocionais.

**Props:**
```tsx
interface HeroSectionProps {
  banners: Banner[];
}
```

**Funcionalidades:**
- Carrossel automático
- Navegação por dots
- Botões CTA
- Responsivo

---

### **2. FeaturedProducts**

**Localização:** `src/components/home/FeaturedProducts.tsx`

Grid de produtos em destaque.

**Props:**
```tsx
interface FeaturedProductsProps {
  products: Product[];
  title?: string;
}
```

---

### **3. CategoryGrid**

**Localização:** `src/components/home/CategoryGrid.tsx`

Grid de categorias com imagens.

**Props:**
```tsx
interface CategoryGridProps {
  categories: Category[];
}
```

---

## 🛍️ Componentes de Produtos

### **1. ProductCard**

**Localização:** `src/components/product/ProductCard.tsx`

Card de produto para listagens.

**Props:**
```tsx
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (productId: string) => void;
}
```

**Funcionalidades:**
- Imagem do produto
- Título e preço
- Badge de desconto
- Botão de favoritar
- Botão de adicionar ao carrinho
- Link para página de detalhes

**Exemplo:**
```tsx
<ProductCard 
  product={product}
  onAddToCart={handleAddToCart}
  onToggleFavorite={handleToggleFavorite}
/>
```

---

### **2. ProductGallery**

**Localização:** `src/components/product/ProductGallery.tsx`

Galeria de imagens do produto com zoom.

**Props:**
```tsx
interface ProductGalleryProps {
  images: string[];
  productName: string;
}
```

**Funcionalidades:**
- Imagem principal
- Miniaturas clicáveis
- Navegação por setas
- Zoom ao passar o mouse

---

### **3. ProductFilters**

**Localização:** `src/components/product/ProductFilters.tsx`

Filtros de produtos (categoria, preço, marca, etc).

**Props:**
```tsx
interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  onFilterChange: (filters: FilterState) => void;
}
```

**Filtros disponíveis:**
- Categoria
- Faixa de preço
- Marca
- Ordenação (mais vendidos, menor preço, etc)

---

### **4. SizeSelector**

**Localização:** `src/components/product/SizeSelector.tsx`

Seletor de tamanho do produto.

**Props:**
```tsx
interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedSize?: string;
  onSizeChange: (size: string) => void;
}
```

---

## 🛒 Componentes do Carrinho

### **1. CartItem**

**Localização:** `src/components/cart/CartItem.tsx`

Item individual no carrinho.

**Props:**
```tsx
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}
```

**Funcionalidades:**
- Imagem do produto
- Nome e variante
- Controle de quantidade (+/-)
- Preço unitário e total
- Botão de remover

---

### **2. CartSummary**

**Localização:** `src/components/cart/CartSummary.tsx`

Resumo do carrinho com totais.

**Props:**
```tsx
interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}
```

---

## 👤 Componentes de Conta

### **1. OrderCard**

**Localização:** `src/components/account/OrderCard.tsx`

Card de pedido na lista de pedidos do usuário.

**Props:**
```tsx
interface OrderCardProps {
  order: Order;
  onViewDetails: (orderId: string) => void;
}
```

**Informações exibidas:**
- Número do pedido
- Data
- Status
- Total
- Itens (resumo)

---

### **2. AddressCard**

**Localização:** `src/components/account/AddressCard.tsx`

Card de endereço salvo.

**Props:**
```tsx
interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}
```

---

## ⚙️ Componentes Administrativos

### **1. StatsCard**

**Localização:** `src/components/admin/StatsCard.tsx`

Card de estatística no dashboard.

**Props:**
```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}
```

**Exemplo:**
```tsx
<StatsCard
  title="Vendas do Mês"
  value="R$ 12.450,00"
  icon={DollarSign}
  trend={{ value: 12.5, isPositive: true }}
/>
```

---

### **2. DataTable**

**Localização:** `src/components/admin/DataTable.tsx`

Tabela de dados com paginação e ordenação.

**Props:**
```tsx
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}
```

**Funcionalidades:**
- Ordenação por coluna
- Paginação
- Busca
- Ações em linha

---

### **3. ProductForm**

**Localização:** `src/components/admin/ProductForm.tsx`

Formulário de criação/edição de produtos.

**Props:**
```tsx
interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}
```

**Campos:**
- Título
- Descrição
- Categoria
- Marca
- Preço
- Preço de varejo
- Imagens (upload)
- Variantes (tamanhos)

---

## 📱 Componentes PWA

### **1. InstallBanner**

**Localização:** `src/components/pwa/InstallBanner.tsx`

Banner de instalação do PWA.

**Funcionalidades:**
- Detecta se o app pode ser instalado
- Mostra banner com botão de instalação
- Pode ser fechado pelo usuário
- Não aparece se já instalado

---

### **2. OfflineIndicator**

**Localização:** `src/components/pwa/OfflineIndicator.tsx`

Indicador de status offline.

**Funcionalidades:**
- Detecta perda de conexão
- Mostra banner informativo
- Desaparece ao reconectar

---

## 🔧 Componentes Utilitários

### **1. ScrollToTop**

**Localização:** `src/components/ScrollToTop.tsx`

Scroll automático ao topo ao mudar de página.

```tsx
import { ScrollToTop } from "@/components/ScrollToTop";

<BrowserRouter>
  <ScrollToTop />
  <Routes>...</Routes>
</BrowserRouter>
```

---

### **2. LoadingSpinner**

**Localização:** `src/components/LoadingSpinner.tsx`

Spinner de carregamento.

**Props:**
```tsx
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

---

### **3. EmptyState**

**Localização:** `src/components/EmptyState.tsx`

Estado vazio (sem dados).

**Props:**
```tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## 🎯 Boas Práticas

### **1. Componentização**

- ✅ Componentes pequenos e focados
- ✅ Props bem tipadas com TypeScript
- ✅ Reutilização máxima
- ❌ Evitar componentes gigantes

### **2. Nomenclatura**

- PascalCase para componentes
- camelCase para props
- Nomes descritivos e claros

### **3. Performance**

- Use `React.memo()` para componentes pesados
- Use `useMemo()` e `useCallback()` quando apropriado
- Lazy loading de componentes grandes

```tsx
const AdminPanel = lazy(() => import("@/components/admin/AdminPanel"));
```

### **4. Acessibilidade**

- Sempre use labels em inputs
- ARIA attributes quando necessário
- Navegação por teclado
- Contraste adequado

---

## 📚 Recursos Adicionais

- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Radix UI Docs](https://www.radix-ui.com/)
- [React Docs](https://react.dev/)

---

**Última atualização:** 17/02/2026

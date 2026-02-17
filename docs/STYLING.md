# 🎨 Guia de Estilização

## Visão Geral

Este documento descreve os padrões de estilização utilizados no **Happy Style Market**, incluindo o uso de **Tailwind CSS**, **shadcn/ui** e boas práticas de design.

---

## 🎨 Sistema de Design

### **Paleta de Cores**

O projeto utiliza um sistema de cores baseado em variáveis CSS, permitindo fácil alternância entre temas claro e escuro.

#### **Cores Principais**

```css
/* Light Mode */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;

--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;

--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;

--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;

--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;

/* Dark Mode */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;

--primary: 210 40% 98%;
--primary-foreground: 222.2 47.4% 11.2%;
```

#### **Uso das Cores**

```tsx
// Background principal
<div className="bg-background text-foreground">

// Botão primário
<button className="bg-primary text-primary-foreground">

// Card com borda
<div className="bg-card text-card-foreground border border-border">

// Texto muted (secundário)
<p className="text-muted-foreground">
```

---

### **Tipografia**

#### **Fontes**

```css
/* Font Family */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

#### **Tamanhos de Fonte**

| Classe | Tamanho | Uso |
|--------|---------|-----|
| `text-xs` | 0.75rem | Legendas, badges |
| `text-sm` | 0.875rem | Texto secundário |
| `text-base` | 1rem | Texto padrão |
| `text-lg` | 1.125rem | Subtítulos |
| `text-xl` | 1.25rem | Títulos pequenos |
| `text-2xl` | 1.5rem | Títulos médios |
| `text-3xl` | 1.875rem | Títulos grandes |
| `text-4xl` | 2.25rem | Hero titles |

#### **Pesos de Fonte**

```tsx
<p className="font-light">Texto leve (300)</p>
<p className="font-normal">Texto normal (400)</p>
<p className="font-medium">Texto médio (500)</p>
<p className="font-semibold">Texto semi-bold (600)</p>
<p className="font-bold">Texto bold (700)</p>
```

---

### **Espaçamento**

Use a escala de espaçamento do Tailwind:

| Classe | Valor | Uso |
|--------|-------|-----|
| `p-1` | 0.25rem | Padding mínimo |
| `p-2` | 0.5rem | Padding pequeno |
| `p-4` | 1rem | Padding padrão |
| `p-6` | 1.5rem | Padding médio |
| `p-8` | 2rem | Padding grande |
| `p-12` | 3rem | Padding extra grande |

```tsx
// Padding uniforme
<div className="p-4">

// Padding horizontal/vertical
<div className="px-6 py-4">

// Margin
<div className="mt-4 mb-8">

// Gap em grids/flex
<div className="flex gap-4">
```

---

### **Bordas e Sombras**

#### **Border Radius**

```tsx
<div className="rounded-none">   {/* 0 */}
<div className="rounded-sm">     {/* 0.125rem */}
<div className="rounded">        {/* 0.25rem */}
<div className="rounded-md">     {/* 0.375rem */}
<div className="rounded-lg">     {/* 0.5rem */}
<div className="rounded-xl">     {/* 0.75rem */}
<div className="rounded-2xl">    {/* 1rem */}
<div className="rounded-full">   {/* 9999px */}
```

#### **Sombras**

```tsx
<div className="shadow-sm">      {/* Sombra sutil */}
<div className="shadow">         {/* Sombra padrão */}
<div className="shadow-md">      {/* Sombra média */}
<div className="shadow-lg">      {/* Sombra grande */}
<div className="shadow-xl">      {/* Sombra extra grande */}
```

---

## 🧩 Componentes shadcn/ui

### **Variantes de Botões**

```tsx
import { Button } from "@/components/ui/button";

// Variantes
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Tamanhos
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

---

### **Cards**

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Conteúdo do card</p>
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

---

### **Inputs**

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="seu@email.com"
  />
</div>
```

---

## 📱 Responsividade

### **Breakpoints**

| Breakpoint | Tamanho | Classe |
|------------|---------|--------|
| `sm` | 640px | `sm:` |
| `md` | 768px | `md:` |
| `lg` | 1024px | `lg:` |
| `xl` | 1280px | `xl:` |
| `2xl` | 1536px | `2xl:` |

### **Exemplos**

```tsx
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Padding responsivo
<div className="p-4 md:p-6 lg:p-8">

// Texto responsivo
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Esconder em mobile
<div className="hidden md:block">

// Mostrar apenas em mobile
<div className="block md:hidden">
```

---

## 🎭 Animações

### **Framer Motion**

```tsx
import { motion } from "framer-motion";

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Conteúdo
</motion.div>

// Slide in
<motion.div
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Conteúdo
</motion.div>

// Scale on hover
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Clique aqui
</motion.button>
```

---

### **Tailwind Transitions**

```tsx
// Transição suave
<button className="transition-all duration-300 hover:bg-primary">

// Transição de cores
<div className="transition-colors hover:text-primary">

// Transição de transform
<div className="transition-transform hover:scale-105">
```

---

## 🎨 Utilitários Customizados

### **cn() Helper**

Combina classes condicionalmente:

```tsx
import { cn } from "@/lib/utils";

<button
  className={cn(
    "px-4 py-2 rounded-lg",
    isActive && "bg-primary text-white",
    isDisabled && "opacity-50 cursor-not-allowed",
    className // Props externas
  )}
>
  Botão
</button>
```

---

### **formatPrice()**

Formata valores monetários:

```tsx
import { formatPrice } from "@/lib/utils";

const price = formatPrice(39990); // "R$ 399,90"
```

---

## 🌓 Dark Mode

### **Implementação**

O tema é gerenciado pelo `ThemeContext`:

```tsx
import { useTheme } from "@/contexts/ThemeContext";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
}
```

---

### **Classes Específicas de Tema**

```tsx
// Cor diferente por tema
<div className="bg-white dark:bg-gray-900">

// Texto
<p className="text-gray-900 dark:text-gray-100">

// Borda
<div className="border-gray-200 dark:border-gray-800">
```

---

## 📐 Layouts Comuns

### **Container Centralizado**

```tsx
<div className="container mx-auto px-4 max-w-7xl">
  {/* Conteúdo */}
</div>
```

---

### **Grid de Produtos**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

---

### **Flex Center**

```tsx
<div className="flex items-center justify-center min-h-screen">
  <div>Conteúdo centralizado</div>
</div>
```

---

### **Stack Vertical**

```tsx
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

## 🎯 Boas Práticas

### **1. Use Classes Utilitárias**

```tsx
// ✅ BOM
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">

// ❌ RUIM - CSS customizado desnecessário
<button className="custom-button">
```

---

### **2. Evite !important**

```tsx
// ✅ BOM - Use especificidade
<div className="bg-primary hover:bg-primary/90">

// ❌ RUIM
<div className="!bg-primary">
```

---

### **3. Componentes Reutilizáveis**

```tsx
// ✅ BOM - Componente reutilizável
function PrimaryButton({ children, ...props }) {
  return (
    <Button 
      className="bg-primary text-white hover:bg-primary/90"
      {...props}
    >
      {children}
    </Button>
  );
}

// ❌ RUIM - Repetir classes
<button className="bg-primary text-white hover:bg-primary/90">Botão 1</button>
<button className="bg-primary text-white hover:bg-primary/90">Botão 2</button>
```

---

### **4. Mobile First**

```tsx
// ✅ BOM - Mobile first
<div className="text-sm md:text-base lg:text-lg">

// ❌ RUIM - Desktop first
<div className="text-lg md:text-base sm:text-sm">
```

---

## 📚 Recursos

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Radix UI Docs](https://www.radix-ui.com/)

---

**Última atualização:** 17/02/2026

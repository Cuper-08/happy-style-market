import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import FavoritesPage from "./pages/FavoritesPage";
import InstallPage from "./pages/InstallPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import {
  DashboardPage,
  OrdersPage,
  OrderDetailPage,
  ProductsPage as AdminProductsPage,
  ProductFormPage,
  CategoriesPage,
  BrandsPage,
  CustomersPage,
  SettingsPage,
  ReportsPage,
} from "./pages/admin";

// PWA Components
import { InstallBanner } from "./components/pwa/InstallBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Store Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/produtos" element={<ProductsPage />} />
                <Route path="/categoria/:categorySlug" element={<ProductsPage />} />
                <Route path="/produto/:slug" element={<ProductDetailPage />} />
                <Route path="/carrinho" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<RegisterPage />} />
                <Route path="/minha-conta" element={<AccountPage />} />
                <Route path="/minha-conta/favoritos" element={<FavoritesPage />} />
                <Route path="/minha-conta/pedidos" element={<AccountPage />} />
                <Route path="/minha-conta/enderecos" element={<AccountPage />} />
                <Route path="/minha-conta/perfil" element={<AccountPage />} />
                <Route path="/instalar" element={<InstallPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/pedidos" element={<OrdersPage />} />
                <Route path="/admin/pedidos/:id" element={<OrderDetailPage />} />
                <Route path="/admin/produtos" element={<AdminProductsPage />} />
                <Route path="/admin/produtos/novo" element={<ProductFormPage />} />
                <Route path="/admin/produtos/:id" element={<ProductFormPage />} />
                <Route path="/admin/categorias" element={<CategoriesPage />} />
                <Route path="/admin/marcas" element={<BrandsPage />} />
                <Route path="/admin/clientes" element={<CustomersPage />} />
                <Route path="/admin/configuracoes" element={<SettingsPage />} />
                <Route path="/admin/relatorios" element={<ReportsPage />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <InstallBanner />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

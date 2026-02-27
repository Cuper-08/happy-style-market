import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";

// Eager: critical path
import HomePage from "./pages/HomePage";

// Lazy: store pages
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const AccountOrdersPage = lazy(() => import("./pages/account/OrdersPage"));
const AccountAddressesPage = lazy(() => import("./pages/account/AddressesPage"));
const AccountProfilePage = lazy(() => import("./pages/account/ProfilePage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy: institutional pages
const DeliveryPage = lazy(() => import("./pages/institutional/DeliveryPage"));
const FaqPage = lazy(() => import("./pages/institutional/FaqPage"));
const HowToBuyPage = lazy(() => import("./pages/institutional/HowToBuyPage"));
const ContactPage = lazy(() => import("./pages/institutional/ContactPage"));
const TermsPage = lazy(() => import("./pages/institutional/TermsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/institutional/PrivacyPolicyPage"));
const ExchangePolicyPage = lazy(() => import("./pages/institutional/ExchangePolicyPage"));
const ShippingPolicyPage = lazy(() => import("./pages/institutional/ShippingPolicyPage"));

// Lazy: admin pages
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const OrdersPage = lazy(() => import("./pages/admin/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/admin/OrderDetailPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/ProductsPage"));
const ProductFormPage = lazy(() => import("./pages/admin/ProductFormPage"));
const CategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));
const BrandsPage = lazy(() => import("./pages/admin/BrandsPage"));
const BannersPage = lazy(() => import("./pages/admin/BannersPage"));
const CustomersPage = lazy(() => import("./pages/admin/CustomersPage"));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage"));

// PWA Components
import { InstallBanner } from "./components/pwa/InstallBanner";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
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
                  <Route path="/minha-conta/pedidos" element={<AccountOrdersPage />} />
                  <Route path="/minha-conta/enderecos" element={<AccountAddressesPage />} />
                  <Route path="/minha-conta/perfil" element={<AccountProfilePage />} />
                  <Route path="/instalar" element={<InstallPage />} />
                  
                  {/* Institutional Routes */}
                  <Route path="/prazos-e-entregas" element={<DeliveryPage />} />
                  <Route path="/perguntas-frequentes" element={<FaqPage />} />
                  <Route path="/como-comprar" element={<HowToBuyPage />} />
                  <Route path="/contato" element={<ContactPage />} />
                  <Route path="/termos" element={<TermsPage />} />
                  <Route path="/politica-privacidade" element={<PrivacyPolicyPage />} />
                  <Route path="/politica-trocas" element={<ExchangePolicyPage />} />
                  <Route path="/politica-frete" element={<ShippingPolicyPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<DashboardPage />} />
                  <Route path="/admin/pedidos" element={<OrdersPage />} />
                  <Route path="/admin/pedidos/:id" element={<OrderDetailPage />} />
                  <Route path="/admin/produtos" element={<AdminProductsPage />} />
                  <Route path="/admin/produtos/novo" element={<ProductFormPage />} />
                  <Route path="/admin/produtos/:id" element={<ProductFormPage />} />
                  <Route path="/admin/categorias" element={<CategoriesPage />} />
                  <Route path="/admin/marcas" element={<BrandsPage />} />
                  <Route path="/admin/banners" element={<BannersPage />} />
                  <Route path="/admin/clientes" element={<CustomersPage />} />
                  <Route path="/admin/configuracoes" element={<SettingsPage />} />
                  <Route path="/admin/relatorios" element={<ReportsPage />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <InstallBanner />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

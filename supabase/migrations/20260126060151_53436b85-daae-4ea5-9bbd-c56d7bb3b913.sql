-- =============================================
-- FASE 1: Sistema de Roles e Permissões
-- =============================================

-- Enum para tipos de role
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');

-- Tabela de roles (separada do profiles por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função segura para verificar role (evita recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para verificar se é admin ou manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'manager')
  )
$$;

-- Policies para user_roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- FASE 2: Configurações da Loja
-- =============================================

CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT DEFAULT 'Brás Conceito',
  cnpj TEXT,
  address JSONB,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  logo_url TEXT,
  banner_url TEXT,
  exchange_policy TEXT,
  privacy_policy TEXT,
  terms_of_service TEXT,
  shipping_config JSONB DEFAULT '{"free_shipping_min": 299, "default_shipping": 15}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store settings are publicly readable"
  ON public.store_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update store settings"
  ON public.store_settings FOR UPDATE
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can insert store settings"
  ON public.store_settings FOR INSERT
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Inserir configuração inicial
INSERT INTO public.store_settings (company_name) VALUES ('Brás Conceito');

-- =============================================
-- FASE 3: Cupons de Desconto
-- =============================================

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value NUMERIC NOT NULL,
  min_order_value NUMERIC,
  max_discount NUMERIC,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active coupons are publicly readable"
  ON public.coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin_or_manager(auth.uid()));

-- =============================================
-- FASE 4: Tipo de Cliente no Profile
-- =============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'retail' 
CHECK (customer_type IN ('retail', 'wholesale'));

-- =============================================
-- FASE 5: Atualizar RLS para Admins
-- =============================================

-- Products: Admins podem gerenciar
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin_or_manager(auth.uid()));

-- Categories: Admins podem gerenciar
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin_or_manager(auth.uid()));

-- Brands: Admins podem gerenciar
CREATE POLICY "Admins can insert brands"
  ON public.brands FOR INSERT
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update brands"
  ON public.brands FOR UPDATE
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete brands"
  ON public.brands FOR DELETE
  USING (public.is_admin_or_manager(auth.uid()));

-- Product Variants: Admins podem gerenciar
CREATE POLICY "Admins can insert variants"
  ON public.product_variants FOR INSERT
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update variants"
  ON public.product_variants FOR UPDATE
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete variants"
  ON public.product_variants FOR DELETE
  USING (public.is_admin_or_manager(auth.uid()));

-- Orders: Admins podem ver todos e atualizar
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin_or_manager(auth.uid()));

-- Order Items: Admins podem gerenciar
CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Profiles: Admins podem ver todos
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()));

-- =============================================
-- FASE 6: Storage para Imagens de Produtos
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para o bucket
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND public.is_admin_or_manager(auth.uid())
  );

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' 
    AND public.is_admin_or_manager(auth.uid())
  );

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' 
    AND public.is_admin_or_manager(auth.uid())
  );

-- Trigger para atualizar updated_at na store_settings
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
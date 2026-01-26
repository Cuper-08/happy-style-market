-- Insert categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Tênis', 'tenis', 'footprints'),
  ('Roupas', 'roupas', 'shirt'),
  ('Acessórios', 'acessorios', 'watch');

-- Insert brands
INSERT INTO public.brands (name, slug) VALUES
  ('Nike', 'nike'),
  ('Adidas', 'adidas'),
  ('Puma', 'puma'),
  ('New Balance', 'new-balance'),
  ('Mizuno', 'mizuno');

-- Insert products
INSERT INTO public.products (name, slug, description, category_id, brand_id, retail_price, wholesale_price, wholesale_min_qty, images, featured, is_new)
SELECT 
  'Nike Air Max 90',
  'nike-air-max-90',
  'O Nike Air Max 90 é um ícone do streetwear. Com amortecimento Air visível e design atemporal, oferece conforto e estilo inigualáveis.',
  c.id,
  b.id,
  599.90,
  449.90,
  6,
  ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop'],
  true,
  true
FROM public.categories c, public.brands b
WHERE c.slug = 'tenis' AND b.slug = 'nike';

INSERT INTO public.products (name, slug, description, category_id, brand_id, retail_price, wholesale_price, wholesale_min_qty, images, featured, is_new)
SELECT 
  'Adidas Ultraboost 23',
  'adidas-ultraboost-23',
  'Desempenho e conforto extremo. A tecnologia Boost proporciona retorno de energia incomparável a cada passada.',
  c.id,
  b.id,
  899.90,
  699.90,
  6,
  ARRAY['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop'],
  true,
  true
FROM public.categories c, public.brands b
WHERE c.slug = 'tenis' AND b.slug = 'adidas';

INSERT INTO public.products (name, slug, description, category_id, brand_id, retail_price, wholesale_price, wholesale_min_qty, images, featured, is_new)
SELECT 
  'Puma RS-X',
  'puma-rs-x',
  'Design futurista com tecnologia Running System. Ideal para quem busca estilo e conforto no dia a dia.',
  c.id,
  b.id,
  499.90,
  379.90,
  6,
  ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop'],
  true,
  false
FROM public.categories c, public.brands b
WHERE c.slug = 'tenis' AND b.slug = 'puma';

INSERT INTO public.products (name, slug, description, category_id, brand_id, retail_price, wholesale_price, wholesale_min_qty, images, featured, is_new)
SELECT 
  'New Balance 574',
  'new-balance-574',
  'Clássico atemporal da New Balance. Conforto superior com design versátil para qualquer ocasião.',
  c.id,
  b.id,
  549.90,
  419.90,
  6,
  ARRAY['https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=800&fit=crop'],
  false,
  false
FROM public.categories c, public.brands b
WHERE c.slug = 'tenis' AND b.slug = 'new-balance';

INSERT INTO public.products (name, slug, description, category_id, brand_id, retail_price, wholesale_price, wholesale_min_qty, images, featured, is_new)
SELECT 
  'Mizuno Wave Rider 27',
  'mizuno-wave-rider-27',
  'Tecnologia Wave Plate para máximo amortecimento. Perfeito para corridas de longa distância.',
  c.id,
  b.id,
  799.90,
  599.90,
  6,
  ARRAY['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop'],
  true,
  true
FROM public.categories c, public.brands b
WHERE c.slug = 'tenis' AND b.slug = 'mizuno';

-- Roupas
INSERT INTO public.products (name, slug, description, category_id, brand_id, retail_price, wholesale_price, wholesale_min_qty, images, featured, is_new)
SELECT 
  'Camiseta Nike Dri-FIT',
  'camiseta-nike-dri-fit',
  'Tecnologia Dri-FIT para máxima absorção de suor. Ideal para treinos intensos.',
  c.id,
  b.id,
  149.90,
  99.90,
  12,
  ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'],
  true,
  false
FROM public.categories c, public.brands b
WHERE c.slug = 'roupas' AND b.slug = 'nike';

INSERT INTO public.products (name, slug, description, category_id, brand_id, retail_price, wholesale_price, wholesale_min_qty, images, featured, is_new)
SELECT 
  'Shorts Adidas Aeroready',
  'shorts-adidas-aeroready',
  'Tecido leve e respirável com tecnologia Aeroready. Conforto total para seus treinos.',
  c.id,
  b.id,
  179.90,
  129.90,
  12,
  ARRAY['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=800&fit=crop'],
  false,
  true
FROM public.categories c, public.brands b
WHERE c.slug = 'roupas' AND b.slug = 'adidas';

INSERT INTO public.products (name, slug, description, category_id, brand_id, retail_price, wholesale_price, wholesale_min_qty, images, featured, is_new)
SELECT 
  'Moletom Puma Essential',
  'moletom-puma-essential',
  'Moletom confortável com capuz. Perfeito para dias frios ou looks casuais.',
  c.id,
  b.id,
  299.90,
  219.90,
  6,
  ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop'],
  true,
  false
FROM public.categories c, public.brands b
WHERE c.slug = 'roupas' AND b.slug = 'puma';

-- Acessórios
INSERT INTO public.products (name, slug, description, category_id, brand_id, retail_price, wholesale_price, wholesale_min_qty, images, featured, is_new)
SELECT 
  'Mochila Nike Brasilia',
  'mochila-nike-brasilia',
  'Mochila espaçosa com múltiplos compartimentos. Ideal para academia ou dia a dia.',
  c.id,
  b.id,
  249.90,
  179.90,
  6,
  ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop'],
  true,
  false
FROM public.categories c, public.brands b
WHERE c.slug = 'acessorios' AND b.slug = 'nike';

INSERT INTO public.products (name, slug, description, category_id, brand_id, retail_price, wholesale_price, wholesale_min_qty, images, featured, is_new)
SELECT 
  'Boné Adidas Baseball',
  'bone-adidas-baseball',
  'Boné clássico com logo bordado. Proteção solar com estilo.',
  c.id,
  b.id,
  129.90,
  89.90,
  12,
  ARRAY['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop'],
  false,
  true
FROM public.categories c, public.brands b
WHERE c.slug = 'acessorios' AND b.slug = 'adidas';

-- Add product variants for the Nike Air Max 90
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku)
SELECT p.id, size, color, color_hex, stock_quantity, sku
FROM public.products p
CROSS JOIN (VALUES 
  ('38', 'Preto', '#000000', 10, 'NAM90-38-BK'),
  ('39', 'Preto', '#000000', 15, 'NAM90-39-BK'),
  ('40', 'Preto', '#000000', 20, 'NAM90-40-BK'),
  ('41', 'Preto', '#000000', 18, 'NAM90-41-BK'),
  ('42', 'Preto', '#000000', 12, 'NAM90-42-BK'),
  ('43', 'Preto', '#000000', 8, 'NAM90-43-BK'),
  ('38', 'Branco', '#FFFFFF', 10, 'NAM90-38-WH'),
  ('39', 'Branco', '#FFFFFF', 15, 'NAM90-39-WH'),
  ('40', 'Branco', '#FFFFFF', 20, 'NAM90-40-WH'),
  ('41', 'Branco', '#FFFFFF', 18, 'NAM90-41-WH'),
  ('42', 'Branco', '#FFFFFF', 12, 'NAM90-42-WH'),
  ('38', 'Vermelho', '#FF0000', 5, 'NAM90-38-RD'),
  ('39', 'Vermelho', '#FF0000', 8, 'NAM90-39-RD'),
  ('40', 'Vermelho', '#FF0000', 12, 'NAM90-40-RD'),
  ('41', 'Vermelho', '#FF0000', 10, 'NAM90-41-RD')
) AS v(size, color, color_hex, stock_quantity, sku)
WHERE p.slug = 'nike-air-max-90';

-- Add variants for Adidas Ultraboost
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku)
SELECT p.id, size, color, color_hex, stock_quantity, sku
FROM public.products p
CROSS JOIN (VALUES 
  ('39', 'Preto', '#000000', 10, 'AUB23-39-BK'),
  ('40', 'Preto', '#000000', 15, 'AUB23-40-BK'),
  ('41', 'Preto', '#000000', 20, 'AUB23-41-BK'),
  ('42', 'Preto', '#000000', 15, 'AUB23-42-BK'),
  ('43', 'Preto', '#000000', 10, 'AUB23-43-BK'),
  ('39', 'Azul', '#0066FF', 8, 'AUB23-39-BL'),
  ('40', 'Azul', '#0066FF', 12, 'AUB23-40-BL'),
  ('41', 'Azul', '#0066FF', 15, 'AUB23-41-BL'),
  ('42', 'Azul', '#0066FF', 10, 'AUB23-42-BL')
) AS v(size, color, color_hex, stock_quantity, sku)
WHERE p.slug = 'adidas-ultraboost-23';

-- Add variants for clothing
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku)
SELECT p.id, size, color, color_hex, stock_quantity, sku
FROM public.products p
CROSS JOIN (VALUES 
  ('P', 'Preto', '#000000', 20, 'CNDF-P-BK'),
  ('M', 'Preto', '#000000', 30, 'CNDF-M-BK'),
  ('G', 'Preto', '#000000', 25, 'CNDF-G-BK'),
  ('GG', 'Preto', '#000000', 15, 'CNDF-GG-BK'),
  ('P', 'Branco', '#FFFFFF', 20, 'CNDF-P-WH'),
  ('M', 'Branco', '#FFFFFF', 30, 'CNDF-M-WH'),
  ('G', 'Branco', '#FFFFFF', 25, 'CNDF-G-WH'),
  ('GG', 'Branco', '#FFFFFF', 15, 'CNDF-GG-WH')
) AS v(size, color, color_hex, stock_quantity, sku)
WHERE p.slug = 'camiseta-nike-dri-fit';
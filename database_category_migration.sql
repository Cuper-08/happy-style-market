ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Rename 'Tenis' to 'Tênis'
UPDATE categories SET name = 'Tênis', slug = 'tenis' WHERE name ILIKE 'Tenis';
UPDATE products SET category = 'Tênis' WHERE category ILIKE 'Tenis';

-- Fix 'Bolsas e Acessórios' parent
INSERT INTO categories (id, name, slug)
SELECT gen_random_uuid(), 'Bolsas e Acessórios', 'bolsas-e-acessorios'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'bolsas-e-acessorios');

-- Map children for 'Bolsas e Acessórios' -> 'Bolsas', 'Mochilas', 'Acessórios', 'Meias', 'Malas'
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'bolsas-e-acessorios')
WHERE slug IN ('bolsas', 'acessorios', 'meias', 'malas');

-- Map children for 'Tênis'
INSERT INTO categories (id, name, slug)
SELECT gen_random_uuid(), 'Linha Premium', 'linha-premium'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'linha-premium');

INSERT INTO categories (id, name, slug)
SELECT gen_random_uuid(), 'Linha 1.1', 'linha-1-1'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'linha-1-1');

INSERT INTO categories (id, name, slug)
SELECT gen_random_uuid(), 'Grifes Importadas', 'grifes-importadas'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'grifes-importadas');

UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'tenis')
WHERE slug IN ('linha-premium', 'linha-1-1', 'grifes-importadas', 'esportivos', 'tenis-infantil');

-- Update products for 'Linha Premium'
UPDATE products SET category = 'Linha Premium' WHERE category = 'HIGH QUALITY ';
-- Delete old category 'HIGH QUALITY ' to avoid duplicates
DELETE FROM categories WHERE name = 'HIGH QUALITY ';

-- Update products for 'Linha 1.1'
UPDATE products SET category = 'Linha 1.1' WHERE category = 'Importados';
-- Delete old category 'Importados'
DELETE FROM categories WHERE name = 'Importados';

-- Create 'Gucci' under 'Grifes Importadas'
INSERT INTO categories (id, name, slug, parent_id)
SELECT gen_random_uuid(), 'Gucci', 'gucci', (SELECT id FROM categories WHERE slug = 'grifes-importadas')
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'gucci');

-- Move all Gucci sneakers to 'Gucci' under 'Grifes Importadas'
UPDATE products SET category = 'Gucci' WHERE title ILIKE '%Gucci%' AND category IN ('Tênis', 'Linha 1.1', 'Linha Premium', 'Importados', 'HIGH QUALITY ');

-- Create 'Malas de Bordo' under 'Malas'
INSERT INTO categories (id, name, slug, parent_id)
SELECT gen_random_uuid(), 'Malas de Bordo', 'malas-de-bordo', (SELECT id FROM categories WHERE slug = 'malas')
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'malas-de-bordo');

-- Any product with 'mala de bordo' gets 'Malas de Bordo'
UPDATE products SET category = 'Malas de Bordo' WHERE title ILIKE '%mala de bordo%';

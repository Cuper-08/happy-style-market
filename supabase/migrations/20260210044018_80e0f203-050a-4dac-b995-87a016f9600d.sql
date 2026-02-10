ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_sku_key;
CREATE UNIQUE INDEX product_variants_sku_unique ON product_variants (sku) WHERE sku IS NOT NULL AND sku != '';
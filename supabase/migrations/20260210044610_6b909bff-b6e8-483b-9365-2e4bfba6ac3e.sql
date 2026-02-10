-- Function to atomically decrement stock for order items
-- Returns false if any variant has insufficient stock
CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_items jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  item jsonb;
  current_stock integer;
BEGIN
  -- First pass: validate all stock levels
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF item->>'variant_id' IS NOT NULL THEN
      SELECT stock_quantity INTO current_stock
      FROM product_variants
      WHERE id = (item->>'variant_id')::uuid
      FOR UPDATE;
      
      IF current_stock IS NULL OR current_stock < (item->>'quantity')::integer THEN
        RETURN false;
      END IF;
    END IF;
  END LOOP;
  
  -- Second pass: decrement stock
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF item->>'variant_id' IS NOT NULL THEN
      UPDATE product_variants
      SET stock_quantity = stock_quantity - (item->>'quantity')::integer
      WHERE id = (item->>'variant_id')::uuid;
    END IF;
  END LOOP;
  
  RETURN true;
END;
$$;
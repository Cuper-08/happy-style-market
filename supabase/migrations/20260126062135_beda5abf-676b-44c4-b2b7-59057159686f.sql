-- Policy: Users can insert their own order items (needed for checkout)
CREATE POLICY "Users can insert own order items"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Policy: Admins can view all products including inactive ones
CREATE POLICY "Admins can view all products"
ON public.products FOR SELECT
USING (is_admin_or_manager(auth.uid()));
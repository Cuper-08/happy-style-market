CREATE POLICY "Admins and managers can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can insert product variants"
ON public.product_variants
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update product variants"
ON public.product_variants
FOR UPDATE
TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can delete product variants"
ON public.product_variants
FOR DELETE
TO authenticated
USING (public.is_admin_or_manager(auth.uid()));
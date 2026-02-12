
-- Create banners table
CREATE TABLE public.banners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  button_text text,
  button_link text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Public can read active banners
CREATE POLICY "Active banners are publicly readable"
ON public.banners FOR SELECT
USING (is_active = true);

-- Admins can read all banners
CREATE POLICY "Admins can view all banners"
ON public.banners FOR SELECT
USING (is_admin_or_manager(auth.uid()));

-- Admins can insert banners
CREATE POLICY "Admins can insert banners"
ON public.banners FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

-- Admins can update banners
CREATE POLICY "Admins can update banners"
ON public.banners FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

-- Admins can delete banners
CREATE POLICY "Admins can delete banners"
ON public.banners FOR DELETE
USING (is_admin_or_manager(auth.uid()));

-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

-- Storage policies for banners bucket
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Admins can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update banner images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banners' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete banner images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banners' AND is_admin_or_manager(auth.uid()));

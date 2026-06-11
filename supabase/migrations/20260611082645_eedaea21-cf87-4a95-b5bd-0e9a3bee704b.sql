
CREATE TABLE public.service_gallery_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL,
  url text NOT NULL,
  storage_path text,
  caption text,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX service_gallery_images_slug_sort_idx ON public.service_gallery_images (slug, sort);
GRANT SELECT ON public.service_gallery_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_gallery_images TO authenticated;
GRANT ALL ON public.service_gallery_images TO service_role;
ALTER TABLE public.service_gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read service gallery"
  ON public.service_gallery_images FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "Admins manage service gallery"
  ON public.service_gallery_images FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

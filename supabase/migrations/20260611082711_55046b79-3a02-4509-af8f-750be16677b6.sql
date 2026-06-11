
CREATE POLICY "Public read service-gallery"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'service-gallery');
CREATE POLICY "Admins write service-gallery"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'service-gallery' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update service-gallery"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'service-gallery' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete service-gallery"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'service-gallery' AND public.has_role(auth.uid(), 'admin'::app_role));

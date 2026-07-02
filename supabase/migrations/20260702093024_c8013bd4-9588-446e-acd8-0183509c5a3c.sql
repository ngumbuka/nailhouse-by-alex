DROP POLICY IF EXISTS "Admins can manage reviews" ON public.service_reviews;
CREATE POLICY "Admins can manage reviews" ON public.service_reviews
  AS PERMISSIVE FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated users can submit reviews" ON public.service_reviews;
CREATE POLICY "Authenticated users can submit reviews" ON public.service_reviews
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (
    approved = false
    AND rating BETWEEN 1 AND 5
    AND char_length(COALESCE(comment, '')) <= 2000
    AND char_length(COALESCE(client_name, '')) BETWEEN 1 AND 120
  );

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.service_reviews;
CREATE POLICY "Public can view approved reviews" ON public.service_reviews
  AS PERMISSIVE FOR SELECT TO anon, authenticated
  USING (approved = true);

ALTER TABLE public.service_reviews ALTER COLUMN approved SET DEFAULT false;
UPDATE public.service_reviews SET approved = false WHERE approved IS NULL;

DROP POLICY IF EXISTS "Anyone can submit a review" ON public.service_reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.service_reviews;

CREATE POLICY "Authenticated users can submit reviews"
  ON public.service_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    approved = false
    AND rating BETWEEN 1 AND 5
    AND char_length(coalesce(comment, '')) <= 2000
    AND char_length(coalesce(client_name, '')) BETWEEN 1 AND 120
  );

CREATE POLICY "Public can view approved reviews"
  ON public.service_reviews
  FOR SELECT
  TO anon, authenticated
  USING (approved = true);

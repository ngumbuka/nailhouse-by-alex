CREATE TABLE public.service_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX service_reviews_service_id_idx ON public.service_reviews(service_id);

GRANT SELECT ON public.service_reviews TO anon;
GRANT SELECT, INSERT ON public.service_reviews TO authenticated;
GRANT ALL ON public.service_reviews TO service_role;

ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews"
  ON public.service_reviews FOR SELECT
  USING (approved = true);

CREATE POLICY "Anyone can submit a review"
  ON public.service_reviews FOR INSERT
  WITH CHECK (
    length(client_name) BETWEEN 2 AND 120
    AND rating BETWEEN 1 AND 5
    AND (comment IS NULL OR length(comment) <= 2000)
  );

CREATE POLICY "Admins can manage reviews"
  ON public.service_reviews FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

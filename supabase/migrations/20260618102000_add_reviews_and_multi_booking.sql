-- ============================
-- MULTI-SERVICE BOOKING COLUMNS
-- ============================
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_ids uuid[];
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_names text[];

-- ============================
-- SERVICE REVIEWS
-- ============================
CREATE TABLE IF NOT EXISTS public.service_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================
-- GRANTS & RLS
-- ============================
GRANT SELECT, INSERT ON public.service_reviews TO anon, authenticated;
GRANT ALL ON public.service_reviews TO service_role;

ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are public" ON public.service_reviews;
CREATE POLICY "Reviews are public"
  ON public.service_reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can create review" ON public.service_reviews;
CREATE POLICY "Anyone can create review"
  ON public.service_reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    service_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_reviews.service_id)
    AND rating BETWEEN 1 AND 5
    AND char_length(btrim(client_name)) BETWEEN 2 AND 120
    AND (comment IS NULL OR char_length(comment) <= 2000)
  );

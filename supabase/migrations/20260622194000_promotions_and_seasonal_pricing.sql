-- PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent integer NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  description text,
  active boolean NOT NULL DEFAULT true,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies for promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promotions are public select" ON public.promotions
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage promotions" ON public.promotions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Grants
GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT ALL ON public.promotions TO service_role;

-- ADD SEASONAL PRICING TO SERVICES
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seasonal_price_fcfa integer;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seasonal_price_start timestamptz;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seasonal_price_end timestamptz;

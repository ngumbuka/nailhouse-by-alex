
-- ============================
-- ROLES
-- ============================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================
-- SERVICES
-- ============================
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  price_fcfa integer NOT NULL,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are public" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================
-- BOOKINGS
-- ============================
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  calendar_event_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================
-- GALLERY
-- ============================
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  storage_path text,
  caption text,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT ALL ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery public" ON public.gallery_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage gallery" ON public.gallery_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================
-- NEWSLETTER
-- ============================
CREATE TABLE public.newsletter_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_emails TO anon, authenticated;
GRANT SELECT, DELETE ON public.newsletter_emails TO authenticated;
GRANT ALL ON public.newsletter_emails TO service_role;
ALTER TABLE public.newsletter_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_emails FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read subscribers" ON public.newsletter_emails FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete subscribers" ON public.newsletter_emails FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================
-- SEED SERVICES
-- ============================
INSERT INTO public.services (category, name, price_fcfa, sort) VALUES
('Soins des mains', 'Manucure classique', 5000, 10),
('Soins des mains', 'Manucure spa', 7000, 20),
('Soins des pieds', 'Pédicure classique', 4000, 10),
('Soins des pieds', 'Pédicure spa', 7000, 20),
('Soins des pieds', 'Vernis semi-permanent pieds', 3000, 30),
('Soins des pieds', 'Vernis gainage pieds', 5000, 40),
('Ongles naturels renforcés', 'Gainage', 5000, 10),
('Ongles naturels renforcés', 'Rallongement', 7000, 20),
('Ongles naturels renforcés', 'Semi-permanent', 3000, 30),
('Ongles naturels renforcés', 'Construction gel sans limage', 7000, 40),
('Ongles naturels renforcés', 'Renforcement', 9000, 50),
('Ongles naturels renforcés', 'Extensions élégants', 10000, 60),
('Ongle naturel BIAB', 'Gainage BIAB naturel', 7000, 10),
('Ongle naturel BIAB', 'BIAB + semi-permanent', 9000, 20),
('Ongle naturel BIAB', 'Remplissage BIAB', 6000, 30),
('Capsule sur ongle', 'Gainage', 7000, 10),
('Capsule sur ongle', 'Semi-permanente', 4000, 20),
('Capsule sur ongle', 'Construction gel sans limage', 9000, 30),
('Capsule sur ongle', 'Construction polygel', 10000, 40),
('Capsule sur ongle', 'Gel x pose américaine', 10000, 50),
('Capsule sur ongle', 'Remplissage', 7000, 60),
('Supplément', 'Strass, chrome, effets, dessins', 1000, 10),
('Dépose', 'Gel, gainage, semi-permanent', 2000, 10);

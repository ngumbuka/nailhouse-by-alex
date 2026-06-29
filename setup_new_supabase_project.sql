-- ========================================================================================
-- NAILHOUSE BY ALEX - FULL SUPABASE PROJECT SETUP SCRIPT
-- ========================================================================================
-- This script configures a brand new Supabase project from scratch.
-- It recreates all tables, relationships, RLS policies, functions, triggers, and feeds the 
-- database with initial records and beautiful bilingual descriptions.
--
-- INSTRUCTIONS:
-- 1. Open your brand new Supabase Dashboard (https://supabase.com).
-- 2. Go to the "SQL Editor" tab on the left sidebar.
-- 3. Copy-paste this ENTIRE script and run it.
-- 4. In your code, replace the environment variables in ".env" with your new project's URL and Anon Key.
-- ========================================================================================

-- ─── 1. ROLES & SCHEMAS ───────────────────────────────────────────────────────────

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

-- Grant execute permissions on has_role function to public roles so they can be evaluated within RLS policies
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO PUBLIC, anon, authenticated, service_role;


-- ─── 2. AUTH & PROFILES ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'client',
  created_at timestamptz NOT NULL DEFAULT now(),
  birthday text,
  preferred_stylist text,
  instagram text,
  preferred_length text DEFAULT 'none',
  preferred_shape text DEFAULT 'none',
  preferred_style text DEFAULT 'none',
  allergies_contraindications text,
  followup_preference text DEFAULT 'messages'
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Triggers to auto-confirm new users (local/auth configuration bypass)
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at = now();
  NEW.confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_user();

-- Trigger to auto-create profile on client signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    phone,
    role,
    created_at,
    birthday,
    preferred_stylist,
    instagram,
    preferred_length,
    preferred_shape,
    preferred_style,
    allergies_contraindications,
    followup_preference
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'client',
    now(),
    '',
    '',
    '',
    'none',
    'none',
    'none',
    '',
    COALESCE(NEW.raw_user_meta_data->>'followup_preference', 'messages')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();


-- ─── 3. CORE SERVICES CATALOGUE ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  name_en text,
  price_fcfa integer NOT NULL,
  seasonal_price_fcfa integer,
  seasonal_price_start timestamptz,
  seasonal_price_end timestamptz,
  sort integer NOT NULL DEFAULT 0,
  description text,
  description_en text,
  slug text,
  is_active boolean DEFAULT true,
  image_url text,
  is_addon boolean DEFAULT false,
  duration_mins integer DEFAULT 45,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;


-- ─── 4. BOOKINGS SYSTEM ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  service_ids uuid[],
  service_names text[],
  scheduled_at timestamptz NOT NULL,
  proposed_scheduled_at timestamptz,
  notes text,
  admin_comment text,
  status text NOT NULL DEFAULT 'pending',
  calendar_event_id text,
  followup_preference text DEFAULT 'messages',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;


-- ─── 5. GALLERY & MEDIA ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  storage_path text,
  caption text,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.service_gallery_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL,
  url text NOT NULL,
  storage_path text,
  caption text,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_gallery_images_slug_sort_idx ON public.service_gallery_images (slug, sort);

ALTER TABLE public.service_gallery_images ENABLE ROW LEVEL SECURITY;


-- ─── 6. NEWSLETTER & MESSAGING ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.newsletter_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_emails ENABLE ROW LEVEL SECURITY;


-- ─── 7. REVIEWS & ANCILLARY ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.service_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

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

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text,
  title text,
  description text,
  category text,
  active boolean DEFAULT true,
  sort integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.settings (
  id text PRIMARY KEY DEFAULT 'global',
  opening_time text NOT NULL DEFAULT '09:00',
  closing_time text NOT NULL DEFAULT '19:00',
  closed_days integer[] NOT NULL DEFAULT '{0}',
  blocked_dates text[] NOT NULL DEFAULT '{}',
  buffer_time_mins integer NOT NULL DEFAULT 0
);


-- ─── 8. POLICIES & GRANTS ────────────────────────────────────────────────────────

-- User Roles
CREATE POLICY "Users can see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage user_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Services
CREATE POLICY "Services are public" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;

-- Bookings
CREATE POLICY "Anyone can create booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (
  service_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.services s WHERE s.id = bookings.service_id)
  AND char_length(btrim(name)) BETWEEN 1 AND 120
  AND char_length(btrim(service_name)) BETWEEN 1 AND 200
  AND char_length(btrim(phone)) BETWEEN 4 AND 30
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(email) <= 254
  AND scheduled_at > now()
  AND (notes IS NULL OR char_length(notes) <= 2000)
  AND status = 'pending'
);
CREATE POLICY "Admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Users can read own bookings" ON public.bookings FOR SELECT TO authenticated USING (email = (auth.jwt()->>'email'));
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (email = (auth.jwt()->>'email')) WITH CHECK (email = (auth.jwt()->>'email'));
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

-- Gallery
CREATE POLICY "Gallery public" ON public.gallery_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage gallery" ON public.gallery_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT ALL ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;

-- Service Gallery Images
CREATE POLICY "Public can read service gallery" ON public.service_gallery_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage service gallery" ON public.service_gallery_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT ON public.service_gallery_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_gallery_images TO authenticated;
GRANT ALL ON public.service_gallery_images TO service_role;

-- Storage Configuration & Buckets
-- Note: Make sure the 'storage-nail-house' bucket is created in your storage page.
-- If storage is already configured, these policies lock down the storage-nail-house storage objects.
CREATE POLICY "Public read storage-nail-house" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'storage-nail-house');
CREATE POLICY "Admins write storage-nail-house" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'storage-nail-house' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update storage-nail-house" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'storage-nail-house' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete storage-nail-house" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'storage-nail-house' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Newsletter
CREATE POLICY "Anyone can subscribe" ON public.newsletter_emails FOR INSERT TO anon, authenticated WITH CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 254);
CREATE POLICY "Admins read subscribers" ON public.newsletter_emails FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete subscribers" ON public.newsletter_emails FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT INSERT ON public.newsletter_emails TO anon, authenticated;
GRANT SELECT, DELETE ON public.newsletter_emails TO authenticated;
GRANT ALL ON public.newsletter_emails TO service_role;

-- Reviews
CREATE POLICY "Reviews are public" ON public.service_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create review" ON public.service_reviews FOR INSERT TO anon, authenticated WITH CHECK (
  service_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_reviews.service_id)
  AND rating BETWEEN 1 AND 5
  AND char_length(btrim(client_name)) BETWEEN 2 AND 120
  AND (comment IS NULL OR char_length(comment) <= 2000)
);
GRANT SELECT, INSERT ON public.service_reviews TO anon, authenticated;
GRANT ALL ON public.service_reviews TO service_role;

-- Promotions
CREATE POLICY "Promotions are public select" ON public.promotions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage promotions" ON public.promotions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT ALL ON public.promotions TO service_role;

-- Videos
CREATE POLICY "Videos are public select" ON public.videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage videos" ON public.videos FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
GRANT SELECT ON public.videos TO anon, authenticated;
GRANT ALL ON public.videos TO service_role;


-- ─── 9. SEEDING GLOBAL DATA ───────────────────────────────────────────────────────

-- Settings
INSERT INTO public.settings (id, opening_time, closing_time, closed_days, blocked_dates, buffer_time_mins)
VALUES ('global', '09:00', '19:00', '{0}', '{}', 0)
ON CONFLICT (id) DO NOTHING;

-- Promotions
INSERT INTO public.promotions (id, code, discount_percent, description, active)
VALUES 
('11111111-1111-1111-1111-111111111111', 'SUMMER20', 20, '20% de réduction sur toutes les prestations pour l''été !', true),
('22222222-2222-2222-2222-222222222222', 'WELCOME10', 10, '10% de réduction pour votre première visite.', true)
ON CONFLICT DO NOTHING;

-- Videos
INSERT INTO public.videos (id, url, title, description, category, active, sort)
VALUES 
('33333333-3333-3333-3333-333333333333', '/placeholder-manicure.html', 'Soin Signature Manucure', 'Sublimez vos mains avec un soin complet.', 'Soins des mains', true, 1),
('44444444-4444-4444-4444-444444444444', '/placeholder-manicure.html', 'Vernis Semi-Permanent', 'Des couleurs éclatantes et durables.', 'Soins des mains', true, 2),
('55555555-5555-5555-5555-555555555555', '/placeholder-pedicure.html', 'Spa Pédicure Rituel', 'Détente absolue et soin profond.', 'Soins des pieds', true, 3)
ON CONFLICT DO NOTHING;

-- Gallery Images
INSERT INTO public.gallery_images (id, url, caption, sort)
VALUES 
('66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1522337660859-02fbefca4702', 'Manucure Couture Bordeaux', 1),
('77777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b', 'Nail Art Graphique & Pois', 2),
('88888888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b', 'Espace Pédicure Prestige', 3)
ON CONFLICT DO NOTHING;


-- ─── 10. SEEDING SERVICES CATALOGUE (BILINGUAL & ENHANCED) ─────────────────────────

INSERT INTO public.services (id, category, name, name_en, price_fcfa, sort, duration_mins, slug, is_active, is_addon, description, description_en) VALUES
('7c9a4192-b430-4e33-8a39-ebde89bb12e7', 'Soins des mains', 'Manucure classique', 'Classic Manicure', 5000, 10, 45, 'manucure-classique', true, false, 
 '<p>Un soin complet de précision pour des mains nettes et soignées au quotidien. Comprend le limage personnalisé pour définir la forme idéale de vos ongles, le traitement minutieux des cuticules avec des instruments stérilisés, suivi d''un massage hydratant relaxant et de l''application d''une base fortifiante protectrice.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Pour celles et ceux qui souhaitent des mains soignées, propres et élégantes sans pose de couleur.</p>',
 '<p>A complete precision treatment for neat and well-groomed hands every day. Includes personalized filing to define the ideal shape of your nails, meticulous cuticle treatment with sterilized instruments, followed by a relaxing moisturizing massage and the application of a protective strengthening base.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Those who want neat, clean, and elegant hands without color polish.</p>'),

('de03195b-0be1-432d-8386-77891ef9f12d', 'Soins des mains', 'Manucure spa', 'Spa Manicure', 7000, 20, 75, 'manucure-spa', true, false,
 '<p>L''expérience sensorielle et relaxante ultime pour la beauté et le confort de vos mains. Elle associe toutes les étapes de notre manucure classique à un bain tiède aromatique, un gommage exfoliant doux aux huiles essentielles, l''application d''un masque enveloppant ultra-nourrissant et un massage prolongé.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Idéal pour s''offrir une pause détente absolue tout en régénérant en profondeur la peau de ses mains.</p>',
 '<p>The ultimate sensory and relaxing experience for the beauty and comfort of your hands. It combines all the steps of our classic manicure with a warm aromatic bath, a gentle exfoliating scrub with essential oils, the application of an ultra-nourishing wrapping mask, and a prolonged massage.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Ideal for an absolute relaxation break while deeply regenerating the skin of your hands.</p>'),

('09c69341-382a-4f51-b844-48f8cbf5e9d9', 'Soins des pieds', 'Pédicure classique', 'Classic Pedicure', 4000, 10, 45, 'pedicure-classique', true, false,
 '<p>Un soin indispensable des pieds pour retrouver légèreté et douceur. Cette prestation comprend un bain de pieds délassant, la mise en forme personnalisée des ongles, le retrait délicat des cuticules, l''élimination douce des rugosités superficielles, complétés par un massage hydratant relaxant.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Indiqué pour l''entretien régulier des pieds et pour conserver des ongles impeccables et sains.</p>',
 '<p>An essential foot care treatment to restore lightness and softness. This service includes a relaxing foot bath, personalized nail shaping, gentle cuticle removal, soft elimination of superficial roughness, completed with a relaxing moisturizing massage.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Recommended for regular foot maintenance and keeping impeccable, healthy nails.</p>'),

('ba5d8205-d148-4cb1-b0db-b27bcfb99db1', 'Soins des pieds', 'Pédicure spa', 'Spa Pedicure', 7000, 20, 75, 'pedicure-spa', true, false,
 '<p>Le soin d''exception ultime pour vos pieds fatigués. Ce rituel complet comprend un bain de pieds aromatique aux sels marins, un gommage purifiant, un masque réparateur enveloppant sous serviette chaude, le traitement des cuticules et callosités, et un massage drainant des pieds et mollets.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Recommandé pour relâcher les tensions accumulées, adoucir la peau et passer un moment de pure évasion.</p>',
 '<p>The ultimate exceptional treatment for your tired feet. This complete ritual includes an aromatic sea salt foot bath, a purifying scrub, a wrapping repairing mask under a hot towel, cuticle and callus treatment, and a draining foot and calf massage.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Recommended to release accumulated tension, soften the skin, and spend a moment of pure escape.</p>'),

('d2b512bb-1a5c-4a30-8012-bd921b7ce3a2', 'Soins des pieds', 'Vernis semi-permanent pieds', 'Toes Semi-Permanent', 3000, 30, 30, 'vernis-semi-permanent-pieds', true, false,
 '<p>La pose rapide de notre vernis gel semi-permanent haut de gamme sur les pieds. Comprend la préparation de l''ongle, le limage et l''application soignée de la couleur avec une brillance miroir préservée pendant plus de 3 semaines.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Pour celles qui recherchent une couleur éclatante longue tenue sur les ongles de pieds sans le soin complet.</p>',
 '<p>The quick application of our premium semi-permanent gel polish on your toes. Includes nail preparation, filing, and careful application of color with a mirror shine preserved for over 3 weeks.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Those looking for a vibrant, long-lasting color on their toes without a full pedicure service.</p>'),

('6bc001d9-5cc8-4e89-9a72-f155df987be7', 'Soins des pieds', 'Vernis gainage pieds', 'Toes Reinforced Base', 5000, 40, 45, 'vernis-gainage-pieds', true, false,
 '<p>Une technique avancée combinant la tenue du vernis gel à une base protectrice renforcée sur les ongles de pieds. Elle permet de lisser la surface des ongles, combler les stries et assurer une résistance parfaite face aux chocs.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Parfait pour uniformiser et fortifier les ongles de pieds striés ou fragilisés.</p>',
 '<p>An advanced technique combining the durability of gel polish with a reinforced protective base on toenails. It allows smoothing the nail surface, filling ridges, and ensuring perfect resistance to impacts.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Perfect for evening out and strengthening ridged or weakened toenails.</p>'),

('210ea8f4-6aeb-4202-a169-be573db1b742', 'Ongles naturels renforcés', 'Gainage', 'Natural Gel Overlay', 5000, 10, 75, 'gainage', true, false,
 '<p>L''application d''un gel protecteur sur vos ongles naturels pour lisser leur surface et leur apporter la résistance nécessaire face aux chocs quotidiens, sans rallongement. Idéal pour conserver sa longueur naturelle.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Conseillé pour fortifier les ongles de longueur moyenne sans ajouter d''épaisseur artificielle.</p>',
 '<p>The application of a protective gel on your natural nails to smooth their surface and provide the necessary resistance against daily impacts, without extensions. Ideal for maintaining your natural length.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Recommended for strengthening medium-length nails without adding artificial thickness.</p>'),

('fdf538e1-d2f6-4f4d-8758-e4b77bc002c9', 'Ongles naturels renforcés', 'Rallongement', 'Gel Extensions', 7000, 20, 105, 'rallongement', true, false,
 '<p>La création minutieuse de longueur sur-mesure sur vos ongles naturels à l''aide de chablons ou de capsules de gel pour redessiner la main avec finesse et assurer un résultat résistant et harmonieux.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Idéal pour restructurer et rallonger les ongles courts, cassés ou rongés.</p>',
 '<p>The meticulous creation of custom length on your natural nails using forms or gel tips to redesign the hand with finesse and ensure a resistant and harmonious result.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Ideal for restructuring and lengthening short, broken, or bitten nails.</p>'),

('32c2864c-f187-4180-87a3-cb20db7b4699', 'Ongles naturels renforcés', 'Semi-permanent', 'Hands Semi-Permanent', 3000, 30, 45, 'semi-permanent', true, false,
 '<p>Une pose de vernis gel semi-permanent de prestige polymérisé sous lampe LED. Comprend le limage soigné, un nettoyage rapide des cuticules et l''application d''une couleur vibrante avec finition miroir.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Parfait pour celles qui souhaitent une couleur éclatante sans besoin de renforcement ou gainage gel.</p>',
 '<p>An application of prestigious semi-permanent gel polish cured under an LED lamp. Includes careful filing, a quick cuticle clean-up, and the application of a vibrant color with a mirror finish.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Perfect for those who want vibrant color without the need for reinforcement or gel overlay.</p>'),

('33ca82bb-df51-40ef-8b89-29177a284be5', 'Ongles naturels renforcés', 'Construction gel sans limage', 'No-File Gel Sculpting', 7000, 40, 90, 'construction-gel-sans-limage', true, false,
 '<p>Une technique moderne de pose de gel sculptée sur-mesure. En évitant le limage excessif, nous protégeons la plaque naturelle de l''ongle tout en construisant une architecture fine, solide et parfaitement équilibrée.</p>',
 '<p>A modern custom gel sculpting technique. By avoiding excessive filing, we protect the natural nail plate while constructing a thin, strong, and perfectly balanced architecture.</p>'),

('1007ea45-5d9c-4be2-a39c-e77a21644781', 'Ongles naturels renforcés', 'Renforcement', 'High-Density Fortification', 9000, 50, 90, 'renforcement', true, false,
 '<p>Un soin de renforcement intensif combinant une base structurante haute densité et un gel de gainage protecteur pour redonner force et flexibilité aux ongles les plus abîmés.</p>',
 '<p>An intensive strengthening treatment combining a high-density structuring base and a protective overlay gel to restore strength and flexibility to the most damaged nails.</p>'),

('d690184c-cb1a-4639-9d90-33230bdf31c4', 'Ongles naturels renforcés', 'Extensions élégants', 'Signature Extensions', 10000, 60, 120, 'extensions-elegants', true, false,
 '<p>Un rallongement artistique haut de gamme conçu pour sublimer vos mains. Chaque extension est sculptée avec précision pour s''adapter à l''anatomie de votre doigt, avec un fini d''une finesse incomparable.</p>',
 '<p>A premium artistic extension designed to beautify your hands. Each extension is precisely sculpted to match the anatomy of your finger, with a finish of incomparable fineness.</p>'),

('b8cbb81e-624b-4f0f-863a-7d2fb709cc8e', 'Ongle naturel BIAB', 'Gainage BIAB naturel', 'BIAB Natural Overlay', 7000, 10, 75, 'gainage-biab-naturel', true, false,
 '<p>Le soin signature NailHouse. Le BIAB (Builder in a Bottle) est un gel de renforcement souple et riche en nutriments qui s''auto-égalise pour solidifier l''ongle naturel tout en favorisant sa pousse saine, avec un fini nude ou rosé ultra-chic.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Recommandé pour les ongles fragiles ou cassants qui nécessitent un gainage solide au fini naturel.</p>',
 '<p>The NailHouse signature treatment. BIAB (Builder in a Bottle) is a flexible, nutrient-rich builder gel that self-levels to solidify the natural nail while promoting healthy growth, finishing with an ultra-chic nude or rosy tint.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Recommended for fragile or brittle nails that require solid reinforcement with a natural finish.</p>'),

('614917dc-4db7-4c47-af03-4f9e13d94269', 'Ongle naturel BIAB', 'BIAB + semi-permanent', 'BIAB Overlay + Color', 9000, 20, 105, 'biab-semi-permanent', true, false,
 '<p>L''alliance parfaite de la protection fortifiante du gel BIAB et de la brillance de la couleur de votre choix. Nous sculptons d''abord la base BIAB avant d''appliquer une couleur semi-permanente laquée longue tenue.</p>',
 '<p>The perfect alliance of the fortifying protection of BIAB gel and the brilliance of the color of your choice. We first sculpt the BIAB base before applying a long-lasting, lacquered semi-permanent color.</p>'),

('1b9c9f0b-4de0-4752-b6be-b6a9e144a1d4', 'Ongle naturel BIAB', 'Remplissage BIAB', 'BIAB Refill', 6000, 30, 90, 'remplissage-biab', true, false,
 '<p>L''entretien régulier indispensable de votre pose BIAB. Nous retirons délicatement l''ancienne couleur, préparons la repousse de l''ongle naturel et appliquons une nouvelle couche de BIAB pour rétablir la structure et la solidité.</p>',
 '<p>The essential regular maintenance of your BIAB treatment. We gently remove the old color, prepare the natural nail regrowth, and apply a new layer of BIAB to restore structure and strength.</p>'),

('24b0de31-a8ee-4444-93ff-d9c0e4871e4d', 'Capsule sur ongle', 'Gainage', 'Tips Overlay', 7000, 10, 90, 'capsules-gainage', true, false,
 '<p>L''application d''une couche de gel de construction sur capsules pré-posées pour unifier la surface et apporter une solidité maximale, idéale pour un fini naturel.</p>',
 '<p>The application of a builder gel layer on pre-applied tips to unify the surface and bring maximum strength, ideal for a natural finish.</p>'),

('524ea264-b656-42d1-a901-b3b4de74b5c7', 'Capsule sur ongle', 'Semi-permanente', 'Tips + Semi-Permanent', 4000, 20, 90, 'capsules-semi-permanente', true, false,
 '<p>La pose de capsules avec une finition de couleur semi-permanente laquée. Comprend le limage, l''ajustement des capsules, le soin des cuticules et l''application de la couleur.</p>',
 '<p>The application of tips with a lacquered semi-permanent color finish. Includes filing, tip adjustment, cuticle care, and color application.</p>'),

('e38dfb42-126a-4d2b-aa90-b1ffbc9bf822', 'Capsule sur ongle', 'Construction gel sans limage', 'No-File Gel Tips Sculpting', 9000, 30, 120, 'capsules-construction-gel-sans-limage', true, false,
 '<p>Des extensions sur capsules sculptées avec un gel de construction autolissant. Cette méthode moderne préserve l''ongle naturel en limitant le limage au strict nécessaire, offrant une finesse et une légèreté remarquables.</p>',
 '<p>Extensions on tips sculpted with a self-leveling builder gel. This modern method preserves the natural nail by limiting filing to the strict minimum, offering remarkable thinness and lightness.</p>'),

('93ca31b2-10f8-4e8c-85df-ccbe81a3d9ff', 'Capsule sur ongle', 'Construction polygel', 'Polygel Sculpting Tips', 10000, 40, 120, 'construction-polygel', true, false,
 '<p>Des extensions haut de gamme réalisées en Polygel — un matériau hybride combinant la force de l''acrylique et la flexibilité du gel. Offre un contrôle de forme absolu et une légèreté incomparable au porter.</p>',
 '<p>Premium extensions made of Polygel — a hybrid material combining the strength of acrylic and the flexibility of gel. Offers absolute shape control and incomparable wearing comfort.</p>'),

('d43be612-4cfb-4a58-86d9-86ab8e7b9ee9', 'Capsule sur ongle', 'Gel x pose américaine', 'Gel-X Extensions', 10000, 50, 90, 'gel-x-pose-americaine', true, false,
 '<p>La technique révolutionnaire d''extensions rapides. Des capsules entièrement faites de gel souple sont fixées sur la totalité de l''ongle naturel à l''aide d''une base gel spécifique catalysée sous LED. Offre une longueur parfaite instantanée.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>La solution idéale pour une longueur parfaite rapide, confortable et facile à retirer.</p>',
 '<p>The revolutionary fast extension technique. Tips entirely made of soft gel are applied over the entire natural nail using a specific gel base cured under LED. Provides instant perfect length.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>The ideal solution for fast, comfortable perfect length that is easy to remove.</p>'),

('18f8e02d-eb3b-489e-8c34-eb17a78ef3a7', 'Capsule sur ongle', 'Remplissage', 'Extensions Refill', 7000, 60, 105, 'remplissage-extensions', true, false,
 '<p>L''entretien indispensable de vos extensions sur capsules. Nous comblons la repousse à la base de l''ongle avec du gel, nettoyons les cuticules et ré-équilibrons l''architecture de la pose pour assurer sa solidité.</p>',
 '<p>The essential maintenance of your tip extensions. We fill the regrowth at the base of the nail with gel, clean the cuticiles, and rebalance the architecture of the treatment to ensure its strength.</p>'),

('ea9401d2-d278-43d9-959c-6a7516b3f71c', 'Supplément', 'Strass, chrome, effets, dessins', 'Nail Art Extras', 1000, 10, 20, 'strass-chrome-effets-dessins', true, true,
 '<p>Personnalisez votre pose avec nos options de Nail Art couture : strass premium fixés à la main, effet miroir chrome, baby boomer délicat, french classique ou dessins personnalisés.</p>',
 '<p>Personalize your look with our couture Nail Art options: hand-applied premium rhinestones, mirror chrome effect, delicate baby boomer, classic french, or custom designs.</p>'),

('cf3a1e2b-f81d-4de8-9b88-51829e061803', 'Dépose', 'Gel, gainage, semi-permanent', 'Removal Service', 2000, 10, 30, 'gel-gainage-semi-permanent-depose', true, false,
 '<p>Le retrait de votre ancienne pose effectué dans le respect absolu de la santé de vos ongles. Comprend la dépose douce par ponçage ou trempage doux, le soin cuticules et l''application d''une huile hydratante.</p>',
 '<p>The removal of your old application done with absolute respect for the health of your nails. Includes gentle filing or soaking removal, cuticle care, and application of a moisturizing oil.</p>')
ON CONFLICT (id) DO UPDATE SET 
  name_en = EXCLUDED.name_en,
  duration_mins = EXCLUDED.duration_mins,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  description_en = EXCLUDED.description_en;


-- ─── 11. REFRESH SCHEMA ───────────────────────────────────────────────────────────

NOTIFY pgrst, 'reload schema';

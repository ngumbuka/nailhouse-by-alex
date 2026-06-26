-- Create profiles table if not exists
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
  allergies_contraindications text
);

-- RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Grants
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- BEFORE INSERT trigger on auth.users to auto-confirm emails
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

-- AFTER INSERT trigger on auth.users to auto-create public.profiles
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
    allergies_contraindications
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
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

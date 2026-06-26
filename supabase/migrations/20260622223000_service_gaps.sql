-- Add Service Management enhancements
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_addon boolean DEFAULT false;

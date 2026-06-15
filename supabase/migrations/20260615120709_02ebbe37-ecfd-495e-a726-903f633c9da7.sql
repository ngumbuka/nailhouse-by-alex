
-- 1. Tighten bookings INSERT policy
DROP POLICY IF EXISTS "Anyone can create booking" ON public.bookings;
CREATE POLICY "Anyone can create booking"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
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

-- 2. Tighten newsletter INSERT policy
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_emails;
CREATE POLICY "Anyone can subscribe"
ON public.newsletter_emails
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(email) <= 254
);

-- 3. Lock down user_roles writes to admins only (explicit policies)
DROP POLICY IF EXISTS "Admins manage user_roles" ON public.user_roles;
CREATE POLICY "Admins manage user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Restrict SECURITY DEFINER has_role: not callable directly by anon/authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

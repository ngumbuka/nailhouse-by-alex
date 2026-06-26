-- Add admin_comment and proposed_scheduled_at columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS admin_comment text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS proposed_scheduled_at timestamptz;

-- Policy to allow users to view their own bookings based on email
DROP POLICY IF EXISTS "Users can read own bookings" ON public.bookings;
CREATE POLICY "Users can read own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (email = (auth.jwt()->>'email'));

-- Policy to allow users to update their own bookings (e.g. reschedule or edit notes, accept admin proposed reschedule)
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (email = (auth.jwt()->>'email'))
  WITH CHECK (email = (auth.jwt()->>'email'));

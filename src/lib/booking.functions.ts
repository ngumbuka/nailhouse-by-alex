import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(6).max(30),
  email: z.string().email(),
  service_id: z.string().uuid().nullable().optional(),
  service_name: z.string().min(1).max(200),
  scheduled_at: z.string().min(8),
  notes: z.string().max(1000).optional().nullable(),
});

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("id, category, name, price_fcfa, sort")
    .order("sort", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listGalleryImages = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("gallery_images")
    .select("id, url, caption, sort")
    .order("sort", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        name: data.name,
        phone: data.phone,
        email: data.email,
        service_id: data.service_id ?? null,
        service_name: data.service_name,
        scheduled_at: data.scheduled_at,
        notes: data.notes ?? null,
        status: "pending",
      })
      .select("id, scheduled_at, service_name")
      .single();
    if (error) throw new Error(error.message);

    // Optional: Google Calendar (skips silently when unconfigured).
    try {
      const { addBookingToCalendar } = await import("@/lib/calendar.server");
      const eventId = await addBookingToCalendar({
        summary: `NailHouse — ${data.service_name} — ${data.name}`,
        description: `Téléphone: ${data.phone}\nEmail: ${data.email}\nNotes: ${data.notes ?? "—"}`,
        startISO: data.scheduled_at,
      });
      if (eventId) {
        await supabaseAdmin.from("bookings").update({ calendar_event_id: eventId }).eq("id", booking.id);
      }
    } catch (err) {
      console.error("[calendar] add event failed", err);
    }

    return { id: booking.id };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_emails")
      .upsert({ email: data.email.toLowerCase() }, { onConflict: "email", ignoreDuplicates: true });
    if (error && !`${error.message}`.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

// @ts-nocheck
import { type SupabaseClient } from "@supabase/supabase-js";
import { type Database } from "@/integrations/supabase/types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import * as db from "@/lib/db";
import { sendBookingUpdateNotification } from "./whatsapp";
import { processMediaUpload, processMultipleMediaUploads } from "./cloudinary.server";
async function assertAdmin(ctx: {
  supabase: SupabaseClient<Database>;
  userId: string;
  claims?: Record<string, unknown>;
}) {
  // 1. Check real DB profile first
  const { data } = await ctx.supabase
    .from("profiles")
    .select("role")
    .eq("id", ctx.userId)
    .maybeSingle();

  if (data?.role === "admin") return; // Authorized

  // 2. Fallback to mock logic for local dev / unmigrated accounts
  const email = ctx.claims?.email;
  const role = db.getMockUserRole(ctx.userId, email);
  if (role !== "admin") throw new Error("Forbidden: Admin access required");
}

async function fetchBooking(id: string) {
  if (db.USE_MOCK_DB) {
    const bookings = await db.listBookings();
    return bookings.find((b) => b.id === id) || null;
  } else {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}

export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertAdmin(context);
      return { isAdmin: true };
    } catch {
      return { isAdmin: false };
    }
  });

// ─── CLIENTS ─────────────────────────────────────────────────────────────────
export const adminListClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const clients = await db.listProfiles();
    // For each client, fetch their bookings count and favorite services count
    const bookings = await db.listBookings();
    const allServices = await db.listServices();

    return clients.map((c) => {
      const cBookings = bookings.filter((b) => b.email.toLowerCase() === c.email.toLowerCase());
      return {
        ...c,
        bookingsCount: cBookings.length,
      };
    });
  });

// ─── BOOKINGS ────────────────────────────────────────────────────────────────
export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return db.listBookings();
  });

export const adminUpdateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const booking = await fetchBooking(data.id);
    const result = await db.updateBookingStatus(data.id, data.status);

    if (result && booking) {
      // Client notification
      await sendBookingUpdateNotification(
        { ...booking, followup_preference: booking.followup_preference || "messages" },
        data.status,
      );

      // Google Calendar sync
      try {
        const calEventId = (booking as Record<string, unknown>).calendar_event_id as
          | string
          | undefined;
        const { deleteCalendarEvent, updateCalendarEvent } = await import("@/lib/calendar.server");
        if (data.status === "cancelled" && calEventId) {
          // Remove the event from calendar when cancelled
          await deleteCalendarEvent(calEventId);
        } else if (calEventId) {
          // Update summary to reflect new status
          await updateCalendarEvent({
            eventId: calEventId,
            summary: `[${data.status.toUpperCase()}] NailHouse — ${booking.service_name} — ${booking.name}`,
          });
        }
      } catch (err) {
        console.error("[calendar] adminUpdateBookingStatus sync failed", err);
      }
    }

    return result;
  });

export const adminCreateBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(2),
        phone: z.string().min(6),
        email: z.string().email(),
        service_id: z.string().nullable().optional(),
        service_name: z.string().min(1),
        scheduled_at: z.string(),
        notes: z.string().nullable().optional(),
        followup_preference: z.enum(["call", "messages", "email"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const booking = await db.createBooking({
      ...data,
      service_ids: data.service_id ? [data.service_id] : null,
      service_names: [data.service_name],
      followup_preference: data.followup_preference || "messages",
    });

    if (booking) {
      // Notifications
      await sendBookingUpdateNotification(booking, "confirmed");

      // Google Calendar sync
      try {
        const { addBookingToCalendar } = await import("@/lib/calendar.server");
        const eventId = await addBookingToCalendar({
          summary: `NailHouse — ${data.service_name} — ${data.name}`,
          description: `Téléphone: ${data.phone}\nEmail: ${data.email}\nNotes: ${data.notes ?? "—"}\nCreated by admin`,
          startISO: data.scheduled_at,
        });
        if (eventId && !db.USE_MOCK_DB) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin
            .from("bookings")
            .update({ calendar_event_id: eventId })
            .eq("id", booking.id);
        }
      } catch (err) {
        console.error("[calendar] adminCreateBooking sync failed", err);
      }
    }

    return booking;
  });

// ─── SERVICES ────────────────────────────────────────────────────────────────
export const adminListServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return db.listServices();
  });

export const adminAddService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(1),
        name_en: z.string().optional(),
        category: z.string().min(1),
        price_fcfa: z.number().int().positive(),
        duration_mins: z.number().int().positive(),
        description: z.string().min(1),
        description_en: z.string().optional(),
        slug: z.string().min(1),
        highlights: z.array(z.string()).optional(),
        best_for: z.string().optional(),
        seasonal_price_fcfa: z.number().nullable().optional(),
        seasonal_price_start: z.string().nullable().optional(),
        seasonal_price_end: z.string().nullable().optional(),
        is_active: z.boolean().optional(),
        sort: z.number().optional(),
        image_url: z.string().nullable().optional(),
        is_addon: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    data.image_url = await processMediaUpload(data.image_url, "nailhouse/services");
    return db.addService(data);
  });

export const adminUpdateService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        name: z.string().min(1),
        name_en: z.string().optional(),
        category: z.string().min(1),
        price_fcfa: z.number().int().positive(),
        duration_mins: z.number().int().positive(),
        description: z.string().min(1),
        description_en: z.string().optional(),
        slug: z.string().min(1),
        highlights: z.array(z.string()).optional(),
        best_for: z.string().optional(),
        seasonal_price_fcfa: z.number().nullable().optional(),
        seasonal_price_start: z.string().nullable().optional(),
        seasonal_price_end: z.string().nullable().optional(),
        is_active: z.boolean().optional(),
        sort: z.number().optional(),
        image_url: z.string().nullable().optional(),
        is_addon: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    data.image_url = await processMediaUpload(data.image_url, "nailhouse/services");
    return db.updateService(data.id, data);
  });

export const adminDeleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.deleteService(data.id);
  });

// ─── SERVICE CATEGORIES ──────────────────────────────────────────────────────
export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return db.listServiceCategories();
  });

export const adminAddCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        category: z.string().min(1),
        title: z.string().min(1),
        tagline: z.string().min(1),
        intro: z.string().min(1),
        duration: z.string().min(1),
        image: z.string().nullable().optional(),
        flat: z.string().nullable().optional(),
        highlights: z.array(z.string()).default([]),
        care: z.array(z.string()).default([]),
        steps: z
          .array(
            z.object({
              title: z.string().min(1),
              description: z.string().min(1),
            }),
          )
          .default([]),
        whyUs: z.array(z.string()).default([]),
        gallery: z.array(z.string()).default([]),
        faq: z
          .array(
            z.object({
              q: z.string().min(1),
              a: z.string().min(1),
            }),
          )
          .default([]),
        bestFor: z.string().min(1),
        sort: z.number().int().default(0),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    data.image = await processMediaUpload(data.image, "nailhouse/categories");
    data.flat = await processMediaUpload(data.flat, "nailhouse/categories");
    data.gallery =
      (await processMultipleMediaUploads(data.gallery, "nailhouse/categories/gallery")) || [];
    return db.addServiceCategory(data);
  });

export const adminUpdateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        category: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        tagline: z.string().min(1).optional(),
        intro: z.string().min(1).optional(),
        duration: z.string().min(1).optional(),
        image: z.string().nullable().optional(),
        flat: z.string().nullable().optional(),
        highlights: z.array(z.string()).optional(),
        care: z.array(z.string()).optional(),
        steps: z
          .array(
            z.object({
              title: z.string().min(1),
              description: z.string().min(1),
            }),
          )
          .optional(),
        whyUs: z.array(z.string()).optional(),
        gallery: z.array(z.string()).optional(),
        faq: z
          .array(
            z.object({
              q: z.string().min(1),
              a: z.string().min(1),
            }),
          )
          .optional(),
        bestFor: z.string().min(1).optional(),
        sort: z.number().int().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    data.image = await processMediaUpload(data.image, "nailhouse/categories");
    data.flat = await processMediaUpload(data.flat, "nailhouse/categories");
    if (data.gallery) {
      data.gallery =
        (await processMultipleMediaUploads(data.gallery, "nailhouse/categories/gallery")) || [];
    }
    return db.updateServiceCategory(data.slug, data);
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.deleteServiceCategory(data.slug);
  });

// ─── GALLERY ─────────────────────────────────────────────────────────────────

export const adminListGallery = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return db.listGalleryImages();
  });

export const adminAddGalleryByUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ url: z.string().min(1), caption: z.string().max(200).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    data.url = (await processMediaUpload(data.url, "nailhouse/gallery")) || data.url;
    return db.addGalleryImage(data.url, data.caption);
  });

export const adminDeleteGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.deleteGalleryImage(data.id);
  });

// ─── SUBSCRIBERS ─────────────────────────────────────────────────────────────
export const adminListSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return db.listSubscribers();
  });

// ─── MESSAGES / CHAT ─────────────────────────────────────────────────────────
export const adminListAllMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return db.listAllMessagesForAdmin();
  });

export const adminSendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ receiverId: z.string(), message: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.sendMessage(context.userId, data.receiverId, data.message);
  });

export const adminUpdateBookingDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        notes: z.string().optional().nullable(),
        scheduled_at: z.string().optional().nullable(),
        proposed_scheduled_at: z.string().optional().nullable(),
        admin_comment: z.string().optional().nullable(),
        status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const booking = await fetchBooking(data.id);

    const updates: Partial<Omit<db.MockBooking, "id" | "created_at">> = {};
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.scheduled_at !== undefined) updates.scheduled_at = data.scheduled_at;
    if (data.proposed_scheduled_at !== undefined)
      updates.proposed_scheduled_at = data.proposed_scheduled_at;
    if (data.admin_comment !== undefined) updates.admin_comment = data.admin_comment;
    if (data.status !== undefined) updates.status = data.status;

    const result = await db.updateBookingDetails(data.id, updates);

    if (result && booking) {
      // Re-fetch the booking or merge updates to get followup_preference
      const updatedBooking = await fetchBooking(data.id);
      const bookingForNotif = updatedBooking || { ...booking, ...updates };

      if (data.scheduled_at && data.scheduled_at !== booking.scheduled_at) {
        // Explicit rescheduled date — notify + update calendar
        await sendBookingUpdateNotification(bookingForNotif, "rescheduled");

        try {
          const calEventId = (booking as Record<string, unknown>).calendar_event_id as
            | string
            | undefined;
          const { updateCalendarEvent } = await import("@/lib/calendar.server");
          if (calEventId) {
            await updateCalendarEvent({
              eventId: calEventId,
              summary: `NailHouse — ${booking.service_name} — ${booking.name}`,
              description: `Téléphone: ${booking.phone}\nEmail: ${booking.email}\nNotes: ${booking.notes ?? "—"}\nRescheduled`,
              startISO: data.scheduled_at,
            });
          }
        } catch (err) {
          console.error("[calendar] rescheduled event update failed", err);
        }
      } else if (
        data.proposed_scheduled_at &&
        data.proposed_scheduled_at !== booking.proposed_scheduled_at
      ) {
        // Admin proposed a reschedule to client — notify only (event not confirmed yet)
        await sendBookingUpdateNotification(bookingForNotif, "proposed_rescheduled", {
          proposedTime: data.proposed_scheduled_at,
          adminComment: data.admin_comment,
        });
      } else if (data.status && data.status !== booking.status) {
        // Status updated directly inside details
        await sendBookingUpdateNotification(bookingForNotif, data.status);
      }
    }

    return result;
  });

export const adminListPromotions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return db.listPromotions();
  });

export const adminCreatePromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        code: z.string().min(1),
        discount_percent: z.number().int().min(0).max(100),
        description: z.string().min(1),
        description_en: z.string().optional(),
        active: z.boolean(),
        service_id: z.string().optional().nullable(),
        start_date: z.string().optional().nullable(),
        end_date: z.string().optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.createPromotion(data);
  });

export const adminDeletePromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.deletePromotion(data.id);
  });

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return db.getSettings();
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        opening_time: z.string(),
        closing_time: z.string(),
        closed_days: z.array(z.number()),
        blocked_dates: z.array(z.string()),
        buffer_time_mins: z.number().int().min(0),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.updateSettings(data);
  });

// ─── VIDEOS ─────────────────────────────────────────────────────────────────
export const adminListVideos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return db.listVideos();
  });

export const adminAddVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        url: z.string().min(1),
        title: z.string().min(1),
        description: z.string(),
        category: z.string(),
        active: z.boolean(),
        sort: z.number().int(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    data.url = (await processMediaUpload(data.url, "nailhouse/videos")) || data.url;
    return db.addVideo(data);
  });

export const adminUpdateVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        url: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        active: z.boolean().optional(),
        sort: z.number().int().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.url) {
      data.url = (await processMediaUpload(data.url, "nailhouse/videos")) || data.url;
    }
    return db.updateVideo(data.id, data);
  });

export const adminDeleteVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.deleteVideo(data.id);
  });

import { type SupabaseClient } from "@supabase/supabase-js";
import { type Database } from "@/integrations/supabase/types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import * as db from "@/lib/db";

async function assertAdmin(ctx: { supabase: SupabaseClient<Database>; userId: string }) {
  const role = db.getMockUserRole(ctx.userId);
  if (role !== "admin") throw new Error("Forbidden: Admin access required");
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
    return db.updateBookingStatus(data.id, data.status);
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
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.createBooking({
      ...data,
      service_ids: data.service_id ? [data.service_id] : null,
      service_names: [data.service_name],
    });
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
        category: z.string().min(1),
        price_fcfa: z.number().int().positive(),
        duration_mins: z.number().int().positive(),
        description: z.string().min(1),
        slug: z.string().min(1),
        highlights: z.array(z.string()).optional(),
        best_for: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.addService(data);
  });

export const adminUpdateService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        name: z.string().min(1),
        category: z.string().min(1),
        price_fcfa: z.number().int().positive(),
        duration_mins: z.number().int().positive(),
        description: z.string().min(1),
        slug: z.string().min(1),
        highlights: z.array(z.string()).optional(),
        best_for: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.updateService(data.id, data);
  });

export const adminDeleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return db.deleteService(data.id);
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
    z.object({ url: z.string().url(), caption: z.string().max(200).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
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

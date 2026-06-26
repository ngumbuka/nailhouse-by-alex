import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import * as db from "@/lib/db";

export const getUserProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return db.getProfile(context.userId, context.claims.email);
  });

export const updateUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(2).max(100),
        phone: z.string().max(30),
        birthday: z.string().max(10).optional().nullable(),
        preferred_stylist: z.string().max(100).optional().nullable(),
        instagram: z.string().max(100).optional().nullable(),
        preferred_length: z.enum(["short", "medium", "long", "none"]).optional(),
        preferred_shape: z
          .enum(["round", "square", "oval", "almond", "coffin", "stiletto", "none"])
          .optional(),
        preferred_style: z
          .enum(["natural", "classic", "french", "nail_art", "biab", "none"])
          .optional(),
        allergies_contraindications: z.string().max(1000).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    return db.updateProfile(context.userId, {
      name: data.name,
      phone: data.phone,
      email: context.claims.email || "",
      birthday: data.birthday || "",
      preferred_stylist: data.preferred_stylist || "",
      instagram: data.instagram || "",
      preferred_length: data.preferred_length || "none",
      preferred_shape: data.preferred_shape || "none",
      preferred_style: data.preferred_style || "none",
      allergies_contraindications: data.allergies_contraindications || "",
    });
  });

export const getUserBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = context.claims.email;
    if (!email) return [];
    return db.listBookingsForUser(email);
  });

export const cancelUserBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    // Verify booking belongs to user
    const email = context.claims.email;
    if (!email) throw new Error("Unauthorized");
    const bookings = await db.listBookingsForUser(email);
    const booking = bookings.find((b) => b.id === data.id);
    if (!booking) throw new Error("Booking not found");

    return db.updateBookingStatus(data.id, "cancelled");
  });

export const getUserFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const favs = await db.listFavorites(context.userId);
    const services = await db.listServices();
    // Return service data for matching favorites
    return services.filter((s) => favs.some((f) => f.service_id === s.id));
  });

export const removeUserFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ serviceId: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    return db.removeFavorite(context.userId, data.serviceId);
  });

export const addUserFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ serviceId: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    return db.addFavorite(context.userId, data.serviceId);
  });

export const getUserMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return db.listMessages(context.userId);
  });

export const sendUserMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ message: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    // Send to admin-id
    return db.sendMessage(context.userId, "mock-admin-id-456", data.message);
  });

export const getUserNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return db.listNotifications(context.userId);
  });

export const markUserNotificationsAsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return db.markNotificationsAsRead(context.userId);
  });

export const updateUserBookingDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        notes: z.string().optional().nullable(),
        scheduled_at: z.string().optional().nullable(),
        proposed_scheduled_at: z.string().optional().nullable(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const email = context.claims.email;
    if (!email) throw new Error("Unauthorized");
    const bookings = await db.listBookingsForUser(email);
    const booking = bookings.find((b) => b.id === data.id);
    if (!booking) throw new Error("Booking not found");

    const updates: Partial<Omit<db.MockBooking, "id" | "created_at">> = {};
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.scheduled_at !== undefined) updates.scheduled_at = data.scheduled_at;
    if (data.proposed_scheduled_at !== undefined)
      updates.proposed_scheduled_at = data.proposed_scheduled_at;
    if (data.status !== undefined) updates.status = data.status;

    return db.updateBookingDetails(data.id, updates);
  });

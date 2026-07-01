// @ts-nocheck
import {
  readMockDB,
  writeMockDB,
  MockProfile,
  MockBooking,
  MockGalleryImage,
  MockMessage,
  MockNotification,
  MockFavorite,
  MockSubscriber,
  MockService,
  MockReview,
  MockPromotion,
  MockSettings,
  MockVideo,
} from "./mock-db";
import { supabaseAdmin as supabase } from "@/integrations/supabase/client.server";
import { CategoryInfo } from "./service-categories";

// Set to false to mutate entirely to real Supabase
export const USE_MOCK_DB = false;

// Helper to check role
export function getMockUserRole(userId: string, email?: string): "admin" | "client" {
  const db = readMockDB();
  const prof = db.profiles.find((p) => p.id === userId);
  return (
    prof?.role ?? (userId.includes("admin") || email === "admin@nailhouse.com" ? "admin" : "client")
  );
}

// ─── PROFILES ────────────────────────────────────────────────────────────────
export async function getProfile(userId: string, email?: string): Promise<MockProfile> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    let prof = db.profiles.find((p) => p.id === userId);
    if (!prof) {
      prof = {
        id: userId,
        email: email || "user@example.com",
        name: email ? email.split("@")[0] : "Client",
        phone: "",
        role: userId.includes("admin") || email === "admin@nailhouse.com" ? "admin" : "client",
        created_at: new Date().toISOString(),
        newsletter: true,
        birthday: "",
        preferred_stylist: "",
        instagram: "",
        preferred_length: "none",
        preferred_shape: "none",
        preferred_style: "none",
        allergies_contraindications: "",
        followup_preference: "messages",
      };
      db.profiles.push(prof);
      writeMockDB(db);
    }
    return prof;
  } else {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      // Create profile using SDK
      const newProf = {
        id: userId,
        email: email || "",
        name: email ? email.split("@")[0] : "Client",
        phone: "",
        role: "client" as const,
      };
      const { data: inserted, error: insErr } = await supabase
        .from("profiles")
        .insert(newProf)
        .select()
        .single();
      if (insErr) throw insErr;
      return {
        ...inserted,
        role: inserted.role as "admin" | "client",
        newsletter: true,
        birthday: "",
        preferred_stylist: "",
        instagram: "",
        preferred_length: "none",
        preferred_shape: "none",
        preferred_style: "none",
        allergies_contraindications: "",
        followup_preference: "messages",
      };
    }
    return {
      id: data.id,
      email: data.email || "",
      name: data.name || "",
      phone: data.phone || "",
      role: (data.role || "client") as "admin" | "client",
      created_at: data.created_at || new Date().toISOString(),
      newsletter: true,
      birthday: data.birthday || "",
      preferred_stylist: data.preferred_stylist || "",
      instagram: data.instagram || "",
      preferred_length: (data.preferred_length || "none") as "short" | "medium" | "long" | "none",
      preferred_shape: (data.preferred_shape || "none") as
        | "round"
        | "square"
        | "oval"
        | "almond"
        | "coffin"
        | "stiletto"
        | "none",
      preferred_style: (data.preferred_style || "none") as
        | "natural"
        | "classic"
        | "french"
        | "nail_art"
        | "biab"
        | "none",
      allergies_contraindications: data.allergies_contraindications || "",
      followup_preference: (data.followup_preference || "messages") as
        | "call"
        | "messages"
        | "email",
    };
  }
}

export async function updateProfile(
  userId: string,
  data: Partial<MockProfile>,
): Promise<MockProfile> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const idx = db.profiles.findIndex((p) => p.id === userId);
    if (idx === -1) throw new Error("Profile not found");
    db.profiles[idx] = { ...db.profiles[idx], ...data };
    writeMockDB(db);
    return db.profiles[idx];
  } else {
    const { data: updated, error } = await supabase
      .from("profiles")
      .update({
        name: data.name,
        phone: data.phone,
        email: data.email,
        birthday: data.birthday,
        preferred_stylist: data.preferred_stylist,
        instagram: data.instagram,
        preferred_length: data.preferred_length,
        preferred_shape: data.preferred_shape,
        preferred_style: data.preferred_style,
        allergies_contraindications: data.allergies_contraindications,
        followup_preference: data.followup_preference,
      })
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: updated.id,
      email: updated.email || "",
      name: updated.name || "",
      phone: updated.phone || "",
      role: (updated.role || "client") as "admin" | "client",
      created_at: updated.created_at || new Date().toISOString(),
      newsletter: true,
      birthday: updated.birthday || "",
      preferred_stylist: updated.preferred_stylist || "",
      instagram: updated.instagram || "",
      preferred_length: (updated.preferred_length || "none") as
        | "short"
        | "medium"
        | "long"
        | "none",
      preferred_shape: (updated.preferred_shape || "none") as
        | "round"
        | "square"
        | "oval"
        | "almond"
        | "coffin"
        | "stiletto"
        | "none",
      preferred_style: (updated.preferred_style || "none") as
        | "natural"
        | "classic"
        | "french"
        | "nail_art"
        | "biab"
        | "none",
      allergies_contraindications: updated.allergies_contraindications || "",
      followup_preference: (updated.followup_preference || "messages") as
        | "call"
        | "messages"
        | "email",
    };
  }
}

export async function listProfiles(): Promise<MockProfile[]> {
  if (USE_MOCK_DB) {
    return readMockDB().profiles;
  } else {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) throw error;
    return (data || []).map((p) => ({
      id: p.id,
      email: p.email || "",
      name: p.name || "",
      phone: p.phone || "",
      role: (p.role || "client") as "admin" | "client",
      created_at: p.created_at || new Date().toISOString(),
      newsletter: true,
      birthday: p.birthday || "",
      preferred_stylist: p.preferred_stylist || "",
      instagram: p.instagram || "",
      preferred_length: (p.preferred_length || "none") as "short" | "medium" | "long" | "none",
      preferred_shape: (p.preferred_shape || "none") as
        | "round"
        | "square"
        | "oval"
        | "almond"
        | "coffin"
        | "stiletto"
        | "none",
      preferred_style: (p.preferred_style || "none") as
        | "natural"
        | "classic"
        | "french"
        | "nail_art"
        | "biab"
        | "none",
      allergies_contraindications: p.allergies_contraindications || "",
      followup_preference: (p.followup_preference || "messages") as "call" | "messages" | "email",
    }));
  }
}

// ─── BOOKINGS ────────────────────────────────────────────────────────────────
export async function listBookings(): Promise<MockBooking[]> {
  if (USE_MOCK_DB) {
    return readMockDB().bookings;
  } else {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("scheduled_at", { ascending: false });
    if (error) throw error;
    return (data || []) as MockBooking[];
  }
}

export async function listBookingsForUser(email: string): Promise<MockBooking[]> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    return db.bookings.filter((b) => b.email.toLowerCase() === email.toLowerCase());
  } else {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("email", email)
      .order("scheduled_at", { ascending: false });
    if (error) throw error;
    return (data || []) as MockBooking[];
  }
}

export async function createBooking(
  booking: Omit<MockBooking, "id" | "status" | "created_at">,
): Promise<MockBooking> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const newBooking: MockBooking = {
      ...booking,
      id: "booking-" + Math.random().toString(36).substr(2, 9),
      status: "pending",
      created_at: new Date().toISOString(),
    };
    db.bookings.push(newBooking);
    // Auto-create notification for user
    const userProf = db.profiles.find((p) => p.email.toLowerCase() === booking.email.toLowerCase());
    if (userProf) {
      db.notifications.push({
        id: "notif-" + Math.random().toString(36).substr(2, 9),
        user_id: userProf.id,
        title: "Nouvelle réservation",
        message: `Votre demande de rendez-vous pour ${booking.service_name} a été enregistrée.`,
        read: false,
        created_at: new Date().toISOString(),
      });
    }
    writeMockDB(db);
    return newBooking;
  } else {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        ...booking,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw error;
    return data as MockBooking;
  }
}

export async function updateBookingStatus(
  id: string,
  status: "pending" | "confirmed" | "completed" | "cancelled",
): Promise<boolean> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    db.bookings[idx].status = status;

    // Send notifications to client on status update
    const userProf = db.profiles.find(
      (p) => p.email.toLowerCase() === db.bookings[idx].email.toLowerCase(),
    );
    if (userProf) {
      const statusFr =
        status === "confirmed"
          ? "confirmé"
          : status === "completed"
            ? "terminé"
            : status === "cancelled"
              ? "annulé"
              : "en attente";
      db.notifications.push({
        id: "notif-" + Math.random().toString(36).substr(2, 9),
        user_id: userProf.id,
        title: "Statut mis à jour",
        message: `Votre rendez-vous pour ${db.bookings[idx].service_name} est désormais ${statusFr}.`,
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    writeMockDB(db);
    return true;
  } else {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) throw error;
    return true;
  }
}

export async function updateBookingDetails(
  id: string,
  updates: Partial<Omit<MockBooking, "id" | "created_at">>,
): Promise<boolean> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    db.bookings[idx] = {
      ...db.bookings[idx],
      ...updates,
    };

    // If status changed or rescheduling, add a notification
    const userProf = db.profiles.find(
      (p) => p.email.toLowerCase() === db.bookings[idx].email.toLowerCase(),
    );
    if (userProf) {
      if (updates.status) {
        const statusFr =
          updates.status === "confirmed"
            ? "confirmé"
            : updates.status === "completed"
              ? "terminé"
              : updates.status === "cancelled"
                ? "annulé"
                : "en attente";
        db.notifications.push({
          id: "notif-" + Math.random().toString(36).substr(2, 9),
          user_id: userProf.id,
          title: "Statut mis à jour",
          message: `Votre rendez-vous pour ${db.bookings[idx].service_name} est désormais ${statusFr}.`,
          read: false,
          created_at: new Date().toISOString(),
        });
      } else if (updates.proposed_scheduled_at) {
        db.notifications.push({
          id: "notif-" + Math.random().toString(36).substr(2, 9),
          user_id: userProf.id,
          title: "Proposition de report",
          message: `L'administration propose de reporter votre rendez-vous pour ${db.bookings[idx].service_name}.`,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    writeMockDB(db);
    return true;
  } else {
    const { error } = await supabase.from("bookings").update(updates).eq("id", id);
    if (error) throw error;
    return true;
  }
}

// ─── SERVICES ────────────────────────────────────────────────────────────────
export async function listServices() {
  if (USE_MOCK_DB) {
    return readMockDB().services;
  } else {
    const { data, error } = await supabase.from("services").select("*");
    if (error) throw error;
    return data || [];
  }
}

export async function addService(
  service: Omit<MockService, "id"> & { id?: string },
): Promise<MockService> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const newService = {
      ...service,
      id: service.id || "svc-" + Math.random().toString(36).substr(2, 9),
    };
    db.services.push(newService);
    writeMockDB(db);
    return newService;
  } else {
    const { data, error } = await supabase
      .from("services")
      .insert(service as unknown as Record<string, unknown>)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as MockService;
  }
}

export async function updateService(
  id: string,
  service: Partial<MockService>,
): Promise<MockService | null> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const idx = db.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    db.services[idx] = { ...db.services[idx], ...service };
    writeMockDB(db);
    return db.services[idx];
  } else {
    const { data, error } = await supabase
      .from("services")
      .update(service as unknown as Record<string, unknown>)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as MockService;
  }
}

export async function deleteService(id: string) {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    db.services = db.services.filter((s) => s.id !== id);
    writeMockDB(db);
    return true;
  } else {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
}

// ─── SERVICE CATEGORIES ──────────────────────────────────────────────────────
export async function listServiceCategories(): Promise<CategoryInfo[]> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    return (db.categories || []).sort((a, b) => (a.sort || 0) - (b.sort || 0));
  } else {
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .order("sort", { ascending: true });
    if (error) throw error;

    return (data || []).map((cat) => ({
      slug: cat.slug,
      category: cat.category,
      title: cat.title,
      tagline: cat.tagline,
      intro: cat.intro,
      duration: cat.duration,
      image: cat.image,
      flat: cat.flat,
      highlights: cat.highlights || [],
      care: cat.care || [],
      steps: cat.steps || [],
      whyUs: cat.why_us || [],
      gallery: cat.gallery || [],
      faq: cat.faq || [],
      bestFor: cat.best_for,
      sort: cat.sort || 0,
    }));
  }
}

export async function addServiceCategory(category: CategoryInfo): Promise<CategoryInfo> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    if (!db.categories) db.categories = [];
    db.categories.push(category);
    writeMockDB(db);
    return category;
  } else {
    const pgCategory = {
      slug: category.slug,
      category: category.category,
      title: category.title,
      tagline: category.tagline,
      intro: category.intro,
      duration: category.duration,
      image: category.image || null,
      flat: category.flat || null,
      highlights: category.highlights || [],
      care: category.care || [],
      steps: category.steps || [],
      why_us: category.whyUs || [],
      gallery: category.gallery || [],
      faq: category.faq || [],
      best_for: category.bestFor,
      sort: category.sort || 0,
    };
    const { data, error } = await supabase
      .from("service_categories")
      .insert(pgCategory)
      .select()
      .single();
    if (error) throw error;
    return {
      ...data,
      whyUs: data.why_us,
      bestFor: data.best_for,
    };
  }
}

export async function updateServiceCategory(
  slug: string,
  updates: Partial<CategoryInfo>,
): Promise<CategoryInfo | null> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const idx = db.categories.findIndex((c) => c.slug === slug);
    if (idx === -1) return null;
    db.categories[idx] = { ...db.categories[idx], ...updates };
    writeMockDB(db);
    return db.categories[idx];
  } else {
    const pgUpdates: Record<string, unknown> = {};
    if (updates.category !== undefined) pgUpdates.category = updates.category;
    if (updates.title !== undefined) pgUpdates.title = updates.title;
    if (updates.tagline !== undefined) pgUpdates.tagline = updates.tagline;
    if (updates.intro !== undefined) pgUpdates.intro = updates.intro;
    if (updates.duration !== undefined) pgUpdates.duration = updates.duration;
    if (updates.image !== undefined) pgUpdates.image = updates.image;
    if (updates.flat !== undefined) pgUpdates.flat = updates.flat;
    if (updates.highlights !== undefined) pgUpdates.highlights = updates.highlights;
    if (updates.care !== undefined) pgUpdates.care = updates.care;
    if (updates.steps !== undefined) pgUpdates.steps = updates.steps;
    if (updates.whyUs !== undefined) pgUpdates.why_us = updates.whyUs;
    if (updates.gallery !== undefined) pgUpdates.gallery = updates.gallery;
    if (updates.faq !== undefined) pgUpdates.faq = updates.faq;
    if (updates.bestFor !== undefined) pgUpdates.best_for = updates.bestFor;
    if (updates.sort !== undefined) pgUpdates.sort = updates.sort;

    const { data, error } = await supabase
      .from("service_categories")
      .update(pgUpdates)
      .eq("slug", slug)
      .select()
      .single();
    if (error) throw error;
    return {
      ...data,
      whyUs: data.why_us,
      bestFor: data.best_for,
    };
  }
}

export async function deleteServiceCategory(slug: string): Promise<boolean> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    db.categories = db.categories.filter((c) => c.slug !== slug);
    writeMockDB(db);
    return true;
  } else {
    const { error } = await supabase.from("service_categories").delete().eq("slug", slug);
    if (error) throw error;
    return true;
  }
}

// ─── GALLERY IMAGES ──────────────────────────────────────────────────────────
export async function listGalleryImages(): Promise<MockGalleryImage[]> {
  if (USE_MOCK_DB) {
    return readMockDB().gallery_images;
  } else {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort", { ascending: true });
    if (error) throw error;
    return (data || []) as MockGalleryImage[];
  }
}

export async function addGalleryImage(url: string, caption?: string): Promise<MockGalleryImage> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const newImg: MockGalleryImage = {
      id: "img-" + Math.random().toString(36).substr(2, 9),
      url,
      caption: caption || null,
      sort: db.gallery_images.length + 1,
    };
    db.gallery_images.push(newImg);
    writeMockDB(db);
    return newImg;
  } else {
    const { data, error } = await supabase
      .from("gallery_images")
      .insert({ url, caption: caption || null, sort: 1000 })
      .select()
      .single();
    if (error) throw error;
    return data as MockGalleryImage;
  }
}

export async function deleteGalleryImage(id: string): Promise<boolean> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    db.gallery_images = db.gallery_images.filter((img) => img.id !== id);
    writeMockDB(db);
    return true;
  } else {
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
}

// ─── FAVORITES ───────────────────────────────────────────────────────────────
export async function listFavorites(userId: string): Promise<MockFavorite[]> {
  if (USE_MOCK_DB) {
    return readMockDB().favorites.filter((f) => f.user_id === userId);
  } else {
    const { data, error } = await supabase.from("favorites").select("*").eq("user_id", userId);
    if (error) throw error;
    return (data || []) as MockFavorite[];
  }
}

export async function addFavorite(userId: string, serviceId: string): Promise<MockFavorite> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    let fav = db.favorites.find((f) => f.user_id === userId && f.service_id === serviceId);
    if (!fav) {
      fav = {
        id: "fav-" + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        service_id: serviceId,
        created_at: new Date().toISOString(),
      };
      db.favorites.push(fav);
      writeMockDB(db);
    }
    return fav;
  } else {
    const { data, error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, service_id: serviceId })
      .select()
      .single();
    if (error) throw error;
    return data as MockFavorite;
  }
}

export async function removeFavorite(userId: string, serviceId: string): Promise<boolean> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    db.favorites = db.favorites.filter(
      (f) => !(f.user_id === userId && f.service_id === serviceId),
    );
    writeMockDB(db);
    return true;
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("service_id", serviceId);
    if (error) throw error;
    return true;
  }
}

// ─── MESSAGES / COMMUNICATION ───────────────────────────────────────────────
export async function listMessages(userId: string): Promise<MockMessage[]> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    return db.messages
      .filter((m) => m.sender_id === userId || m.receiver_id === userId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []) as MockMessage[];
  }
}

export async function listAllMessagesForAdmin(): Promise<MockMessage[]> {
  if (USE_MOCK_DB) {
    return readMockDB().messages.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  } else {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []) as MockMessage[];
  }
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  text: string,
): Promise<MockMessage> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const newMsg: MockMessage = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      sender_id: senderId,
      receiver_id: receiverId,
      message: text,
      created_at: new Date().toISOString(),
      read: false,
    };
    db.messages.push(newMsg);
    writeMockDB(db);
    return newMsg;
  } else {
    const { data, error } = await supabase
      .from("messages")
      .insert({ sender_id: senderId, receiver_id: receiverId, message: text })
      .select()
      .single();
    if (error) throw error;
    return data as MockMessage;
  }
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export async function listNotifications(userId: string): Promise<MockNotification[]> {
  if (USE_MOCK_DB) {
    return readMockDB().notifications.filter((n) => n.user_id === userId);
  } else {
    const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId);
    if (error) throw error;
    return (data || []) as MockNotification[];
  }
}

export async function markNotificationsAsRead(userId: string): Promise<boolean> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    db.notifications = db.notifications.map((n) =>
      n.user_id === userId ? { ...n, read: true } : n,
    );
    writeMockDB(db);
    return true;
  } else {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);
    if (error) throw error;
    return true;
  }
}

// ─── SUBSCRIBERS ─────────────────────────────────────────────────────────────
export async function listSubscribers(): Promise<MockSubscriber[]> {
  if (USE_MOCK_DB) {
    return readMockDB().subscribers;
  } else {
    const { data, error } = await supabase.from("newsletter_emails").select("*");
    if (error) throw error;
    return (data || []) as MockSubscriber[];
  }
}

export async function subscribeNewsletter(email: string): Promise<boolean> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const sub = db.subscribers.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (!sub) {
      db.subscribers.push({
        id: "sub-" + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        created_at: new Date().toISOString(),
      });
      writeMockDB(db);
    }
    return true;
  } else {
    const { error } = await supabase.from("newsletter_emails").insert({ email }).select().single();
    if (error) throw error;
    return true;
  }
}

// ─── REVIEWS / COMMENTS ──────────────────────────────────────────────────────
export async function listReviewsForService(serviceId: string) {
  if (USE_MOCK_DB) {
    return readMockDB().reviews.filter((r) => r.service_id === serviceId);
  } else {
    const { data, error } = await supabase
      .from("service_reviews")
      .select("*")
      .eq("service_id", serviceId);
    if (error) {
      console.warn("[listReviewsForService] table unavailable, returning []", error.message);
      return [];
    }
    return data || [];
  }
}

export async function createReview(
  review: Omit<MockReview, "id" | "created_at">,
): Promise<MockReview> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const newRev = {
      ...review,
      id: "rev-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    db.reviews.push(newRev);
    writeMockDB(db);
    return newRev;
  } else {
    const { data, error } = await supabase.from("service_reviews").insert(review).select().single();
    if (error) throw error;
    return data;
  }
}

// ─── PROMOTIONS & DISCOUNTS ──────────────────────────────────────────────────
export async function listPromotions(): Promise<MockPromotion[]> {
  if (USE_MOCK_DB) {
    return readMockDB().promotions;
  } else {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as MockPromotion[]) || [];
  }
}

export async function createPromotion(
  promo: Omit<MockPromotion, "id" | "created_at">,
): Promise<MockPromotion> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const newPromo: MockPromotion = {
      ...promo,
      id: "promo-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    db.promotions.push(newPromo);
    writeMockDB(db);
    return newPromo;
  } else {
    const { data, error } = await supabase
      .from("promotions")
      .insert(promo as unknown as Record<string, unknown>)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as MockPromotion;
  }
}

export async function deletePromotion(id: string): Promise<boolean> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    db.promotions = db.promotions.filter((p) => p.id !== id);
    writeMockDB(db);
    return true;
  } else {
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
}

export async function getPromotionByCode(code: string): Promise<MockPromotion | null> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const promo = db.promotions.find(
      (p) => p.code.toUpperCase() === code.toUpperCase() && p.active,
    );
    return promo || null;
  } else {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as MockPromotion) || null;
  }
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export async function getSettings(): Promise<MockSettings> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    return (
      db.settings || {
        id: "global",
        opening_time: "09:00",
        closing_time: "19:00",
        closed_days: [0],
        blocked_dates: [],
        buffer_time_mins: 0,
      }
    );
  } else {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle();
    if (error && error.code !== "PGRST116") throw error; // Ignore not found error
    return (
      (data as unknown as MockSettings) || {
        id: "global",
        opening_time: "09:00",
        closing_time: "19:00",
        closed_days: [0],
        blocked_dates: [],
        buffer_time_mins: 0,
      }
    );
  }
}

export async function updateSettings(settings: Partial<MockSettings>): Promise<MockSettings> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    db.settings = { ...db.settings, ...settings };
    writeMockDB(db);
    return db.settings;
  } else {
    const { data, error } = await supabase
      .from("settings")
      .update(settings as unknown as Record<string, unknown>)
      .eq("id", "global")
      .select()
      .single();
    if (error) throw error;
    return data as unknown as MockSettings;
  }
}

// ─── VIDEOS ─────────────────────────────────────────────────────────────────
export async function listVideos(): Promise<MockVideo[]> {
  if (USE_MOCK_DB) {
    return readMockDB().videos || [];
  } else {
    // Return mock since videos table may not exist in real supabase schema right now
    return readMockDB().videos || [];
  }
}

export async function addVideo(video: Omit<MockVideo, "id" | "created_at">): Promise<MockVideo> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const newVideo: MockVideo = {
      ...video,
      id: "vid-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    db.videos.push(newVideo);
    writeMockDB(db);
    return newVideo;
  } else {
    // Return mock mock DB implementation
    const db = readMockDB();
    const newVideo: MockVideo = {
      ...video,
      id: "vid-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    db.videos.push(newVideo);
    writeMockDB(db);
    return newVideo;
  }
}

export async function updateVideo(
  id: string,
  video: Partial<MockVideo>,
): Promise<MockVideo | null> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    const idx = db.videos.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    db.videos[idx] = { ...db.videos[idx], ...video };
    writeMockDB(db);
    return db.videos[idx];
  } else {
    const db = readMockDB();
    const idx = db.videos.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    db.videos[idx] = { ...db.videos[idx], ...video };
    writeMockDB(db);
    return db.videos[idx];
  }
}

export async function deleteVideo(id: string): Promise<boolean> {
  if (USE_MOCK_DB) {
    const db = readMockDB();
    db.videos = db.videos.filter((v) => v.id !== id);
    writeMockDB(db);
    return true;
  } else {
    const db = readMockDB();
    db.videos = db.videos.filter((v) => v.id !== id);
    writeMockDB(db);
    return true;
  }
}

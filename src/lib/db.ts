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
} from "./mock-db";
import { supabase } from "@/integrations/supabase/client";

// Set to false to mutate entirely to real Supabase
export const USE_MOCK_DB = true;

// Helper to check role
export function getMockUserRole(userId: string): "admin" | "client" {
  const db = readMockDB();
  const prof = db.profiles.find((p) => p.id === userId);
  return prof?.role ?? (userId.includes("admin") ? "admin" : "client");
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
        role: userId.includes("admin") ? "admin" : "client",
        created_at: new Date().toISOString(),
        newsletter: true,
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
      return { ...inserted, role: inserted.role as "admin" | "client", newsletter: true };
    }
    return {
      id: data.id,
      email: data.email || "",
      name: data.name || "",
      phone: data.phone || "",
      role: (data.role || "client") as "admin" | "client",
      created_at: data.created_at || new Date().toISOString(),
      newsletter: true,
    };
  }
}

export async function updateProfile(
  userId: string,
  data: { name: string; phone: string; email?: string },
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
      .update({ name: data.name, phone: data.phone, email: data.email })
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase.from("services").insert(service).select().single();
    if (error) throw error;
    return data;
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
      .update(service)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.from("subscribers").select("*");
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
    const { error } = await supabase.from("subscribers").insert({ email }).select().single();
    if (error) throw error;
    return true;
  }
}

// ─── REVIEWS / COMMENTS ──────────────────────────────────────────────────────
export async function listReviewsForService(serviceId: string) {
  if (USE_MOCK_DB) {
    return readMockDB().reviews.filter((r) => r.service_id === serviceId);
  } else {
    const { data, error } = await supabase.from("reviews").select("*").eq("service_id", serviceId);
    if (error) throw error;
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
    const { data, error } = await supabase.from("reviews").insert(review).select().single();
    if (error) throw error;
    return data;
  }
}

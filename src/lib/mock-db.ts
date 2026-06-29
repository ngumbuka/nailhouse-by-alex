// @ts-nocheck
import fs from "fs";
import path from "path";
import servicesJson from "@/data/services.json";
import { ASSETS } from "@/lib/assets";
import { CATEGORIES, type CategoryInfo } from "./service-categories";

const DB_PATH = path.join(process.cwd(), "src/data/mock-db.json");

export interface MockProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "admin" | "client";
  created_at: string;
  newsletter: boolean;
  birthday?: string;
  preferred_stylist?: string;
  instagram?: string;
  preferred_length?: "short" | "medium" | "long" | "none";
  preferred_shape?: "round" | "square" | "oval" | "almond" | "coffin" | "stiletto" | "none";
  preferred_style?: "natural" | "classic" | "french" | "nail_art" | "biab" | "none";
  allergies_contraindications?: string;
  followup_preference?: "call" | "messages" | "email";
}

export interface MockBooking {
  id: string;
  name: string;
  phone: string;
  email: string;
  service_id: string | null;
  service_name: string;
  service_ids: string[] | null;
  service_names: string[] | null;
  scheduled_at: string;
  notes: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
  admin_comment?: string | null;
  proposed_scheduled_at?: string | null;
  followup_preference?: "call" | "messages" | "email";
}

export interface MockGalleryImage {
  id: string;
  url: string;
  caption: string | null;
  sort: number;
  title?: string;
  description?: string;
  category?: string;
  service_slug?: string | null;
}

export interface MockMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface MockNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface MockFavorite {
  id: string;
  user_id: string;
  service_id: string;
  created_at: string;
}

export interface MockSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface MockVideo {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  active: boolean;
  sort: number;
  created_at: string;
}

export interface MockService {
  id: string;
  name: string;
  name_en?: string;
  category: string;
  price_fcfa: number;
  duration_mins: number;
  description: string;
  description_en?: string;
  slug: string;
  seasonal_price_fcfa?: number | null;
  seasonal_price_start?: string | null;
  seasonal_price_end?: string | null;
  is_active?: boolean;
  sort?: number;
  image_url?: string | null;
  is_addon?: boolean;
}

export interface MockPromotion {
  id: string;
  code: string;
  discount_percent: number;
  description: string;
  description_en?: string;
  active: boolean;
  service_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface MockReview {
  id: string;
  service_id: string;
  client_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface MockDatabaseSchema {
  profiles: MockProfile[];
  bookings: MockBooking[];
  services: MockService[];
  gallery_images: MockGalleryImage[];
  messages: MockMessage[];
  notifications: MockNotification[];
  favorites: MockFavorite[];
  subscribers: MockSubscriber[];
  reviews: MockReview[];
  promotions: MockPromotion[];
  videos: MockVideo[];
  settings: MockSettings;
  categories: CategoryInfo[];
}

export interface MockSettings {
  id: string;
  opening_time: string;
  closing_time: string;
  closed_days: number[];
  blocked_dates: string[];
  buffer_time_mins: number;
}

const INITIAL_DB: MockDatabaseSchema = {
  profiles: [
    {
      id: "mock-admin-id-456",
      email: "admin@nailhouse.com",
      name: "NailHouse Admin",
      phone: "+237 677 216 185",
      role: "admin",
      created_at: new Date().toISOString(),
      newsletter: true,
      followup_preference: "messages",
    },
    {
      id: "mock-client-id-123",
      email: "client@example.com",
      name: "Amina Bello",
      phone: "677 123 456",
      role: "client",
      created_at: new Date().toISOString(),
      newsletter: true,
      followup_preference: "messages",
    },
  ],
  bookings: [
    {
      id: "b-mock-1",
      name: "Amina Bello",
      phone: "677 123 456",
      email: "client@example.com",
      service_id: "7c9a4192-b430-4e33-8a39-ebde89bb12e7",
      service_name: "Manucure Classique",
      service_ids: ["7c9a4192-b430-4e33-8a39-ebde89bb12e7"],
      service_names: ["Manucure Classique"],
      scheduled_at: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      notes: "Soin des cuticules de préférence.",
      status: "confirmed",
      created_at: new Date().toISOString(),
      followup_preference: "messages",
    },
  ],
  services: servicesJson,
  gallery_images: [
    {
      id: "g1",
      url: ASSETS.burgundyManicure,
      caption: "Manucure Couture Bordeaux",
      sort: 1,
    },
    {
      id: "g2",
      url: ASSETS.polkaDotNails,
      caption: "Nail Art Graphique & Pois",
      sort: 2,
    },
    {
      id: "g3",
      url: ASSETS.salonPedicure,
      caption: "Espace Pédicure Prestige",
      sort: 3,
    },
  ],
  messages: [
    {
      id: "msg-1",
      sender_id: "mock-admin-id-456",
      receiver_id: "mock-client-id-123",
      message: "Bonjour Amina, bienvenue chez NailHouse ! Des questions sur votre réservation ?",
      created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      read: false,
    },
  ],
  notifications: [
    {
      id: "notif-1",
      user_id: "mock-client-id-123",
      title: "Bienvenue !",
      message:
        "Bienvenue sur votre portail client NailHouse. Vous pouvez gérer vos réservations et vos favoris.",
      read: false,
      created_at: new Date().toISOString(),
    },
  ],
  favorites: [
    {
      id: "fav-1",
      user_id: "mock-client-id-123",
      service_id: "7c9a4192-b430-4e33-8a39-ebde89bb12e7",
      created_at: new Date().toISOString(),
    },
  ],
  subscribers: [
    {
      id: "sub-1",
      email: "client@example.com",
      created_at: new Date().toISOString(),
    },
  ],
  reviews: [
    {
      id: "rev-1",
      service_id: "7c9a4192-b430-4e33-8a39-ebde89bb12e7",
      client_name: "Sophie Laurent",
      rating: 5,
      comment: "Une expérience merveilleuse ! Les gestes sont d'une précision rare.",
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
  ],
  promotions: [
    {
      id: "promo-1",
      code: "SUMMER20",
      discount_percent: 20,
      description: "20% de réduction sur toutes les prestations pour l'été !",
      active: true,
      service_id: null,
      start_date: null,
      end_date: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "promo-2",
      code: "WELCOME10",
      discount_percent: 10,
      description: "10% de réduction pour votre première visite.",
      active: true,
      service_id: null,
      start_date: null,
      end_date: null,
      created_at: new Date().toISOString(),
    },
  ],
  videos: [
    {
      id: "v1",
      url: "/placeholder-manicure.html",
      title: "Soin Signature Manucure",
      description: "Sublimez vos mains avec un soin complet sur peau foncée.",
      category: "mains",
      active: true,
      sort: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: "v2",
      url: "/placeholder-manicure.html",
      title: "Vernis Semi-Permanent",
      description: "Des couleurs éclatantes et durables qui mettent en valeur votre carnation.",
      category: "vernis",
      active: true,
      sort: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: "v3",
      url: "/placeholder-pedicure.html",
      title: "Spa Pédicure Rituel",
      description: "Détente absolue et soin profond.",
      category: "pieds",
      active: true,
      sort: 3,
      created_at: new Date().toISOString(),
    },
  ],
  settings: {
    id: "global",
    opening_time: "09:00",
    closing_time: "19:00",
    closed_days: [0], // Default closed on Sunday
    blocked_dates: [],
    buffer_time_mins: 0,
  },
  categories: CATEGORIES,
};

// Reads the DB from disk, initializing if not present.
export function readMockDB(): MockDatabaseSchema {
  if (typeof window !== "undefined") {
    // Return empty schema if called from browser context (should never happen for server functions).
    return INITIAL_DB;
  }
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2), "utf8");
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!data.promotions) data.promotions = [];
    if (!data.videos) data.videos = INITIAL_DB.videos;
    if (!data.categories) data.categories = INITIAL_DB.categories;
    return data;
  } catch (err) {
    console.error("[readMockDB] failed, fallback to INITIAL_DB", err);
    return INITIAL_DB;
  }
}

// Writes the DB to disk.
export function writeMockDB(db: MockDatabaseSchema) {
  if (typeof window !== "undefined") return;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("[writeMockDB] failed", err);
  }
}

import fs from "fs";
import path from "path";
import servicesJson from "@/data/services.json";
import { ASSETS } from "@/lib/assets";

const DB_PATH = path.join(process.cwd(), "src/data/mock-db.json");

export interface MockProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "admin" | "client";
  created_at: string;
  newsletter: boolean;
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

export interface MockService {
  id: string;
  name: string;
  category: string;
  price_fcfa: number;
  duration_mins: number;
  description: string;
  slug: string;
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
    },
    {
      id: "mock-client-id-123",
      email: "client@example.com",
      name: "Amina Bello",
      phone: "677 123 456",
      role: "client",
      created_at: new Date().toISOString(),
      newsletter: true,
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
    return JSON.parse(raw);
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

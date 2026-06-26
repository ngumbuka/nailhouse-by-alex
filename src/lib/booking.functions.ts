import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import servicesJson from "@/data/services.json";
import { ASSETS } from "@/lib/assets";
import * as db from "./db";

const MOCK_GALLERY = [
  {
    id: "g1",
    url: ASSETS.burgundyManicure,
    caption: "Manucure Couture Bordeaux",
    title: "Manucure Couture Bordeaux",
    description:
      "Une pose de vernis bordeaux profond avec des reflets laqués intenses, combinée à un soin complet des cuticules pour des mains impeccables.",
    category: "mains",
    service_slug: "manucure-classique",
    sort: 1,
  },
  {
    id: "g2",
    url: ASSETS.polkaDotNails,
    caption: "Nail Art Graphique & Pois",
    title: "Nail Art Graphique & Pois",
    description:
      "Création artistique minimaliste réalisée au pinceau fin, associant des teintes nudes et des accents noirs précis. Idéal pour un look moderne.",
    category: "mains",
    service_slug: "gainage-biab-naturel",
    sort: 2,
  },
  {
    id: "g3",
    url: ASSETS.salonPedicure,
    caption: "Espace Pédicure Prestige",
    title: "Espace Pédicure Prestige",
    description:
      "Notre fauteuil de soin haut de gamme doté de jets massants. Un véritable sanctuaire de relaxation pour sublimer et soigner vos pieds.",
    category: "pieds",
    service_slug: "pedicure-spa-luxe",
    sort: 3,
  },
  {
    id: "g4",
    url: ASSETS.workstation,
    caption: "Notre Atelier & Bar à Ongles",
    title: "Notre Atelier & Bar à Ongles",
    description:
      "Un espace moderne et chaleureux équipé des meilleurs matériels d'aspiration et de séchage pour votre confort et votre sécurité.",
    category: "ambiance",
    sort: 4,
  },
  {
    id: "g5",
    url: ASSETS.polishShelves,
    caption: "Le Bar à Vernis Semi-Permanents",
    title: "Le Bar à Vernis Semi-Permanents",
    description:
      "Une collection infinie de flacons de marques prestigieuses sélectionnées pour leur tenue irréprochable et le respect de la plaque de l'ongle.",
    category: "ambiance",
    sort: 5,
  },
  {
    id: "g6",
    url: ASSETS.mindfulCandle,
    caption: "Détente & Soins Sensoriels",
    title: "Détente & Soins Sensoriels",
    description:
      "Bougies parfumées, huiles de massage chaudes et musique d'ambiance douce pour déconnecter totalement du stress quotidien.",
    category: "ambiance",
    sort: 6,
  },
  {
    id: "g7",
    url: ASSETS.barShelf,
    caption: "Gamme de Soins Cuticules",
    title: "Gamme de Soins Cuticules",
    description:
      "Nos sérums et huiles hydratantes exclusives formulées à base d'amande douce et de vitamine E pour nourrir vos mains après chaque pose.",
    category: "ambiance",
    sort: 7,
  },
  {
    id: "g8",
    url: ASSETS.coffeeEasel,
    caption: "Accueil & Pause Café",
    title: "Accueil & Pause Café",
    description:
      "Parce que l'expérience NailHouse commence dès votre arrivée, nous vous proposons une sélection de thés parfumés, cafés et rafraîchissements.",
    category: "ambiance",
    sort: 8,
  },
];

const bookingSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(6).max(30),
  email: z.string().email(),
  service_id: z.string().uuid().nullable().optional(),
  service_name: z.string().min(1).max(200),
  scheduled_at: z.string().min(8),
  notes: z.string().max(1000).optional().nullable(),
  service_ids: z.array(z.string().uuid()).optional().nullable(),
  service_names: z.array(z.string()).optional().nullable(),
});

const reviewSchema = z.object({
  service_id: z.string().uuid(),
  client_name: z.string().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
});

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  return db.listServices();
});

export const listGalleryImages = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("gallery_images")
      .select("id, url, caption, sort")
      .order("sort", { ascending: true });
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return MOCK_GALLERY;
    }
    return data.map((img) => {
      const mockMatch = MOCK_GALLERY.find((m) => m.url === img.url || m.caption === img.caption);
      return {
        id: img.id,
        url: img.url,
        caption: img.caption,
        sort: img.sort,
        title: mockMatch?.title || img.caption || "Création NailHouse",
        description: mockMatch?.description || "Soin d'exception réalisé par nos expertes.",
        category: mockMatch?.category || "ambiance",
        service_slug: mockMatch?.service_slug || null,
      };
    });
  } catch (err) {
    console.warn("[listGalleryImages] fallback to empty gallery, using mock instead", err);
    return MOCK_GALLERY;
  }
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingSchema.parse(input))
  .handler(async ({ data }) => {
    const booking = await db.createBooking({
      name: data.name,
      phone: data.phone,
      email: data.email,
      service_id: data.service_id ?? null,
      service_name: data.service_name,
      service_ids: data.service_ids ?? (data.service_id ? [data.service_id] : null),
      service_names: data.service_names ?? (data.service_name ? [data.service_name] : null),
      scheduled_at: data.scheduled_at,
      notes: data.notes ?? null,
    });

    try {
      const { addBookingToCalendar } = await import("@/lib/calendar.server");
      const eventId = await addBookingToCalendar({
        summary: `NailHouse — ${data.service_name} — ${data.name}`,
        description: `Téléphone: ${data.phone}\nEmail: ${data.email}\nNotes: ${data.notes ?? "—"}\nPrestations: ${data.service_names?.join(", ") ?? data.service_name}`,
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
      console.error("[calendar] add event failed", err);
    }

    return { id: booking.id };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    await db.subscribeNewsletter(data.email);
    return { ok: true };
  });

export const listReviewsForService = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ service_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    return db.listReviewsForService(data.service_id);
  });

export const createReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data }) => {
    return db.createReview({
      service_id: data.service_id,
      client_name: data.client_name,
      rating: data.rating,
      comment: data.comment ?? null,
    });
  });

export const validatePromo = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ code: z.string(), serviceId: z.string().optional().nullable() }).parse(input),
  )
  .handler(async ({ data }) => {
    const promo = await db.getPromotionByCode(data.code);
    if (!promo) {
      throw new Error("Code promo invalide ou expiré");
    }

    const now = new Date();
    if (promo.start_date && new Date(promo.start_date) > now) {
      throw new Error("Ce code promo n'est pas encore actif");
    }
    if (promo.end_date && new Date(promo.end_date) < now) {
      throw new Error("Ce code promo a expiré");
    }

    if (promo.service_id && data.serviceId && promo.service_id !== data.serviceId) {
      throw new Error("Ce code promo ne s'applique pas à cette prestation");
    }

    return {
      code: promo.code,
      discount_percent: promo.discount_percent,
      description: promo.description,
    };
  });

export const getAvailableTimeSlots = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ dateISO: z.string(), durationMins: z.number() }).parse(input),
  )
  .handler(async ({ data }) => {
    const settings = await db.getSettings();
    const targetDate = new Date(data.dateISO);
    const targetDateStr = data.dateISO.split("T")[0];

    if (settings.closed_days.includes(targetDate.getDay())) return [];
    if (settings.blocked_dates.includes(targetDateStr)) return [];

    const allBookings = await db.listBookings();

    const allServices = await db.listServices();

    const dayBookings = allBookings.filter((b) => {
      if (b.status === "cancelled") return false;
      const bDateStr = new Date(b.scheduled_at).toISOString().split("T")[0];
      return bDateStr === targetDateStr;
    });

    const occupiedIntervals = dayBookings.map((b) => {
      const start = new Date(b.scheduled_at).getTime();
      let totalDuration = 0;
      if (b.service_ids && b.service_ids.length > 0) {
        for (const sid of b.service_ids) {
          const svc = allServices.find((s) => s.id === sid);
          if (svc) totalDuration += svc.duration_mins;
        }
      } else if (b.service_id) {
        const svc = allServices.find((s) => s.id === b.service_id);
        if (svc) totalDuration += svc.duration_mins;
      }
      if (totalDuration === 0) totalDuration = 60;
      totalDuration += settings.buffer_time_mins;

      return {
        start,
        end: start + totalDuration * 60 * 1000,
      };
    });

    const slots: string[] = [];
    const [openH, openM] = settings.opening_time.split(":").map(Number);
    const [closeH, closeM] = settings.closing_time.split(":").map(Number);

    const openingTime = new Date(data.dateISO);
    openingTime.setHours(openH, openM, 0, 0);

    const closingTime = new Date(data.dateISO);
    closingTime.setHours(closeH, closeM, 0, 0);

    for (let h = openH; h <= closeH; h++) {
      for (const m of [0, 30]) {
        const slotStart = new Date(data.dateISO);
        slotStart.setHours(h, m, 0, 0);

        if (slotStart.getTime() < openingTime.getTime()) continue;

        const slotEnd = new Date(slotStart.getTime() + data.durationMins * 60 * 1000);

        if (slotEnd.getTime() > closingTime.getTime()) {
          continue;
        }

        const isOverlap = occupiedIntervals.some((interval) => {
          return slotStart.getTime() < interval.end && slotEnd.getTime() > interval.start;
        });

        if (!isOverlap) {
          slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
        }
      }
    }

    return slots;
  });

export const listActiveVideos = createServerFn({ method: "GET" }).handler(async () => {
  const videos = await db.listVideos();
  return videos.filter((v) => v.active).sort((a, b) => a.sort - b.sort);
});

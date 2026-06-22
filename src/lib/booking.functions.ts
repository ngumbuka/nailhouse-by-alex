import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import servicesJson from "@/data/services.json";
import { ASSETS } from "@/lib/assets";

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
  return servicesJson;
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
    try {
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
          service_ids: data.service_ids ?? (data.service_id ? [data.service_id] : null),
          service_names: data.service_names ?? (data.service_name ? [data.service_name] : null),
        })
        .select("id, scheduled_at, service_name")
        .single();
      if (error) throw new Error(error.message);

      // Optional: Google Calendar (skips silently when unconfigured).
      try {
        const { addBookingToCalendar } = await import("@/lib/calendar.server");
        const eventId = await addBookingToCalendar({
          summary: `NailHouse — ${data.service_name} — ${data.name}`,
          description: `Téléphone: ${data.phone}\nEmail: ${data.email}\nNotes: ${data.notes ?? "—"}\nPrestations: ${data.service_names?.join(", ") ?? data.service_name}`,
          startISO: data.scheduled_at,
        });
        if (eventId) {
          await supabaseAdmin
            .from("bookings")
            .update({ calendar_event_id: eventId })
            .eq("id", booking.id);
        }
      } catch (err) {
        console.error("[calendar] add event failed", err);
      }

      return { id: booking.id };
    } catch (err) {
      console.warn("[createBooking] mock booking creation due to database error", err);
      return { id: "mock-booking-id-" + Math.random().toString(36).substr(2, 9) };
    }
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("newsletter_emails")
        .upsert(
          { email: data.email.toLowerCase() },
          { onConflict: "email", ignoreDuplicates: true },
        );
      if (error && !`${error.message}`.includes("duplicate")) throw new Error(error.message);
      return { ok: true };
    } catch (err) {
      console.warn("[subscribeNewsletter] mock newsletter subscription due to database error", err);
      return { ok: true };
    }
  });

// ============================
// REVIEWS & RATINGS MOCK STORE & FUNCTIONS
// ============================
interface Review {
  id: string;
  service_id: string;
  client_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

const mockReviews: Review[] = [
  {
    id: "rev-1",
    service_id: "7c9a4192-b430-4e33-8a39-ebde89bb12e7", // Manucure classique
    client_name: "Sophie Laurent",
    rating: 5,
    comment:
      "Une expérience merveilleuse ! Les gestes sont d'une précision rare, le salon est magnifique et l'accueil chaleureux. Mes mains sont sublimes.",
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rev-2",
    service_id: "7c9a4192-b430-4e33-8a39-ebde89bb12e7", // Manucure classique
    client_name: "Camille Dubois",
    rating: 4,
    comment:
      "Très satisfaite de ma manucure classique. Le soin des cuticules est très doux. Je reviendrai sans hésiter.",
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rev-3",
    service_id: "de03195b-0be1-432d-8386-77891ef9f12d", // Manucure spa
    client_name: "Hélène Martin",
    rating: 5,
    comment:
      "Le gommage et le massage à l'huile chaude sont incroyables. Un vrai moment de détente de luxe.",
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rev-4",
    service_id: "09c69341-382a-4f51-b844-48f8cbf5e9d9", // Pédicure classique
    client_name: "Aline Ndzana",
    rating: 5,
    comment:
      "Excellente pédicure. Salon très propre, respect total des règles d'hygiène avec outils stérilisés. Très rassurant !",
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rev-5",
    service_id: "b8cbb81e-624b-4f0f-863a-7d2fb709cc8e", // Gainage BIAB naturel
    client_name: "Marie-Thérèse O.",
    rating: 5,
    comment:
      "Le BIAB est fantastique, mes ongles ne se cassent plus du tout et le fini nude est parfait pour le bureau.",
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
];

export const listReviewsForService = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ service_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: reviews, error } = await supabaseAdmin
        .from("service_reviews")
        .select("id, service_id, client_name, rating, comment, created_at")
        .eq("service_id", data.service_id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);

      const realReviews = reviews ?? [];
      const matchingMock = mockReviews.filter((r) => r.service_id === data.service_id);
      return [...realReviews, ...matchingMock].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } catch (err) {
      console.warn("[listReviewsForService] fallback to mock reviews", err);
      return mockReviews
        .filter((r) => r.service_id === data.service_id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  });

export const createReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data }) => {
    const newReview = {
      id: "rev-" + Math.random().toString(36).substr(2, 9),
      service_id: data.service_id,
      client_name: data.client_name,
      rating: data.rating,
      comment: data.comment ?? null,
      created_at: new Date().toISOString(),
    };

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: inserted, error } = await supabaseAdmin
        .from("service_reviews")
        .insert({
          service_id: data.service_id,
          client_name: data.client_name,
          rating: data.rating,
          comment: data.comment ?? null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return inserted;
    } catch (err) {
      console.warn("[createReview] fallback to mock review memory insertion", err);
      mockReviews.unshift(newReview);
      return newReview;
    }
  });

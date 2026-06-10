# NailHouse — Plan

A modern, mobile-first salon website with a deep burgundy monochrome boutique-editorial direction (Cormorant Garamond + Manrope, cream/blush/burgundy/magenta palette), backed by Lovable Cloud. **All photography uses the real salon and client photos you sent — AI-generated nail imagery can be included, and the language is French;  consider translation to English.**

## Real photo assets

Uploaded via `lovable-assets` CLI from `/mnt/user-uploads/` into CDN pointers under `src/assets/`. Mapping:


| File                                                  | Used for                                      |
| ----------------------------------------------------- | --------------------------------------------- |
| Dark glossy burgundy manicure (outdoor)               | Home hero — anchors the burgundy palette      |
| White polka-dot manicure on black glove               | Home "Signature Treatments" feature + gallery |
| Salon interior — wood slat wall, chair, pedicure bowl | Gallery + Contact "Visit the atelier"         |
| Mindful candle, plant, lamp on console                | About / Philosophy section                    |
| Nail products workstation (turmeric scrub etc.)       | Services page banner + gallery                |
| Arch LED lamp + UV dryer on bench                     | Gallery                                       |
| Three shelves of polish bottles + tips                | Services page hero or about strip             |
| Three woven baskets + pink stool + black chair        | About / Contact ambience                      |
| Glassware + jars + nail polish on bar shelf           | Gallery                                       |
| Coffee easel + candle + polish rack                   | Newsletter / hospitality block                |


The logo you uploaded earlier becomes the favicon + nav mark. All ten salon photos are also seeded into `gallery_images` so the public gallery is populated on day one.

## Pages

- **Home (`/`)** — hero (burgundy manicure photo + "For the beauty of nails…" tagline), Book CTA, signature treatments preview (3 from real categories), live gallery strip, philosophy card, contact + newsletter footer.
- **Services (`/services`)** — full price list in FCFA, grouped exactly per your sheet: Soins des mains, Soins des pieds, Ongles naturels renforcée, Ongle naturel BIAB, Capsule sur ongle, Supplément, Dépose. Banner uses the workstation/shelves photo.
- **About (`/about`)** — mission + vision (placeholder copy you can edit later) over the candle/baskets ambience photos.
- **Gallery (`/gallery`)** — masonry grid from `gallery_images` (seeded with all 10 photos).
- **Contact (`/contact`)** — 677 216 185 / 698 905 829, "Ekoumdoum — next to Bilbao lounge", embedded map.
- **Booking (`/booking`)** — name, phone, email, service select (from `services`), date picker, 15-min time slots 9:00–19:00 → inserts `bookings`, sends email, fires Google Calendar event.
- **Auth (`/auth`)** — email/password (you sign up after launch, then we grant admin role).
- **Admin (`/_authenticated/admin`)** — bookings table, gallery upload/delete, newsletter list + CSV export.

## Design System

Tokens copied verbatim from the chosen direction into `src/styles.css`:

- `--background` cream `#fffaf5`, `--muted` blush `#fdf2f0`, `--primary` burgundy `#5e1535`, `--accent` magenta `#e6308a`, `--foreground` ink `#2a0a18`
- Fonts: Cormorant Garamond (display) + Manrope (sans) via Google Fonts link in `__root.tsx`
- Composition matches the prototype: cream nav with logo, hero with display serif headline + photo to the right, blush gallery strip, 3-column treatments, centered philosophy card, dark burgundy footer

## Backend (superbase)

Tables (all with explicit GRANTs + RLS, roles via `user_roles` + `has_role()`):

- `services` — id, category, name, price_fcfa, sort. Seeded from your price sheet. Public read.
- `bookings` — id, name, phone, email, service_id, scheduled_at, notes, status, calendar_event_id, created_at. Public INSERT, admin SELECT/UPDATE/DELETE.
- `gallery_images` — id, storage_path, public_url, caption, sort, created_at. Public SELECT, admin write. Seeded with the 10 photos.
- `newsletter_emails` — id, email (unique), created_at. Public INSERT, admin SELECT.
- Storage bucket `gallery` (public read, admin write).  
**Salon notification email** for booking alerts : [nailhouse27@gmail.com](mailto:nailhouse27@gmail.com).

Server functions (`createServerFn`):

- `createBooking` — Zod-validated insert → salon email → Calendar event (failure logged, doesn't block booking).
- `subscribeNewsletter` — Zod + upsert.
- `addBookingToCalendar` — service-account JWT → access token → Calendar API insert; stores `event.id`.
- `listBookings`, `listSubscribers`, `uploadGalleryImage`, `deleteGalleryImage` — admin-gated via `has_role('admin')`.

Secrets requested after Cloud is enabled:

- `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_CALENDAR_ID`, `SALON_NOTIFICATION_EMAIL`

Email: built-in Lovable Emails (`scaffold_transactional_email`) with two templates — `booking-received` (to salon) and `booking-confirmation` (to customer).

## Admin Flow

- `/auth` email/password. After you sign up, one SQL grant adds you to `user_roles` as `admin`.
- `_authenticated/admin` dashboard tabs: Bookings (status dropdown), Gallery (drop-zone upload + delete), Newsletter (list + Export CSV).

## What I still need from you (mid-build)

1. **Google service account JSON + calendar ID** (share the calendar with the service account's `client_email`).
2. **Mission / vision copy** (placeholder seeded; replace anytime).

## Order of work

1. Enable Lovable Cloud.
2. Upload all 10 salon photos + logo as Lovable assets.
3. Migration: tables, RLS, GRANTs, roles, seed `services` from price sheet, seed `gallery_images` with the 10 photos, create storage bucket.
4. Lovable Emails: domain setup + transactional scaffold + two templates.
5. Design tokens + fonts + favicon.
6. Build pages: Home → Services → About → Gallery → Contact → Booking.
7. Auth + admin dashboard.
8. Wire server functions (booking, newsletter, admin CRUD).
9. Add Google Calendar secrets + integration.
10. Per-route SEO meta, OG tags (using the burgundy manicure photo).
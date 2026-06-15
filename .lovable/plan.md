## Goal

End-to-end booking flow where Google Calendar (salon owner's) is the source of truth for availability, plus a client review & rating system per service.

---

## 1. Google Calendar integration

Use the Lovable **Google Calendar** connector (workspace-level OAuth — owner's calendar). All Calendar API calls go through the gateway, never the SDK.

Server functions in `src/lib/calendar.functions.ts`:
- `listBusy({ from, to })` → `freebusy.query` on `CALENDAR_ID` (default `primary`) → `Array<{ start, end }>`.
- `createBookingEvent({ summary, description, startISO, endISO, attendeeEmail })` → `POST /events?sendUpdates=all` → `{ eventId, htmlLink }`.
- `cancelBookingEvent({ eventId })` → `DELETE … ?sendUpdates=all`.
- `updateBookingEvent({ eventId, ... })` → `PATCH` for reschedule.

Gateway URL `https://connector-gateway.lovable.dev/google_calendar/calendar/v3/...`, headers `Authorization: Bearer ${LOVABLE_API_KEY}` + `X-Connection-Api-Key: ${GOOGLE_CALENDAR_API_KEY}`. Both env vars validated up front.

I'll trigger `standard_connectors--connect` so the owner authorizes once.

---

## 2. Mock store (frontend-only, for what's NOT in Calendar)

`src/lib/mock/store.ts` — localStorage-backed, seeded on first load:
- **services** — extends `service-categories.ts` with `durationMinutes`, `priceCents`, `active`.
- **business hours** — Tue–Sat 10:00–19:00, closed Sun/Mon.
- **bookings mirror** — `{ id, eventId, serviceSlug, client, start, end, status, paymentChoice, reviewToken, reviewed }`. Needed to enrich the admin table and gate review eligibility.
- **reviews** — `{ id, serviceSlug, bookingId, clientName, rating(1–5), title, body, createdAt, published }`. Seeded with ~3 reviews per service so the UI looks alive on first load.
- **adminFlag** — demo role toggle.

---

## 3. Availability engine

`src/lib/availability.ts` → `getAvailableSlots(serviceId, date)`:
1. Build candidate slots from business hours on that weekday (15-min grid).
2. Drop slots whose `[start, start+duration)` overlaps any busy interval from `listBusy`.
3. Drop past slots for today.
4. Return `string[]` like `"10:00"`, `"10:30"`.

Called via TanStack Query from the time step; refetches when date or service changes.

---

## 4. Client booking flow (`/booking`)

Stepper:
1. **Service** — preselected from `?service=<slug>`, else picker grouped by category.
2. **Date** — shadcn Calendar; disables past + closed weekdays.
3. **Time** — slot grid + "Next available" CTA.
4. **Details** — name, email, phone, notes (Zod).
5. **Payment choice** — "Pay at salon" or "Pay now" (mock-Stripe screen for now).
6. **Submit** → `createBooking(...)`:
   - Re-checks availability against Calendar.
   - `createBookingEvent` with attendee → Google sends the invite.
   - Inserts mirror row with a unique `reviewToken`.
   - Returns `{ bookingId, eventLink, reviewToken }`.
7. Pay-now → `/booking/checkout` (mock, simulates 1.2s). Else → `/booking/success` with summary, "Add to calendar" link, and a note that a review link will be available after the appointment.

`/booking/cancelled` + `/booking/success` routes.

---

## 5. Reviews & ratings

### Per-service pages (`/services/$slug/$service`)
Add a **Reviews** section below the existing Aftercare/Gallery/Ritual blocks:
- Header: average rating (1 decimal) + star row + total count.
- Star-distribution mini-bars (5→1).
- Sorted list of published reviews (most recent first), paginated 5 at a time. Each card: stars, title, body, client first name + initial, date.
- "Write a review" CTA → opens dialog (see below).

### Service category pages (`/services/$slug`) and `/services`
- Each service card shows compact stars + rating + review count (clickable, scrolls to Reviews section on the service page).

### Home
- Optional small "Latest reviews" strip on `/` (3 most recent across all services).

### Writing a review
Two entry points, same dialog:
1. **Direct from a service page** — anyone can leave a review (name, email optional, rating, title, body). Marked `published=true` immediately in the mock; in v1 there's no spam protection beyond Zod length limits. Reviews submitted without a booking get a small "Visitor review" badge.
2. **Post-appointment link** — `/review/$token` route. The `reviewToken` from the booking opens a pre-filled form (service known, client name pre-filled). Submitting marks `bookings.reviewed=true` and tags the review as "Verified visit" (badge in UI). One review per token.

Validation (Zod): rating 1–5 int required, title ≤ 80 chars, body 10–1000 chars, name 2–80 chars, email optional but valid if present.

Component pieces:
- `src/components/reviews/{star-rating,rating-summary,review-card,review-list,review-form-dialog}.tsx`
- `src/lib/reviews.ts` (selectors: average, distribution, by-service, latest)
- `src/routes/review.$token.tsx`

### Admin
New **Reviews** tab on `/admin`:
- Table: service, rating, title, snippet, source (Verified visit / Visitor), published toggle, date.
- Row actions: hide/show (toggle `published`), delete.

---

## 6. Admin dashboard (`/admin`, under `_authenticated`)

Tabs: **Overview · Bookings · Services · Hours · Reviews**.

**Overview** — stat cards (today, this week, revenue this month from paid, pending) + next-7-days list. Also: average rating across all services + total reviews.

**Bookings** — table from local mirror + Calendar link. Drawer: full client details, **Confirm**, **Reschedule** (`updateBookingEvent`), **Cancel** (`cancelBookingEvent`, sends cancellation email), **Mark paid**, **Mark completed**, **Copy review link** (the `reviewToken` URL).

**Services** — CRUD over the mock store.

**Hours** — per-weekday open/close + closed toggle.

**Reviews** — moderation table.

Demo "Admin role" switch in header until real auth is in.

---

## 7. Files

New:
- `src/lib/calendar.functions.ts`, `src/lib/availability.ts`, `src/lib/reviews.ts`
- `src/lib/mock/{store,services,bookings,business-hours,reviews,auth}.ts`
- `src/components/booking/{stepper,service-step,date-step,time-step,details-step,payment-step,success-card}.tsx`
- `src/components/reviews/{star-rating,rating-summary,review-card,review-list,review-form-dialog}.tsx`
- `src/components/admin/{stats-cards,bookings-table,booking-drawer,services-table,service-dialog,hours-editor,reviews-table,admin-sidebar}.tsx`
- `src/routes/booking.checkout.tsx`, `src/routes/booking.success.tsx`, `src/routes/booking.cancelled.tsx`, `src/routes/review.$token.tsx`

Rewritten:
- `src/routes/booking.tsx`
- `src/routes/_authenticated/admin.tsx`
- `src/routes/services.$slug.$service.tsx` (add Reviews section + summary in hero)
- `src/routes/services.$slug.tsx` and `src/routes/services.tsx` (card stars)

Existing `src/lib/calendar.server.ts` and `src/lib/booking.functions.ts` will be folded into the new files (checked in build mode first).

---

## 8. Build sequence

1. Connect `google_calendar` connector + optional `CALENDAR_ID` secret.
2. Calendar server fns + availability engine.
3. Mock store (services, hours, bookings, reviews) + seed.
4. Booking stepper end-to-end (+ mock checkout screens).
5. Reviews: per-service section, dialog, `/review/$token`, card stars.
6. Admin dashboard with all 5 tabs.

---

## 9. Out of scope (this round)

Real Stripe charge, real auth/role enforcement, SMS reminders, multi-staff calendars, recurring bookings, refunds UI, client self-service portal, review reply-from-owner, photo uploads on reviews, abuse/spam protection beyond length limits.

Confirm and I'll start with the Google Calendar connection.
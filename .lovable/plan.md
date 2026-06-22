## Goal

Restructure `/services` into an **e-commerce catalog → product detail** flow. Today, `/services` shows 7 category cards, clicking one opens `/services/$slug` which dumps every service for that category. The user wants to land directly on a service detail page (PDP), not a category listing.

---

## Information architecture (after)

```
/services                       Catalog grid of ALL individual services (products)
                                Filter bar: All · Mains · Pieds · BIAB · Capsules · …
                                Each card = 1 service → links straight to its PDP

/services/$slug/$service        Product detail page (already shipped, kept as-is +
                                small additions)

/services/$slug                 Repurposed as a "collection" page (optional filter
                                landing) — keeps hero + ritual + FAQ, drops the
                                duplicate service-cards section since cards now live
                                on /services
```

---

## 1. Catalog (`/services`)

Replace the category-card grid with a product-style catalog:

- **Hero** — current hero kept, simplified (title + one-line intro + CTA "Réserver").
- **Filter bar** (sticky on scroll, horizontal scroll on mobile):
  `Tout · Mains · Pieds · Naturels renforcés · BIAB · Capsules · Suppléments · Dépose`
  Driven by `?cat=<slug>` search param so the filter is shareable and back-button friendly.
- **Sort** (lightweight): `Populaire · Prix ↑ · Prix ↓ · Durée`.
- **Product grid** — 2 cols mobile / 3 cols tablet / 4 cols desktop. Each card:
  - service image (per-category hero fallback)
  - category eyebrow (e.g. "Soins des mains")
  - service name
  - price in FCFA + duration
  - small "Voir le détail →" affordance
  - whole card is the `<Link>` to `/services/$slug/$service`
- **Empty state** when a filter returns nothing.
- **Tarifs CTA** kept at the bottom.

Data: `listServices()` already returns all services with `category` + `price_fcfa` + `duration_minutes`; group/filter on the client.

---

## 2. Detail page (`/services/$slug/$service`) — small e-commerce upgrades

The page already has hero, description, ritual, price + booking, aftercare, FAQ, gallery, related strip. Add:

- **Sticky purchase bar** on scroll (mobile + desktop):
  service name · price · "Réserver ce soin" button. Mirrors PDP add-to-cart bars.
- **Trust row** under the hero: `Outils stérilisés · Produits pro · Réservation en ligne · Conseil sur-mesure` — small icon strip.
- **"Souvent réservé avec"** section (cross-sell) above the existing related strip: 3 hand-picked complementary services from _other_ categories (e.g. Manucure + Pédicure + Dépose). Picked via a small rule: same category siblings already shown below, so this pulls the 3 nearest by category affinity.
- **"Autres prestations"** strip: kept, restyled as horizontal product cards (image + name + price) instead of text-only cards.
- **Breadcrumb** kept; gains a "Back to catalog" link on mobile.

No changes to booking, pricing, or copy logic.

---

## 3. Category page (`/services/$slug`) — repurposed as collection

Keep it useful but stop duplicating the catalog:

- Hero + "Pour qui" + Ritual + FAQ + CTA — **kept**.
- The big "Carte des prestations" service-card grid in the middle — **removed**. Replaced by a single CTA: "Voir les {N} prestations {category} →" that deep-links to `/services?cat=<slug>` (the new filtered catalog).
- Gallery — **kept**.

This makes the category page an editorial landing, while the actual shopping happens at `/services` and PDPs.

---

## 4. Navigation touch-ups

- Header "Prestations" link still points to `/services`.
- The home page service teasers (if any) link straight to `/services/$slug/$service` for the headline service of each category, not to `/services/$slug`.
- Update internal links pointing to `/services/$slug` from copy/CTAs only where it makes sense; category-page links from the catalog filter use the new `?cat=` pattern.

---

## 5. Files

**Rewritten**

- `src/routes/services.tsx` — catalog grid + filter + sort.
- `src/routes/services.$slug.tsx` — drop the service-cards section, add the deep-link CTA.
- `src/routes/services.$slug.$service.tsx` — add sticky purchase bar, trust row, "Souvent réservé avec" cross-sell, restyle related strip as product cards.

**New**

- `src/components/catalog/service-card.tsx` — shared product card (used by catalog + related strip + cross-sell).
- `src/components/catalog/catalog-filters.tsx` — filter chips + sort dropdown, URL-state driven.
- `src/components/services/sticky-purchase-bar.tsx` — appears after hero scrolls off.

**Untouched**

- `service-categories.ts`, `service-copy.ts`, `booking.functions.ts`, `service-gallery.functions.ts`, booking flow, admin, calendar.

---

- Real product imagery per individual service (we keep per-category hero/flat images as fallbacks).  
  Permit a user to pick and schedule multipl services at once in one flow

6. Out of scope (this round)

- Wishlist / favorites, comparison, reviews, variants, real cart. Booking remains a single-service flow.
- Anything backend.

Confirm and I'll start with the catalog rewrite at `/services`.

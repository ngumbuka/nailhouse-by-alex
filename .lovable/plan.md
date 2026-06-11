# Per-service detail pages

## Goal
Every individual service (Manucure classique, Manucure spa, Gainage BIAB, etc.) gets its own focused page — clear hero, what it is, ritual, price, FAQ, gallery, and a related-services strip. The current category page (`/services/$slug`) becomes a clean "menu" that links into each service page instead of showing everything inline.

## URL structure

```
/services                              → all categories (unchanged)
/services/$category                    → category page: intro + list of services as cards → click → service page
/services/$category/$service           → NEW: focused page for one service
/tarifs                                → full price grid (unchanged)
```

`$service` is a slug derived from the service name (e.g. `manucure-classique`, `manucure-spa`). Resolved by matching slugified `name` within the category's services.

## What each service page contains (in order, deliberately spacious)

1. **Hero** — category image as backdrop, service name as H1, one-line tagline, price + duration, primary "Réserver ce soin" CTA prefilled with this service's id, breadcrumb `Maison › Prestations › {Category} › {Service}`.
2. **Description** — 2–3 short paragraphs auto-generated from category intro + service name (what it is, who it's for).
3. **Ritual** — the same 4-step ritual as the category (reused), since it applies to the category's services.
4. **Tarif & réservation** — single large card with price, what's included, big "Réserver" button.
5. **Aftercare & FAQ** — 2–3 care tips + 2 FAQs (reused from category, kept short).
6. **Gallery strip** — 3–4 images: the category hero, the flat shot, plus any uploaded gallery images for that category (reuses existing `service_gallery_images` system).
7. **Related services strip** — horizontal scroll: sibling services in the same category first, then a divider, then other categories. Each card → its own service or category page.

No sidebar, no dense tables, one column on mobile, max-w-3xl reading column on desktop for text sections.

## Category page (`/services/$category`) — refocused

Replace the current inline price list with a clean grid of **service cards** (name, short blurb, price, "Voir le détail →"). Keep the hero, the "Pour qui" block, the ritual, the gallery, and the FAQ. Remove the dense tarifs table — direct people to either the individual service page or `/tarifs` for the full grid.

## Content generation (no admin work needed)

Auto-derive per-service copy from existing data:

- **Tagline**: category tagline.
- **Description**: template — `"{service name} — {category intro}. Une prestation pensée pour {bestFor lowercase}."` Light per-service variation by detecting keywords in the name (e.g. "spa" → mention relaxation; "remplissage" → mention maintenance; "construction" → mention sculpting). Kept in a small helper `buildServiceCopy(service, category)` in `src/lib/service-copy.ts`.
- **Hero/flat image**: reuse the category's `image` and `flat`.
- **Ritual, care, FAQ, whyUs**: inherit from category.

This avoids touching the DB or admin now; we can layer per-service overrides later.

## Wiring

- New route file: `src/routes/services.$category.$service.tsx`.
- Service slug helper: `slugifyService(name)` in `src/lib/service-categories.ts` + `findServiceBySlug(category, serviceSlug, services)`.
- Update category page (`src/routes/services.$slug.tsx`) — keep file name and route, just swap the tarifs section for a service-card grid that links to `/services/$slug/$serviceSlug`.
- Update `/tarifs` rows: each row links to its service detail page.
- Existing booking flow (`/booking?service=id`) is reused unchanged.

## Technical notes

- The category route stays at `/services/$slug` (the codebase already uses `$slug` for category). The new service route uses `$category` and `$service` to keep TanStack file-based routing unambiguous: `services.$slug.tsx` matches `/services/:slug` and `services.$category.$service.tsx` matches `/services/:category/:service`. TanStack resolves the more specific (two-segment) route when both params are present.
- Service slugs are computed deterministically (`slugify` lowercase + diacritic strip + dashes), so no DB migration. A lookup map is built once per render from the services list.
- `head()` on the service page sets a unique title/description/og:image per service, derived from `{Service} — {Category} — NailHouse`.
- Related strip reuses `CATEGORIES` and the filtered sibling list — same scroll component pattern already used elsewhere on the site, kept lightweight.
- No schema changes, no new server functions.

## Out of scope (call out)

- Per-service admin editor (you chose "auto-generate defaults"). Can be added later by introducing `service_overrides` table without breaking URLs.
- Per-service uploaded galleries (today galleries are per-category). Service pages reuse the category gallery.

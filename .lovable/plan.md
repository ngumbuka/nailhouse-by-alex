## Goal

Elevate every page hero with more captivating imagery or short ambient video that instantly communicates NailHouse's luxury value proposition.

## Current state

- Home hero already uses `hero-loop.mp4` (AmbientVideo) over a burgundy nails poster.
- Services, Tarifs, About, Contact, Gallery, Booking heroes use static Unsplash images (`ASSETS.heroServices`, `heroTarifs`, etc.) — generic stock, not brand-aligned, no motion.
- Category pages (`services/$slug`) use static hero images.
- Only 2 videos exist: `hero-loop.mp4` (nails), `gesture-loop.mp4` (brush stroke).

## Plan

### 1. Generate 4 new AI hero videos (Black women, burgundy/gold NailHouse identity, 5s loops, 16:9)

- `services-loop.mp4` — close-up of a nail technician's precise brush stroke on a client's ebony hand, glossy burgundy polish, gold jewellery, moody warm light.
- `pedicure-loop.mp4` — dark-skinned feet in an ornate marble basin with milk and rose petals, gold leaf floating, candlelight.
- `about-loop.mp4` — slow cinematic pan across the atelier: candles, polish shelves, a Black woman's hands being manicured, warm burgundy tones.
- `contact-loop.mp4` — welcoming shot of the salon entrance / reception detail with ambient candlelight.

Plus regenerate 2 premium poster stills (fallbacks) to match each new video's first frame.

### 2. Wire videos into hero sections using existing `AmbientVideo` component

| Page                             | New hero media                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `/services` (services.index.tsx) | `services-loop.mp4` + poster                                                                                                   |
| `/tarifs`                        | reuse `services-loop.mp4` (or new pricing-focused still with gold-foil price card overlay)                                     |
| `/about`                         | `about-loop.mp4` + poster                                                                                                      |
| `/contact`                       | `contact-loop.mp4` + poster                                                                                                    |
| `/booking`                       | `gesture-loop.mp4` (already exists, reuse)                                                                                     |
| `/gallery`                       | keep static (grid is the hero) but upgrade cover tile                                                                          |
| `/services/$slug` (per category) | map each category slug → best matching video (mains → hero-loop, pieds → pedicure-loop, others → gesture-loop / services-loop) |

### 3. Polish hero layout & copy

- Add a dark burgundy → transparent gradient overlay on all video heroes for text legibility.
- Add a small "label-luxe" eyebrow line + refined H1 + one-line value proposition on each hero (e.g. Services: "L'art de l'ongle • Rituels signature pensés pour sublimer chaque main").
- Ensure `prefers-reduced-motion` falls back to the poster (already handled by AmbientVideo).
- Keep mobile performant: `preload="metadata"`, muted autoplay, `playsInline`.

### 4. Update assets registry

- Add new video/poster URLs to `src/lib/assets.ts`.
- Upload via `lovable-assets create` and reference via `.asset.json` pointers.

## Technical notes

- Videos generated with `videogen--generate_video` at 1080p, 5s, 16:9, `camera_fixed: false` for gentle motion. Prompts strictly specify "Black woman with ebony/rich brown skin".
- No schema changes, no backend changes. Pure frontend + asset work.
- Files touched: `src/lib/assets.ts`, `src/routes/services.index.tsx`, `src/routes/tarifs.tsx`, `src/routes/about.tsx`, `src/routes/contact.tsx`, `src/routes/booking.tsx`, `src/routes/services.$slug.tsx`.

## Out of scope

- Homepage hero (already has video and was recently upgraded).
- Admin video uploader (already exists — new videos can also be added there later).
- Copy rewrites beyond hero eyebrow/subtitle lines.

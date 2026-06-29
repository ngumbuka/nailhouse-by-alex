## Polish pass for NailHouse

Three-part refinement: disable signup email verification, weave AI-generated video into key surfaces, and tighten visual design across home / service detail / gallery / global chrome. **All people depicted (hands, feet, models, ambient shots) are Black women with associated skin tones — deep ebony, rich brown, warm caramel, golden bronze. No other skin tones appear in any new or regenerated asset.**

---

### 1. Auth — remove signup email confirmation

- Call `configure_auth` to turn off email confirmation so admin signup logs in immediately.
- Remove the "check your inbox" branch from `/auth` and route straight to `/admin` on success.

No change to booking notifications or other email behavior.

---

### 2. Video content (AI-generated, looping, muted, ambient)

Generate three short clips (5–10s, 1080p, silent). **Every clip features Black women only**, prompted explicitly with deep/rich/warm Black skin tones, natural lighting that flatters melanin-rich skin, and burgundy/gold brand palette.

| Clip               | Subject                                                                                                       | Where it plays                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `hero-loop.mp4`    | Slow cinematic close-up of a Black woman's hand with glossy burgundy nails drifting through warm golden light | Home hero (video layer behind gradient + title); existing image as `poster`  |
| `atelier-loop.mp4` | Overhead pan across workstation — polish bottles, candle, a Black woman's hand resting on marble              | Home "Philosophie" band + About atmosphere section                           |
| `gesture-loop.mp4` | Macro shot of a precise nail-art brush stroke on the styled hand of a Black woman                             | Gallery featured tile + service-detail hero of the lead service per category |

Implementation:

- Upload each MP4 via `lovable-assets`, add entries to `src/lib/assets.ts`.
- New `<AmbientVideo>` component: autoPlay, muted, loop, playsInline, `poster` fallback, respects `prefers-reduced-motion`, lazy-loaded below the fold.
- Gallery: insert one video tile into the masonry every ~6 items; image-only items unchanged.
- Service detail hero swaps still for video for the lead service of each category, image as poster.

---

### 3. Design refinement (keep burgundy/gold luxury identity)

Tightening, not redesign:

- **Typography rhythm** — larger Cormorant display sizes, tighter tracking, consistent gold uppercase eyebrow style, smaller Manrope body with more line-height.
- **Spacing system** — standardize section padding (mobile 64 / desktop 128), unify container widths, remove ad-hoc paddings across `index.tsx`, `services.tsx`, `services.$slug.$service.tsx`, `gallery.tsx`, `about.tsx`.
- **Header** — thinner, more transparent at top, subtle backdrop on scroll, gold underline on active link, refined mobile drawer.
- **Footer** — 3-column editorial layout: logo + tagline, contact, hours; finer divider; small Instagram CTA.
- **Cards & images** — unify `rounded-2xl`, softer shadow token, slow ken-burns on service-card hover, fade-in on image load.
- **Gallery** — true asymmetric masonry, refined lightbox (darker scrim, arrow nav, caption typography).
- **Service detail** — tighter hero ratio, frosted-glass sticky purchase bar, calmer cross-sell with horizontal scroll-snap.
- **Home** — re-pace sections (hero → signature → philosophie video → atmosphere → CTA), thin gold rule motif as section divider.
- **Loader & route transitions** — refine `PageLoader` curve, subtle fade-in on route change.

**Imagery rule applied to any regenerated still as part of this polish**: only Black women / Black skin tones are depicted. If any existing image showing other skin tones is touched during the pass, it is regenerated to comply.

---

### Files touched

**New**

- `src/components/ui/ambient-video.tsx`
- 3 video asset pointers in `src/assets/*.mp4.asset.json` + entries in `src/lib/assets.ts`

**Edited**

- `src/routes/auth.tsx` (remove email-confirm UX path)
- `src/routes/index.tsx`, `about.tsx`, `gallery.tsx`, `services.$slug.$service.tsx` (video + spacing)
- `src/components/site/site-header.tsx`, `site-footer.tsx`
- `src/styles.css` (spacing tokens, type scale, refined shadows)
- `src/components/page-loader.tsx`
- `src/components/services/sticky-purchase-bar.tsx`

**Untouched**
Booking flow, admin dashboard, calendar integration, Supabase schema, RLS, server functions.

Execution order: auth toggle → video generation & wiring → design polish.

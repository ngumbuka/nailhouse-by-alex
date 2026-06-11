## Goals

1. Every service image features Afro or métis (mixed-heritage) women — no white models — set in an African artistic context (burgundy + gold couture mixed with wax / kente / bogolan motifs, African gold jewellery, dark warm skin tones).
2. Hero images for every service look ultra-premium, cinematic and editorial.
3. Each "flat / action" image clearly **shows the service in action** (the gesture matching the prestation), not just equipment.
4. On `/services/$slug`, all primary content focuses **only on the chosen service**. Other services are demoted to a small, clearly secondary "Other rituals" strip at the very bottom — never mixed with the main content.

## Scope of changes

### 1. Imagery (14 images regenerated + 7 new in-action shots)

For each of the 7 categories I'll regenerate both the **hero** and the **action** image, and the prompt will explicitly:
- specify an Afro or métis woman / hands with rich dark skin;
- include African artistic cues (wax-print / kente / bogolan fabric, gold cowrie or beaded jewellery, carved wood, burgundy & gold palette);
- show the actual service gesture in the "action" image.

| Category | Hero (luxury portrait / close-up) | Action (gesture of the service) |
|---|---|---|
| Soins des mains | Editorial close-up of elegant dark-skinned hands with deep burgundy gloss manicure on wax-print fabric, gold cuff | Technician applying nail polish to a métis client's hand |
| Soins des pieds | Cinematic pedicured Afro feet in brass spa basin with rose petals, kente towel | Therapist massaging client's foot with oil |
| Naturels renforcés | Macro of healthy dark-skinned almond nails with translucent strengthener, gold leaf | Practitioner buffing & coating natural nails on Afro hand |
| BIAB | Editorial dark-skin hand with glossy BIAB finish, gold lamp glow | Technician brushing builder gel on client's nail under LED lamp |
| Capsules & extensions | Long stiletto burgundy + gold chrome nails on Afro hand, velvet & wax fabric | Sculpting/filing capsules on client's hand |
| Suppléments & nail art | Macro of Afro nails with gold leaf, cowrie-inspired beads, micro rhinestones | Artist painting fine nail art with detail brush |
| Dépose | Hand with bare healthy dark-skin nails after care, gold rim light | Technician gently filing off gel with electric drill, client's hand cradled |

The existing `image` (hero) and `flat` (action) fields in `src/lib/service-categories.ts` keep their paths — only the underlying JPGs change, so no code rewiring is needed for these.

### 2. Detail page focus (`src/routes/services.$slug.tsx`)

The current page already filters tariffs to one category, but the "Autres rituels" block sits at the same visual weight as the main content. I'll:

- Keep the entire main flow (hero → "Pour qui" → Rituel → Tarifs → Galerie → FAQ → CTA) **strictly about the selected service**.
- Replace the prominent 3-card "Autres rituels" grid with a **discreet "Autres prestations" footer strip**: a thin band, smaller type, horizontal scroll on mobile, tiny thumbnails (square 80px) + title, clearly labelled as secondary navigation — visually it reads "more from the menu", not "here are other services to consider instead".
- Move the strip below the CTA bandeau so the page narrative resolves on the booking call-to-action.
- The galerie section will use the service-specific `gallery` array (hero + action shot only — no cross-pollination with other services).

### 3. No other code changes

- Booking, home, and `/services` index keep their existing behaviour and styling.
- No schema / data changes; the `CategoryInfo` type stays as-is.

## Technical notes

- Regenerating into the same paths means imports in `service-categories.ts` (`@/assets/services/*-hero.jpg`, `*-flat.jpg`) remain valid.
- The "Autres prestations" footer strip is a presentational tweak to the existing `others` array — no router or data work.
- Image model: `standard` quality (good balance of fidelity / cost), 1536×1024 for heroes, 1280×1280 for action shots.

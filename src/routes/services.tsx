import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useMemo } from "react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { ASSETS } from "@/lib/assets";
import {
  CATEGORIES,
  CATEGORY_BY_SLUG,
  SLUG_BY_CATEGORY,
} from "@/lib/service-categories";
import { listServices } from "@/lib/booking.functions";
import { ServiceCard } from "@/components/catalog/service-card";
import { CatalogFilters, type SortKey } from "@/components/catalog/catalog-filters";

const opts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });

const searchSchema = z.object({
  cat: z.string().optional(),
  sort: z.enum(["popular", "price-asc", "price-desc", "duration"]).optional(),
});

export const Route = createFileRoute("/services")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Prestations — NailHouse" },
      { name: "description", content: "Catalogue des prestations NailHouse : manucure, pédicure, semi-permanent, gel, BIAB, capsules. Réservez en ligne." },
      { property: "og:title", content: "Prestations — NailHouse" },
      { property: "og:description", content: "Toutes les prestations de l'atelier NailHouse — réservation en ligne." },
      { property: "og:image", content: ASSETS.heroServices },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: ServicesCatalog,
  errorComponent: ({ error }) => <div className="p-10 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

// Duration parser — pulls the lower bound minutes out of strings like
// "45 min – 1 h 15" so we can sort by duration.
function durationMinutes(label: string): number {
  const hMatch = label.match(/(\d+)\s*h/);
  const mMatch = label.match(/(\d+)\s*min/);
  return (hMatch ? parseInt(hMatch[1], 10) * 60 : 0) + (mMatch ? parseInt(mMatch[1], 10) : 0);
}

function ServicesCatalog() {
  const { cat, sort = "popular" } = Route.useSearch();
  const { data: services } = useSuspenseQuery(opts);

  const activeInfo = cat ? CATEGORY_BY_SLUG[cat] : undefined;

  const filtered = useMemo(() => {
    let items = services.slice();
    if (activeInfo) items = items.filter((s) => s.category === activeInfo.category);
    switch (sort) {
      case "price-asc":
        items.sort((a, b) => a.price_fcfa - b.price_fcfa);
        break;
      case "price-desc":
        items.sort((a, b) => b.price_fcfa - a.price_fcfa);
        break;
      case "duration":
        items.sort((a, b) => {
          const sa = SLUG_BY_CATEGORY[a.category];
          const sb = SLUG_BY_CATEGORY[b.category];
          const da = sa ? durationMinutes(CATEGORY_BY_SLUG[sa]?.duration ?? "") : 0;
          const db = sb ? durationMinutes(CATEGORY_BY_SLUG[sb]?.duration ?? "") : 0;
          return da - db;
        });
        break;
      default:
        // "popular" — preserve server sort (which is the curated order)
        break;
    }
    return items;
  }, [services, activeInfo, sort]);

  return (
    <SiteLayout>
      {/* ───── HERO ───── */}
      <section className="relative isolate overflow-hidden bg-ink text-primary-foreground">
        <div className="absolute inset-0">
          <img
            src={ASSETS.heroServices}
            alt=""
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
          <p className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
            <span className="h-px w-8 bg-gold" /> La carte
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] md:text-7xl">
            Toutes les prestations
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80 md:text-lg">
            Explorez le catalogue, cliquez sur un soin pour ouvrir sa fiche détaillée — rituel, conseils,
            tarifs et réservation en ligne.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-gold px-7 text-ink hover:bg-gold/90">
              <Link to="/booking">Réserver maintenant</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/tarifs">Grille tarifaire complète</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ───── FILTERS ───── */}
      <CatalogFilters active={cat} sort={sort} count={filtered.length} />

      {/* ───── CATALOG ───── */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:py-16">
        {activeInfo && (
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-gold/20 pb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{activeInfo.tagline}</p>
              <h2 className="mt-2 font-serif text-3xl text-primary md:text-4xl">{activeInfo.title}</h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{activeInfo.intro}</p>
            </div>
            <Button asChild variant="link" className="text-gold">
              <Link to="/services/$slug" params={{ slug: activeInfo.slug }}>
                Lire le dossier complet →
              </Link>
            </Button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-primary">Aucune prestation dans cette sélection</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Essayez un autre filtre ou consultez tout le catalogue.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/services" search={{}}>
                Voir tout
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((s, i) => (
              <ServiceCard
                key={s.id}
                service={s}
                variant={i % 2 === 0 ? "hero" : "flat"}
              />
            ))}
          </div>
        )}
      </section>

      {/* ───── BROWSE BY UNIVERSE ───── */}
      {!activeInfo && (
        <section className="border-t border-gold/15 bg-muted/30 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Univers</p>
              <h2 className="mt-3 font-serif text-3xl text-primary md:text-4xl">
                Explorer par famille de soin
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Chaque famille a son dossier éditorial : rituel détaillé, conseils d'entretien, FAQ.
              </p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to="/services/$slug"
                  params={{ slug: c.slug }}
                  className="group flex items-center justify-between border border-gold/20 bg-card px-5 py-4 transition hover:border-gold"
                >
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.25em] text-gold">
                      {c.tagline}
                    </span>
                    <span className="mt-1 block font-serif text-lg text-primary">{c.title}</span>
                  </span>
                  <span className="text-gold transition group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───── TARIFS CTA ───── */}
      <section className="mx-auto max-w-5xl px-5 pb-20 pt-4">
        <div className="border border-gold/30 bg-card p-8 text-center md:p-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Tous nos tarifs</p>
          <h2 className="mt-3 font-serif text-2xl text-primary md:text-3xl">
            Consultez la grille tarifaire complète
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            L'ensemble des prestations et de leurs tarifs, en un coup d'œil.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-full bg-gold text-ink hover:bg-gold/90">
            <Link to="/tarifs">Voir la grille tarifaire</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}

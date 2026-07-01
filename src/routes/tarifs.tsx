// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Clock, ArrowRight, ShieldCheck, Gem } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { SoftImage } from "@/components/ui/soft-image";
import { listServices } from "@/lib/booking.functions";
import { CATEGORIES, SLUG_BY_CATEGORY, slugifyService } from "@/lib/service-categories";
import { useI18n } from "@/hooks/use-i18n";

const opts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Grille tarifaire — NailHouse" },
      {
        name: "description",
        content:
          "Grille tarifaire complète NailHouse : manucure, pédicure, semi-permanent, gel, BIAB, capsules. Tarifs en FCFA.",
      },
      { property: "og:title", content: "Grille tarifaire — NailHouse" },
      {
        property: "og:description",
        content: "Tarifs détaillés de toutes les prestations NailHouse en FCFA.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: TarifsPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

function TarifsPage() {
  const { language, t, translateService, translateCategory } = useI18n();
  const { data: rawData } = useSuspenseQuery(opts);

  // Translate all services first
  const data = (rawData || []).map((s) => translateService(s));

  // Translate all categories first
  const translatedCategories = CATEGORIES.map((cat) => translateCategory(cat));

  // Group services by category matching CATEGORIES order
  const grouped = translatedCategories.reduce<Record<string, typeof data>>((acc, cat) => {
    acc[cat.category] = data.filter((s) => s.category === cat.category);
    return acc;
  }, {});

  return (
    <SiteLayout>
      {/* ── CLEAN EDITORIAL HERO HEADER ── */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-gold text-xs uppercase tracking-[0.24em] font-semibold">
              {language === "en" ? "Transparency & Excellence" : "Transparence & Excellence"}
            </span>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-primary font-bold">
              {language === "en" ? (
                <>
                  Our Price <em className="text-gold not-italic">List</em>
                </>
              ) : (
                <>
                  Notre Carte des <em className="text-gold not-italic">Tarifs</em>
                </>
              )}
            </h1>
            <div className="mt-6 h-px w-10 bg-gold mx-auto sm:mx-0" />
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              {language === "en"
                ? "Discover our transparent pricing. Each service includes a personalized nail diagnosis and certified medical-grade autoclave sterilization."
                : "Découvrez nos tarifs en toute clarté. Chaque prestation comprend un diagnostic personnalisé de vos ongles et une stérilisation autoclave certifiée de grade médical."}
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground shrink-0">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="h-4 w-4 text-gold" />{" "}
              {language === "en" ? "Medical-Grade Hygiene" : "Hygiène de Grade Médical"}
            </span>
            <span>
              {language === "en"
                ? `${data.length} Services Available`
                : `${data.length} Prestations Disponibles`}
            </span>
          </div>
        </div>
      </section>

      {/* ── QUICK NAVIGATION JUMP LINKS (Table of Contents) ── */}
      <section className="sticky top-16 z-30 bg-background/85 backdrop-blur-md border-b border-border/40 py-4 px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold shrink-0 hidden sm:inline">
            {language === "en" ? "Jump to category:" : "Sauter à l'univers :"}
          </span>
          <div className="flex gap-6 overflow-x-auto scrollbar-none py-1.5">
            {translatedCategories.map((cat) => (
              <a
                key={cat.slug}
                href={`#cat-${cat.slug}`}
                className="text-xs sm:text-sm font-sans font-semibold tracking-wider text-primary/85 hover:text-gold transition duration-300 shrink-0 whitespace-nowrap"
              >
                {cat.title}
              </a>
            ))}
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-gold hover:bg-gold/90 text-white dark:text-ink text-xs uppercase font-semibold tracking-wider px-4 py-1 h-8 shrink-0 cursor-pointer"
          >
            <Link to="/booking">{t("btn_book")}</Link>
          </Button>
        </div>
      </section>

      {/* ── PRICING SECTIONS (PRODUCT CARD DESIGN) ── */}
      <section className="mx-auto max-w-6xl px-5 py-12 pb-24">
        <div className="space-y-16">
          {translatedCategories.map((cat) => {
            const items = grouped[cat.category] || [];
            if (items.length === 0) return null;

            return (
              <div
                key={cat.slug}
                id={`cat-${cat.slug}`}
                className="scroll-mt-32 rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* 1. Category Cover Banner (Mimicking Product Card image top) */}
                <div className="h-44 sm:h-56 md:h-64 relative overflow-hidden">
                  <SoftImage
                    src={cat.image}
                    alt={cat.title}
                    aspect="aspect-video"
                    className="w-full h-full object-cover rounded-none"
                    size="lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute bottom-5 left-6 md:left-10 z-10">
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gold">
                      {cat.tagline}
                    </span>
                    <h2 className="mt-1 font-serif text-2xl text-white md:text-3xl font-semibold">
                      {cat.title}
                    </h2>
                  </div>
                </div>

                {/* 2. Card Content Area */}
                <div className="p-6 md:p-10">
                  {/* Editorial Intro */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6 mb-6">
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                      {cat.intro}
                    </p>
                    <Link
                      to="/services/$slug"
                      params={{ slug: cat.slug }}
                      className="text-xs uppercase tracking-widest text-gold font-bold hover:underline flex items-center gap-1 transition-all duration-300 hover:translate-x-0.5 shrink-0"
                    >
                      {language === "en" ? "Discover the universe" : "Découvrir l'univers"}{" "}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* Services List Rows */}
                  <div className="divide-y divide-border/40">
                    {items.map((s, idx) => {
                      const catSlug = SLUG_BY_CATEGORY[s.category];
                      const serviceImage = idx % 2 === 0 ? cat.image : cat.flat;

                      const rowContent = (
                        <div className="flex items-center gap-4 py-4 hover:bg-muted/10 rounded-2xl px-2 transition duration-300">
                          {/* Left: Service Thumbnail */}
                          <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-xl overflow-hidden shadow-sm">
                            {catSlug ? (
                              <Link
                                to="/services/$slug/$service"
                                params={{ slug: catSlug, service: slugifyService(s.name) }}
                                className="block w-full h-full"
                              >
                                <SoftImage
                                  src={serviceImage}
                                  alt={s.name}
                                  aspect="aspect-square"
                                  className="w-full h-full object-cover"
                                  size="sm"
                                />
                              </Link>
                            ) : (
                              <SoftImage
                                src={serviceImage}
                                alt={s.name}
                                aspect="aspect-square"
                                className="w-full h-full object-cover"
                                size="sm"
                              />
                            )}
                          </div>

                          {/* Center: Name, Description & Duration */}
                          <div className="flex-1 min-w-0">
                            {catSlug ? (
                              <Link
                                to="/services/$slug/$service"
                                params={{ slug: catSlug, service: slugifyService(s.name) }}
                                className="block"
                              >
                                <h3 className="font-serif text-sm md:text-base text-primary font-semibold hover:text-gold transition-colors truncate">
                                  {s.name}
                                </h3>
                              </Link>
                            ) : (
                              <h3 className="font-serif text-sm md:text-base text-primary font-semibold transition-colors truncate">
                                {s.name}
                              </h3>
                            )}
                            <span
                              className="mt-0.5 text-xs text-muted-foreground line-clamp-1 leading-relaxed max-w-xl hidden sm:block"
                              dangerouslySetInnerHTML={{ __html: s.description || cat.intro || "" }}
                            />
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1 text-gold/60" />{" "}
                                {s.duration || cat.duration}
                              </span>
                            </div>
                          </div>

                          {/* Right: Price & Quick Action */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-serif text-sm md:text-base text-gold font-bold whitespace-nowrap">
                              {s.price_fcfa.toLocaleString("fr-FR")} F
                            </span>
                            <Button
                              asChild
                              size="sm"
                              className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 text-xs px-3.5 h-8 font-sans font-semibold uppercase tracking-wider hidden md:inline-flex cursor-pointer"
                            >
                              <Link to="/booking" search={{ service: s.id }}>
                                {t("btn_book")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );

                      return <div key={s.id}>{rowContent}</div>;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}

// @ts-nocheck
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  ArrowRight,
  CalendarCheck2,
  Search,
  X,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { SoftImage } from "@/components/ui/soft-image";
import { Button } from "@/components/ui/button";
import { listServices } from "@/lib/booking.functions";
import { listServiceGallery } from "@/lib/service-gallery.functions";
import { CATEGORY_BY_SLUG, slugifyService } from "@/lib/service-categories";
import { ShareButton } from "@/components/services/share-button";
import { useServiceSelection } from "@/hooks/use-service-selection";
import { useI18n } from "@/hooks/use-i18n";

const opts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });
const galleryOpts = (slug: string) =>
  queryOptions({
    queryKey: ["service-gallery", slug],
    queryFn: () => listServiceGallery({ data: { slug } }),
  });

export const Route = createFileRoute("/services/$slug/")({
  head: ({ params }) => {
    const info = CATEGORY_BY_SLUG[params.slug];
    const title = info ? `${info.title} — NailHouse` : "Prestation — NailHouse";
    const desc = info?.intro.slice(0, 155) ?? "Prestation NailHouse";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: info?.image ?? "" },
      ],
    };
  },
  loader: async ({ context, params }) => {
    if (!CATEGORY_BY_SLUG[params.slug]) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(opts),
      context.queryClient.ensureQueryData(galleryOpts(params.slug)),
    ]);
  },
  component: ServiceCategoryPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="font-serif text-4xl text-primary">Prestation introuvable</h1>
        <p className="mt-4 text-muted-foreground">Cette prestation n'existe pas ou plus.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/services">Voir toutes les prestations</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
});

function ServiceCategoryPage() {
  const { language, t, translateService, translateCategory } = useI18n();
  const { slug } = Route.useParams();
  const rawInfo = CATEGORY_BY_SLUG[slug]!;
  const info = translateCategory(rawInfo);

  const { data: rawServices } = useSuspenseQuery(opts);
  const { data: uploaded } = useSuspenseQuery(galleryOpts(slug));

  const data = (rawServices || []).map((s) => translateService(s));
  const items = data.filter((s) => s.category === info.category);
  const minPrice = items.length ? Math.min(...items.map((s) => s.price_fcfa)) : null;
  const firstId = items[0]?.id;

  const { addService, removeService, isSelected } = useServiceSelection();

  const [searchQuery, setSearchQuery] = useState("");
  const filteredItems = items.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const galleryImages: { url: string; caption: string | null }[] =
    uploaded.length > 0
      ? uploaded.slice(0, 2).map((g) => ({ url: g.url, caption: g.caption ?? null }))
      : [
          { url: info.image, caption: info.title },
          { url: info.flat, caption: `${info.title} — atelier` },
        ];

  return (
    <SiteLayout>
      {/* ── HERO ── */}
      <section className="bg-background text-foreground border-b border-border/40 py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 items-center">
            {/* Left Column: Text & CTAs */}
            <div className="md:col-span-7 flex flex-col justify-center">
              {/* Breadcrumb */}
              <nav
                aria-label={language === "en" ? "Breadcrumb" : "Fil d'Ariane"}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-muted-foreground"
              >
                <Link to="/" className="hover:text-gold">
                  {t("breadcrumb_home")}
                </Link>
                <ChevronRight className="h-3 w-3 opacity-40" />
                <Link to="/services" className="hover:text-gold">
                  {t("breadcrumb_services")}
                </Link>
                <ChevronRight className="h-3 w-3 opacity-40" />
                <span className="text-gold">{info.title}</span>
              </nav>

              <div className="mt-8 fade-up">
                <p className="label-luxe">{info.tagline}</p>
                <h1 className="mt-4 font-serif text-4xl text-foreground leading-tight md:text-5xl">
                  {info.title}
                </h1>
                <div className="mt-6 h-px w-10 bg-gold" />
                <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base font-sans">
                  {info.intro}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-gold px-8 text-white dark:text-ink hover:bg-gold/95 shadow-md shadow-gold/10 cursor-pointer"
                  >
                    <Link to="/booking" search={{ service: firstId }}>
                      {language === "en" ? "Book an appointment" : "Prendre rendez-vous"}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-border text-foreground hover:bg-muted/15 cursor-pointer"
                  >
                    <Link to="/services">
                      {language === "en" ? "← All services" : "← Toutes les prestations"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: SoftImage representing the category */}
            <div className="md:col-span-5 fade-up">
              <SoftImage
                src={info.image}
                alt={info.title}
                aspect="aspect-[4/3]"
                size="lg"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES LIST ── */}
      <section className="mx-auto max-w-5xl px-6 py-12 md:py-14">
        <div className="mb-10 text-center">
          <p className="label-luxe">{language === "en" ? "Our Services" : "Nos Prestations"}</p>
          <h2 className="mt-5 font-serif text-3xl text-primary md:text-4xl">
            {language === "en" ? "Available Services" : "Soins disponibles"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            {language === "en"
              ? "Click on a service to see its complete details and book."
              : "Cliquez sur une prestation pour voir ses détails complets et réserver."}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10 max-w-md mx-auto relative px-2">
          <label htmlFor="service-search" className="sr-only">
            {language === "en" ? "Search for a service" : "Rechercher un soin"}
          </label>
          <div className="relative">
            <input
              id="service-search"
              type="text"
              placeholder={
                language === "en"
                  ? "Search for a service (e.g. manicure, polish...)"
                  : "Rechercher un soin (ex: manucure, vernis...)"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-gold/20 hover:border-gold/40 focus:border-gold focus:outline-none rounded-full py-3.5 pl-12 pr-10 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 shadow-sm focus:ring-1 focus:ring-gold"
            />
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer p-0.5"
                aria-label={language === "en" ? "Clear search" : "Effacer la recherche"}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-3.5 text-center text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              {language === "en"
                ? `${filteredItems.length} service${filteredItems.length !== 1 ? "s" : ""} found`
                : `${filteredItems.length} prestation${filteredItems.length !== 1 ? "s" : ""} trouvée${filteredItems.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-muted/25 rounded-3xl border border-dashed border-gold/15 max-w-md mx-auto">
            <p className="text-xs text-muted-foreground">
              {language === "en"
                ? "No services match your search."
                : "Aucune prestation ne correspond à votre recherche."}
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-xs font-semibold text-gold hover:text-gold/85 underline underline-offset-4 cursor-pointer"
            >
              {language === "en" ? "Reset search" : "Réinitialiser la recherche"}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredItems.map((s) => {
              const now = new Date();
              const hasPromo =
                s.seasonal_price_fcfa &&
                (!s.seasonal_price_start || new Date(s.seasonal_price_start) <= now) &&
                (!s.seasonal_price_end || new Date(s.seasonal_price_end) >= now);
              const displayPrice = hasPromo ? s.seasonal_price_fcfa! : s.price_fcfa;
              const originalPrice = hasPromo ? s.price_fcfa : null;

              return (
                <div
                  key={s.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-gold/15 bg-card p-6 transition-all duration-300 hover:border-gold/30 hover:shadow-[0_12px_30px_rgba(195,161,95,0.06)] hover:-translate-y-0.5"
                >
                  {/* Floating Share Button at the top right */}
                  <div className="absolute right-5 top-5 z-20">
                    <ShareButton
                      title={s.name}
                      text={t("share_text", { name: s.name, category: info.title })}
                      path={`/services/${slug}/${slugifyService(s.name)}`}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gold/10 text-gold"
                    />
                  </div>

                  {/* Card content wrapped in Link */}
                  <Link
                    to="/services/$slug/$service"
                    params={{ slug, service: slugifyService(s.name) }}
                    className="flex-1 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <h3 className="font-serif text-xl pr-10 text-primary transition-colors duration-300 group-hover:text-gold">
                        {s.name}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {s.description}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex flex-col">
                        {originalPrice && (
                          <span className="text-xs text-muted-foreground/60 line-through font-serif decoration-destructive/50 -mb-1">
                            {originalPrice.toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                        <span className="font-serif text-xl text-gold font-semibold">
                          {displayPrice.toLocaleString("fr-FR")}{" "}
                          <span className="text-xs uppercase tracking-wider font-sans text-muted-foreground/60">
                            FCFA
                          </span>
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] font-semibold text-gold opacity-75 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5">
                        {language === "en" ? "Details" : "Détails"}{" "}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── DÉROULEMENT ── */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <p className="label-luxe">{language === "en" ? "The Experience" : "Le déroulement"}</p>
            <h2 className="mt-4 font-serif text-2xl text-primary md:text-3xl">
              {t("details_experience")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {info.steps.map((step, i) => (
              <div key={step.title} className="rounded-2xl bg-card p-6 shadow-sm">
                <span className="font-serif text-3xl text-gold/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-serif text-lg text-primary">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY — soft pair ── */}
      {galleryImages.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <div className="mb-10">
            <p className="label-luxe">{language === "en" ? "In images" : "En images"}</p>
            <h2 className="mt-5 font-serif text-2xl text-primary md:text-3xl">
              {language === "en"
                ? `A look at ${info.title.toLowerCase()}`
                : `Le regard sur ${info.title.toLowerCase()}`}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {galleryImages.map((g, i) => (
              <SoftImage
                key={`${g.url}-${i}`}
                src={g.url}
                alt={g.caption ?? info.title}
                aspect="aspect-[4/3]"
                size="lg"
              />
            ))}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <div className="mb-10 text-center">
          <p className="label-luxe">{t("details_faq_title")}</p>
          <h2 className="mt-5 font-serif text-3xl text-primary md:text-4xl">
            {t("details_faq_subtitle")}
          </h2>
        </div>
        <div className="divide-y divide-border">
          {info.faq.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-serif text-base text-primary">
                <span>{f.q}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-gold transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-ink py-16 text-primary-foreground md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
          <p className="label-luxe">
            {language === "en" ? "Ready to be pampered?" : "Prête à vous faire chouchouter"}
          </p>
          <h2 className="mt-5 font-serif text-3xl md:text-4xl">
            {language === "en"
              ? `Treat yourself to a ${info.title.toLowerCase()} moment`
              : `Offrez-vous un moment ${info.title.toLowerCase()}`}
          </h2>
          {minPrice && (
            <p className="mt-4 text-sm text-primary-foreground/65">
              {language === "en" ? (
                <>
                  Starting from{" "}
                  <span className="text-gold">{minPrice.toLocaleString("fr-FR")} FCFA</span> · book
                  online in seconds.
                </>
              ) : (
                <>
                  À partir de{" "}
                  <span className="text-gold">{minPrice.toLocaleString("fr-FR")} FCFA</span> ·
                  réservation en ligne en quelques secondes.
                </>
              )}
            </p>
          )}
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-full bg-gold px-10 text-white dark:text-ink hover:bg-gold/90 cursor-pointer"
          >
            <Link to="/booking" search={{ service: firstId }}>
              {t("btn_book_now")}
            </Link>
          </Button>
        </div>
      </section>

      {/* ── STICKY BAR ── */}
      <div className="pointer-events-none sticky bottom-0 z-40 w-full border-t border-gold/20 bg-ink/95 backdrop-blur-md">
        <div className="pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3 text-primary-foreground md:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
              <CalendarCheck2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-serif text-sm">{info.title}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/55">
                {info.duration}
                {minPrice
                  ? ` · ${language === "en" ? "from" : "dès"} ${minPrice.toLocaleString("fr-FR")} F`
                  : ""}
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="shrink-0 rounded-full bg-gold px-6 text-white dark:text-ink hover:bg-gold/90 cursor-pointer"
          >
            <Link to="/booking" search={{ service: firstId }}>
              {t("btn_book")}
            </Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
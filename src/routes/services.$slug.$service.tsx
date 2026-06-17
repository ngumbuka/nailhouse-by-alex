import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  CalendarCheck2,
} from "lucide-react";
import { useRef } from "react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { listServices } from "@/lib/booking.functions";
import { listServiceGallery } from "@/lib/service-gallery.functions";
import {
  CATEGORIES,
  CATEGORY_BY_SLUG,
  slugifyService,
} from "@/lib/service-categories";
import { buildServiceCopy } from "@/lib/service-copy";
import { ServiceCard } from "@/components/catalog/service-card";
import { StickyPurchaseBar } from "@/components/services/sticky-purchase-bar";

const servicesOpts = queryOptions({
  queryKey: ["services"],
  queryFn: () => listServices(),
});
const galleryOpts = (slug: string) =>
  queryOptions({
    queryKey: ["service-gallery", slug],
    queryFn: () => listServiceGallery({ data: { slug } }),
  });

export const Route = createFileRoute("/services/$slug/$service")({
  head: ({ params }) => {
    const info = CATEGORY_BY_SLUG[params.slug];
    const pretty = params.service.replace(/-/g, " ");
    const title = info
      ? `${pretty} — ${info.title} — NailHouse`
      : "Prestation — NailHouse";
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
      context.queryClient.ensureQueryData(servicesOpts),
      context.queryClient.ensureQueryData(galleryOpts(params.slug)),
    ]);
  },
  component: ServiceDetailPage,
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

function GoldRule({ className = "" }: { className?: string }) {
  return <span className={`block h-px w-16 bg-gold ${className}`} aria-hidden />;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
      <span className="h-px w-8 bg-gold" />
      {children}
    </span>
  );
}

function ServiceDetailPage() {
  const { slug, service: serviceSlug } = Route.useParams();
  const info = CATEGORY_BY_SLUG[slug]!;
  const { data: services } = useSuspenseQuery(servicesOpts);
  const { data: uploaded } = useSuspenseQuery(galleryOpts(slug));

  const categoryServices = services.filter((s) => s.category === info.category);
  const service = categoryServices.find((s) => slugifyService(s.name) === serviceSlug);

  if (!service) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="font-serif text-4xl text-primary">Prestation introuvable</h1>
          <p className="mt-4 text-muted-foreground">
            Cette prestation n'existe pas dans la carte {info.title.toLowerCase()}.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/services/$slug" params={{ slug }}>
              Voir la carte {info.title.toLowerCase()}
            </Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const copy = buildServiceCopy(service, info);
  const siblings = categoryServices.filter((s) => s.id !== service.id);
  const otherCategories = CATEGORIES.filter((c) => c.slug !== slug);

  const galleryImages: { url: string; caption: string | null }[] =
    uploaded.length > 0
      ? uploaded.slice(0, 4).map((g) => ({ url: g.url, caption: g.caption ?? null }))
      : [
          { url: info.image, caption: info.title },
          { url: info.flat, caption: `${info.title} — atelier` },
        ];

  const carouselRef = useRef<HTMLUListElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <SiteLayout>
      {/* ───────── HERO ───────── */}
      <section className="relative isolate overflow-hidden bg-ink text-primary-foreground">
        <div className="absolute inset-0">
          <img src={info.image} alt={service.name} className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-transparent to-ink/30" />
        </div>

        <div className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-between px-6 pb-16 pt-10 md:px-10 md:pb-24 md:pt-14">
          <nav
            aria-label="Fil d'Ariane"
            className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-primary-foreground/70"
          >
            <Link to="/" className="hover:text-gold">Maison</Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <Link to="/services" className="hover:text-gold">Prestations</Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <Link to="/services/$slug" params={{ slug }} className="hover:text-gold">
              {info.title}
            </Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="text-gold">{service.name}</span>
          </nav>

          <div className="max-w-2xl">
            <Eyebrow>{copy.tagline}</Eyebrow>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] md:text-7xl">
              {service.name}
            </h1>
            <GoldRule className="mt-8" />
            <p className="mt-8 max-w-xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
              {copy.whatItIs}
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-primary-foreground/10 py-6 sm:grid-cols-3">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.28em] text-primary-foreground/60">
                  Durée
                </dt>
                <dd className="mt-2 font-serif text-lg text-gold">{info.duration}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.28em] text-primary-foreground/60">
                  Tarif
                </dt>
                <dd className="mt-2 font-serif text-lg text-gold">
                  {service.price_fcfa.toLocaleString("fr-FR")} F
                </dd>
              </div>
              <div className="hidden sm:block">
                <dt className="text-[10px] uppercase tracking-[0.28em] text-primary-foreground/60">
                  Hygiène
                </dt>
                <dd className="mt-2 font-serif text-lg text-gold">Stérilisé</dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-full bg-gold px-9 text-ink hover:bg-gold/90">
                <Link to="/booking" search={{ service: service.id }}>
                  Réserver ce soin
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/services/$slug" params={{ slug }}>
                  ← Carte {info.title.toLowerCase()}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── DESCRIPTION ───────── */}
      <section className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <Eyebrow>En quoi consiste cette prestation</Eyebrow>
        <h2 className="mt-6 font-serif text-3xl text-primary md:text-4xl">
          {service.name}, dans le détail
        </h2>
        <GoldRule className="mt-6" />
        <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>{copy.whatItIs}</p>
          <p>{copy.forWhom}.</p>
          <p>{copy.finalNote}</p>
        </div>
      </section>

      {/* ───────── RITUEL ───────── */}
      <section className="bg-ink py-24 text-primary-foreground md:py-28">
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <div className="text-center">
            <Eyebrow>Le rituel</Eyebrow>
            <h2 className="mt-6 font-serif text-3xl md:text-4xl">Une expérience en quatre temps</h2>
            <GoldRule className="mx-auto mt-6" />
          </div>
          <ol className="mt-14 grid gap-px bg-gold/20 md:grid-cols-4">
            {info.ritual.map((step, i) => (
              <li key={step.title} className="bg-ink p-8 md:p-9">
                <span className="font-serif text-4xl text-gold/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-serif text-xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── TARIF & RESERVATION ───────── */}
      <section className="mx-auto max-w-3xl px-6 py-24 md:py-28">
        <div className="border border-gold/30 bg-card p-8 md:p-12">
          <Eyebrow>Tarif & réservation</Eyebrow>
          <h2 className="mt-6 font-serif text-3xl text-primary md:text-4xl">{service.name}</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Préparation, pose et finition incluses. Durée moyenne : {info.duration}.
          </p>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-serif text-5xl text-gold md:text-6xl">
              {service.price_fcfa.toLocaleString("fr-FR")}
            </span>
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">FCFA</span>
          </div>
          <ul className="mt-8 space-y-3">
            {info.whyUs.slice(0, 3).map((w) => (
              <li key={w} className="flex gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
          <Button
            asChild
            size="lg"
            className="mt-10 w-full rounded-full bg-gold text-ink hover:bg-gold/90 sm:w-auto sm:px-12"
          >
            <Link to="/booking" search={{ service: service.id }}>
              Réserver ce soin
            </Link>
          </Button>
        </div>
      </section>

      {/* ───────── AFTERCARE & FAQ ───────── */}
      <section className="bg-muted/30 py-24 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2 md:px-10">
          <div>
            <Eyebrow>Entre deux rendez-vous</Eyebrow>
            <h2 className="mt-6 font-serif text-2xl text-primary md:text-3xl">Conseils d'entretien</h2>
            <GoldRule className="mt-6" />
            <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
              {info.care.map((c) => (
                <li key={c} className="flex gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow>Questions fréquentes</Eyebrow>
            <h2 className="mt-6 font-serif text-2xl text-primary md:text-3xl">On répond à vos doutes</h2>
            <GoldRule className="mt-6" />
            <div className="mt-8 space-y-3">
              {info.faq.map((f) => (
                <details
                  key={f.q}
                  className="group border-b border-gold/20 py-4 transition open:border-gold"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-serif text-base text-primary">
                    <span>{f.q}</span>
                    <ChevronRight className="h-4 w-4 text-gold transition group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── GALLERY ───────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <div className="text-center">
          <Eyebrow>En images</Eyebrow>
          <h2 className="mt-6 font-serif text-3xl text-primary md:text-4xl">
            Le regard sur {info.title.toLowerCase()}
          </h2>
          <GoldRule className="mx-auto mt-6" />
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {galleryImages.map((g, i) => (
            <figure key={`${g.url}-${i}`} className="group relative aspect-[3/4] overflow-hidden rounded-sm">
              <img
                src={g.url}
                alt={g.caption ?? service.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
              />
              <div className="pointer-events-none absolute inset-2 border border-gold/30" />
            </figure>
          ))}
        </div>
      </section>

      {/* ───────── RELATED STRIP ───────── */}
      <section
        aria-label="Prestations associées"
        className="border-t border-gold/15 bg-background py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>À découvrir aussi</Eyebrow>
              <h2 className="mt-6 font-serif text-3xl text-primary md:text-4xl">
                Prestations associées
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                D'abord les autres soins de la carte {info.title.toLowerCase()}, puis les autres rituels de la maison.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Précédent"
                className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-gold transition hover:bg-gold hover:text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Suivant"
                className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-gold transition hover:bg-gold hover:text-ink"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <GoldRule className="mt-8" />

          <ul
            ref={carouselRef}
            className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {siblings.map((s) => (
              <li key={s.id} className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[28%]">
                <Link
                  to="/services/$slug/$service"
                  params={{ slug, service: slugifyService(s.name) }}
                  className="group block h-full border border-gold/20 bg-card p-5 transition hover:border-gold"
                >
                  <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{info.title}</p>
                  <h3 className="mt-3 font-serif text-xl text-primary md:text-2xl">{s.name}</h3>
                  <p className="mt-4 font-serif text-2xl text-gold">
                    {s.price_fcfa.toLocaleString("fr-FR")}
                    <span className="ml-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">F</span>
                  </p>
                  <p className="mt-6 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-gold group-hover:underline">
                    Voir le détail <ChevronRight className="h-3 w-3" />
                  </p>
                </Link>
              </li>
            ))}

            {siblings.length > 0 && (
              <li
                aria-hidden
                className="flex shrink-0 snap-start items-center px-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
              >
                <span className="mr-3 h-px w-10 bg-gold/30" />
                Autres rituels
                <span className="ml-3 h-px w-10 bg-gold/30" />
              </li>
            )}

            {otherCategories.map((c) => (
              <li key={c.slug} className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[28%]">
                <Link
                  to="/services/$slug"
                  params={{ slug: c.slug }}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                    <img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                    />
                    <div className="pointer-events-none absolute inset-3 border border-gold/30 transition group-hover:border-gold" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent p-5">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{c.tagline}</p>
                      <h3 className="mt-2 font-serif text-xl text-primary-foreground">{c.title}</h3>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      <Clock className="mr-1 inline h-3 w-3" />
                      {c.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-gold group-hover:underline">
                      Découvrir <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  CalendarCheck2,
  Check,
  Sparkles,
  Clock,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { listServices } from "@/lib/booking.functions";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/service-categories";

const opts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });

export const Route = createFileRoute("/services/$slug")({
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
    await context.queryClient.ensureQueryData(opts);
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

function ServiceCategoryPage() {
  const { slug } = Route.useParams();
  const info = CATEGORY_BY_SLUG[slug]!;
  const { data } = useSuspenseQuery(opts);
  const items = data.filter((s) => s.category === info.category);
  const others = CATEGORIES.filter((c) => c.slug !== slug);
  const minPrice = items.length ? Math.min(...items.map((s) => s.price_fcfa)) : null;
  const firstId = items[0]?.id;

  return (
    <SiteLayout>
      {/* ───────── HERO — cinematic editorial ───────── */}
      <section className="relative isolate overflow-hidden bg-ink text-primary-foreground">
        <div className="absolute inset-0">
          <img
            src={info.image}
            alt={info.title}
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-transparent to-ink/40" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-between px-6 pb-16 pt-10 md:px-10 md:pb-24 md:pt-14">
          <nav
            aria-label="Fil d'Ariane"
            className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-primary-foreground/70"
          >
            <Link to="/" className="hover:text-gold">
              Maison
            </Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <Link to="/services" className="hover:text-gold">
              Prestations
            </Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="text-gold">{info.title}</span>
          </nav>

          <div className="max-w-3xl">
            <Eyebrow>{info.tagline}</Eyebrow>
            <h1 className="mt-6 font-serif text-5xl leading-[1.02] md:text-7xl lg:text-[5.5rem]">
              {info.title}
            </h1>
            <GoldRule className="mt-8" />
            <p className="mt-8 max-w-xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
              {info.intro}
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-y border-primary-foreground/10 py-6">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.28em] text-primary-foreground/60">
                  Durée
                </dt>
                <dd className="mt-2 font-serif text-lg text-gold">{info.duration}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.28em] text-primary-foreground/60">
                  À partir de
                </dt>
                <dd className="mt-2 font-serif text-lg text-gold">
                  {minPrice ? `${minPrice.toLocaleString("fr-FR")} F` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.28em] text-primary-foreground/60">
                  Hygiène
                </dt>
                <dd className="mt-2 font-serif text-lg text-gold">Stérilisé</dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-gold px-9 text-ink hover:bg-gold/90"
              >
                <Link to="/booking" search={{ service: firstId }}>
                  Réserver ce rituel
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/services">← Toutes les prestations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── INTRO — "Pour qui" editorial ───────── */}
      <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-14 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <img
              src={info.flat}
              alt={`${info.title} — détails`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-3 border border-gold/30" />
          </div>
          <div>
            <Eyebrow>Pour qui</Eyebrow>
            <h2 className="mt-6 font-serif text-4xl leading-tight text-primary md:text-5xl">
              {info.bestFor}
            </h2>
            <GoldRule className="mt-8" />
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { icon: Clock, label: "Durée", value: info.duration },
                { icon: ShieldCheck, label: "Hygiène", value: "Outils stérilisés" },
                { icon: HeartHandshake, label: "Sur-mesure", value: "Conseil dédié" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="border-t border-gold/40 pt-4"
                >
                  <f.icon className="h-4 w-4 text-gold" />
                  <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    {f.label}
                  </p>
                  <p className="mt-1 font-serif text-base text-primary">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── RITUEL — couture timeline ───────── */}
      <section className="bg-ink py-24 text-primary-foreground md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Le rituel</Eyebrow>
            <h2 className="mt-6 font-serif text-4xl md:text-5xl">Une expérience en quatre temps</h2>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-primary-foreground/70">
              Chaque geste est pensé pour vous sublimer, du diagnostic à la signature finale.
            </p>
            <GoldRule className="mx-auto mt-8" />
          </div>

          <ol className="mt-16 grid gap-px bg-gold/20 md:grid-cols-4">
            {info.ritual.map((step, i) => (
              <li
                key={step.title}
                className="group relative bg-ink p-8 transition hover:bg-ink/60 md:p-10"
              >
                <span className="font-serif text-5xl text-gold/40 transition group-hover:text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-serif text-2xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── TARIFS — atelier card ───────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-16 md:grid-cols-[1.4fr_1fr] md:items-start">
          <div>
            <Eyebrow>Carte des tarifs</Eyebrow>
            <h2 className="mt-6 font-serif text-4xl text-primary md:text-5xl">{info.title}</h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Tous les prix sont indiqués en FCFA et incluent la préparation, la pose et la
              finition.
            </p>
            <GoldRule className="mt-8" />

            <ul className="mt-10 divide-y divide-gold/20 border-y border-gold/20">
              {items.map((s) => (
                <li
                  key={s.id}
                  className="group flex items-center justify-between gap-6 py-6"
                >
                  <div className="min-w-0">
                    <p className="font-serif text-xl text-primary md:text-2xl">{s.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                      {info.tagline}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-serif text-2xl text-gold md:text-3xl">
                      {s.price_fcfa.toLocaleString("fr-FR")}
                      <span className="ml-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        F
                      </span>
                    </p>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-full border-primary/30 text-[11px] uppercase tracking-[0.2em]"
                    >
                      <Link to="/booking" search={{ service: s.id }}>
                        Réserver
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
              {items.length === 0 && (
                <li className="py-6 text-sm text-muted-foreground">
                  La carte des tarifs sera dévoilée très prochainement.
                </li>
              )}
            </ul>
          </div>

          <aside className="space-y-6 md:sticky md:top-28">
            <div className="border border-gold/30 bg-card p-8">
              <Sparkles className="h-5 w-5 text-gold" />
              <h3 className="mt-5 font-serif text-2xl text-primary">L'expérience NailHouse</h3>
              <ul className="mt-6 space-y-4">
                {info.whyUs.map((w) => (
                  <li key={w} className="flex gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-8 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/booking" search={{ service: firstId }}>
                  Réserver ce soin
                </Link>
              </Button>
            </div>
            <div className="border border-border bg-card p-8">
              <h4 className="font-serif text-xl text-primary">Entre deux rendez-vous</h4>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {info.care.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="text-gold">·</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ───────── GALERIE — service-specific ───────── */}
      <section className="bg-muted/40 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>En images</Eyebrow>
              <h2 className="mt-6 font-serif text-4xl text-primary md:text-5xl">
                Le regard sur {info.title.toLowerCase()}
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Une sélection éditoriale dédiée à ce rituel — chaque image a été pensée pour vous
              transporter.
            </p>
          </div>
          <GoldRule className="mt-10" />

          <div className="mt-12 grid gap-6 md:grid-cols-12">
            <div className="md:col-span-8">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
                <img
                  src={info.image}
                  alt={info.title}
                  className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-3 border border-gold/30" />
              </div>
            </div>
            <div className="md:col-span-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm md:aspect-auto md:h-full">
                <img
                  src={info.flat}
                  alt={`${info.title} — atelier`}
                  className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-3 border border-gold/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FAQ — couture accordion ───────── */}
      <section className="mx-auto max-w-4xl px-6 py-24 md:py-32">
        <div className="text-center">
          <Eyebrow>Questions fréquentes</Eyebrow>
          <h2 className="mt-6 font-serif text-4xl text-primary md:text-5xl">
            On répond à vos doutes
          </h2>
          <GoldRule className="mx-auto mt-8" />
        </div>
        <div className="mt-12 space-y-3">
          {info.faq.map((f) => (
            <details
              key={f.q}
              className="group border-b border-gold/20 py-5 transition open:border-gold"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-serif text-lg text-primary md:text-xl">
                <span>{f.q}</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 text-gold transition group-open:rotate-90 group-open:bg-gold group-open:text-ink">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ───────── CTA — couture bandeau ───────── */}
      <section className="bg-ink py-20 text-primary-foreground md:py-28">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center md:px-10">
          <Eyebrow>Prête à passer en cabine</Eyebrow>
          <h2 className="mt-6 font-serif text-4xl md:text-6xl">
            Offrez-vous un moment {info.title.toLowerCase()}.
          </h2>
          <GoldRule className="mx-auto mt-8" />
          {minPrice && (
            <p className="mt-6 max-w-md text-sm text-primary-foreground/70">
              À partir de{" "}
              <span className="text-gold">{minPrice.toLocaleString("fr-FR")} FCFA</span> ·
              réservation en ligne en quelques secondes.
            </p>
          )}
          <Button
            asChild
            size="lg"
            className="mt-10 rounded-full bg-gold px-10 text-ink hover:bg-gold/90"
          >
            <Link to="/booking" search={{ service: firstId }}>
              Réserver maintenant
            </Link>
          </Button>
        </div>
      </section>

      {/* ───────── Autres prestations — discreet footer strip ───────── */}
      <section
        aria-label="Autres prestations"
        className="border-t border-gold/15 bg-background py-10"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Autres prestations de la maison
            </p>
            <Link
              to="/services"
              className="text-[10px] uppercase tracking-[0.28em] text-gold hover:underline"
            >
              Toute la carte →
            </Link>
          </div>
          <ul className="mt-6 -mx-2 flex gap-3 overflow-x-auto pb-2">
            {others.map((c) => (
              <li key={c.slug} className="shrink-0 px-2">
                <Link
                  to="/services/$slug"
                  params={{ slug: c.slug }}
                  className="group flex items-center gap-3 rounded-full border border-border bg-card/60 py-2 pl-2 pr-4 transition hover:border-gold/50 hover:bg-card"
                >
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <img
                      src={c.image}
                      alt=""
                      aria-hidden
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </span>
                  <span className="font-serif text-sm text-primary group-hover:text-gold">
                    {c.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Sticky elegant CTA ───────── */}
      <div className="pointer-events-none sticky bottom-4 z-40 mx-auto w-full max-w-5xl px-4 pb-4">
        <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 border border-gold/40 bg-ink/95 px-5 py-3 text-primary-foreground shadow-2xl backdrop-blur-md md:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
              <CalendarCheck2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-serif text-lg">{info.title}</p>
              <p className="truncate text-[10px] uppercase tracking-[0.25em] text-primary-foreground/60">
                {info.duration}
                {minPrice ? ` · dès ${minPrice.toLocaleString("fr-FR")} F` : ""}
              </p>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full bg-gold px-7 text-ink hover:bg-gold/90"
          >
            <Link to="/booking" search={{ service: firstId }}>
              Réserver
            </Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}

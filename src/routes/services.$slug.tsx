import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight, CalendarCheck2, Check, Sparkles, Clock, ShieldCheck, HeartHandshake } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { ASSETS } from "@/lib/assets";
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
        { property: "og:image", content: info?.image ?? ASSETS.polishShelves },
      ],
    };
  },
  loader: async ({ context, params }) => {
    if (!CATEGORY_BY_SLUG[params.slug]) throw notFound();
    await context.queryClient.ensureQueryData(opts);
  },
  component: ServiceCategoryPage,
  errorComponent: ({ error }) => <div className="p-10 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="font-serif text-4xl text-primary">Prestation introuvable</h1>
        <p className="mt-4 text-muted-foreground">Cette prestation n'existe pas ou plus.</p>
        <Button asChild className="mt-6 rounded-full"><Link to="/services">Voir toutes les prestations</Link></Button>
      </div>
    </SiteLayout>
  ),
});

function ServiceCategoryPage() {
  const { slug } = Route.useParams();
  const info = CATEGORY_BY_SLUG[slug]!;
  const { data } = useSuspenseQuery(opts);
  const items = data.filter((s) => s.category === info.category);
  const others = CATEGORIES.filter((c) => c.slug !== slug);

  return (
    <SiteLayout>
      <section className="relative">
        <div className="relative aspect-[5/2] w-full overflow-hidden md:aspect-[5/1.4]">
          <img src={info.image} alt={info.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="mx-auto max-w-6xl px-5 pt-6">
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">Accueil</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <Link to="/services" className="hover:text-primary">Prestations</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span className="text-primary">{info.title}</span>
          </nav>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">{info.tagline}</p>
          <h1 className="mt-3 font-serif text-4xl text-primary md:text-6xl">{info.title}</h1>
          <p className="mt-5 max-w-2xl text-muted-foreground">{info.intro}</p>
          <p className="mt-3 text-sm text-accent">Durée indicative : {info.duration}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/booking" search={{ service: items[0]?.id }}>Réserver cette prestation</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7">
              <Link to="/services">← Toutes les prestations</Link>
            </Button>
          </div>
        </div>
      </section>



      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-10">
          <h2 className="font-serif text-2xl text-primary md:text-3xl">Tarifs</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tous les prix sont en FCFA.</p>
          <div className="mt-6 divide-y divide-border">
            {items.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm md:text-base">{s.name}</p>
                  <p className="mt-1 font-serif text-base text-accent">
                    {s.price_fcfa.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground">FCFA</span>
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link to="/booking" search={{ service: s.id }}>Réserver</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h3 className="font-serif text-xl text-primary">Ce que comprend la prestation</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {info.highlights.map((h) => (
                <li key={h} className="flex gap-2"><span className="text-accent">·</span><span>{h}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h3 className="font-serif text-xl text-primary">Conseils d'entretien</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {info.care.map((h) => (
                <li key={h} className="flex gap-2"><span className="text-accent">·</span><span>{h}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* "Pour qui ?" + trio assurance */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-card to-accent/[0.04] p-6 md:p-12">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Pour qui ?</p>
              <h2 className="mt-3 font-serif text-3xl text-primary md:text-4xl">{info.bestFor}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-background/60 p-4 backdrop-blur">
                  <Clock className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Durée</p>
                  <p className="mt-1 font-serif text-base text-primary">{info.duration}</p>
                </div>
                <div className="rounded-2xl bg-background/60 p-4 backdrop-blur">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hygiène</p>
                  <p className="mt-1 font-serif text-base text-primary">Outils stérilisés</p>
                </div>
                <div className="rounded-2xl bg-background/60 p-4 backdrop-blur">
                  <HeartHandshake className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sur-mesure</p>
                  <p className="mt-1 font-serif text-base text-primary">Conseil dédié</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl ring-1 ring-primary/10">
              <img src={info.gallery[0] ?? info.image} alt={info.title} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Rituel — étapes */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Le rituel</p>
            <h2 className="mt-2 font-serif text-3xl text-primary md:text-4xl">Étape par étape</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">Une expérience pensée pour vous sublimer, du diagnostic à la finition.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {info.ritual.map((step, i) => (
            <div key={step.title} className="group relative rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl">
              <span className="absolute -top-3 left-6 inline-flex h-7 items-center rounded-full bg-accent px-3 font-serif text-xs text-accent-foreground">
                Étape {i + 1}
              </span>
              <h3 className="mt-2 font-serif text-lg text-primary">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Galerie + Pourquoi nous */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">En images</p>
            <h2 className="mt-2 font-serif text-3xl text-primary md:text-4xl">Réalisations & ambiance</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              {info.gallery.map((src, i) => (
                <div key={src + i} className={`overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-square md:col-span-2 md:row-span-2" : "aspect-square"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-primary/15 bg-card p-6 md:p-8">
            <Sparkles className="h-6 w-6 text-accent" />
            <h3 className="mt-4 font-serif text-2xl text-primary">Pourquoi NailHouse</h3>
            <ul className="mt-5 space-y-4">
              {info.whyUs.map((w) => (
                <li key={w} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-muted-foreground">{w}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full rounded-full">
              <Link to="/booking" search={{ service: items[0]?.id }}>Je réserve ce soin</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-5 pb-16">
        <p className="text-center text-[11px] uppercase tracking-[0.25em] text-accent">Questions fréquentes</p>
        <h2 className="mt-2 text-center font-serif text-3xl text-primary md:text-4xl">On répond à vos doutes</h2>
        <div className="mt-8 space-y-4">
          {info.faq.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card p-5 transition open:border-accent/40 open:shadow-md">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-serif text-base text-primary md:text-lg">
                {f.q}
                <ChevronRight className="h-4 w-4 text-accent transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA bandeau */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground md:px-12 md:py-16">
          <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-primary-foreground/70">Prête à passer en cabine ?</p>
              <h2 className="mt-2 font-serif text-3xl md:text-4xl">Offrez-vous un moment {info.title.toLowerCase()}.</h2>
              <p className="mt-3 max-w-xl text-sm text-primary-foreground/80">À partir de {Math.min(...items.map((s) => s.price_fcfa)).toLocaleString("fr-FR")} FCFA · Réservation en ligne en quelques secondes.</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-7">
              <Link to="/booking" search={{ service: items[0]?.id }}>Réserver maintenant</Link>
            </Button>
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">

        <h2 className="font-serif text-2xl text-primary md:text-3xl">Découvrir aussi</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((c) => (
            <Link
              key={c.slug}
              to="/services/$slug"
              params={{ slug: c.slug }}
              className="group overflow-hidden rounded-3xl border border-border bg-card transition hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={c.image} alt={c.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-accent">{c.tagline}</p>
                <h3 className="mt-2 font-serif text-xl text-primary">{c.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sticky booking CTA — stays visible while scrolling the detail page */}
      <div className="pointer-events-none sticky bottom-4 z-40 mx-auto mt-4 w-full max-w-6xl px-4 pb-4">
        <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-full border border-primary/15 bg-background/85 px-4 py-3 shadow-2xl shadow-primary/10 backdrop-blur-md md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
              <CalendarCheck2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-serif text-base text-primary md:text-lg">{info.title}</p>
              <p className="truncate text-xs text-muted-foreground">{info.duration} · à partir de {Math.min(...items.map((s) => s.price_fcfa)).toLocaleString("fr-FR")} FCFA</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden rounded-full text-xs uppercase tracking-[0.15em] sm:inline-flex">
              <Link to="/services">← Prestations</Link>
            </Button>
            <Button asChild size="lg" className="rounded-full px-6">
              <Link to="/booking" search={{ service: items[0]?.id }}>Réserver</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
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
        <div className="aspect-[5/2] w-full overflow-hidden md:aspect-[5/1.4]">
          <img src={info.image} alt={info.title} className="h-full w-full object-cover" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">{info.tagline}</p>
          <h1 className="mt-3 font-serif text-4xl text-primary md:text-6xl">{info.title}</h1>
          <p className="mt-5 max-w-2xl text-muted-foreground">{info.intro}</p>
          <p className="mt-3 text-sm text-accent">Durée indicative : {info.duration}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/booking" search={{ service: items[0]?.id }}>Réserver cette prestation</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7">
              <Link to="/services">Toutes les prestations</Link>
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
    </SiteLayout>
  );
}

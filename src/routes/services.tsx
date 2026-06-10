import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { ASSETS } from "@/lib/assets";
import { listServices } from "@/lib/booking.functions";
import { CATEGORIES, SLUG_BY_CATEGORY } from "@/lib/service-categories";

const opts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Prestations & tarifs — NailHouse" },
      { name: "description", content: "Carte complète des prestations NailHouse : manucure, pédicure, semi-permanent, gel, BIAB, capsules. Tarifs en FCFA." },
      { property: "og:title", content: "Prestations & tarifs — NailHouse" },
      { property: "og:description", content: "Manucure, pédicure, semi-permanent, gel, BIAB — tarifs détaillés." },
      { property: "og:image", content: ASSETS.polishShelves },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: ServicesPage,
  errorComponent: ({ error }) => <div className="p-10 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

function ServicesPage() {
  const { data } = useSuspenseQuery(opts);
  const grouped = data.reduce<Record<string, typeof data>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <SiteLayout>
      <section className="relative">
        <div className="aspect-[5/2] w-full overflow-hidden md:aspect-[5/1.5]">
          <img src={ASSETS.polishShelves} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">La carte</p>
          <h1 className="mt-3 font-serif text-4xl text-primary md:text-6xl">Prestations & tarifs</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Tous les prix sont indiqués en FCFA. Réservez en ligne ou par téléphone — nous serons ravies de vous accueillir.
          </p>
          <div className="mt-6">
            <Button asChild size="lg" className="rounded-full px-7"><Link to="/booking">Réserver</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
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
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.intro}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-accent">Voir le détail →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="rounded-3xl border border-border bg-card p-6 md:p-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-serif text-2xl text-primary md:text-3xl">{category}</h2>
                {SLUG_BY_CATEGORY[category] && (
                  <Link
                    to="/services/$slug"
                    params={{ slug: SLUG_BY_CATEGORY[category] }}
                    className="text-xs uppercase tracking-[0.25em] text-accent hover:underline"
                  >
                    Détail & réservation →
                  </Link>
                )}
              </div>
              <div className="mt-6 divide-y divide-border">
                {items.map((s) => (
                  <div key={s.id} className="flex items-baseline justify-between gap-4 py-3">
                    <p className="text-sm md:text-base">{s.name}</p>
                    <p className="whitespace-nowrap font-serif text-lg text-accent">
                      {s.price_fcfa.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground">FCFA</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

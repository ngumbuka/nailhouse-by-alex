import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { ASSETS } from "@/lib/assets";
import { listServices } from "@/lib/booking.functions";

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

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="rounded-3xl border border-border bg-card p-6 md:p-10">
              <h2 className="font-serif text-2xl text-primary md:text-3xl">{category}</h2>
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

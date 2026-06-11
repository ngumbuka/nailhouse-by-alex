import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { ASSETS } from "@/lib/assets";
import { CATEGORIES } from "@/lib/service-categories";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Prestations — NailHouse" },
      { name: "description", content: "Découvrez les prestations NailHouse : manucure, pédicure, semi-permanent, gel, BIAB, capsules." },
      { property: "og:title", content: "Prestations — NailHouse" },
      { property: "og:description", content: "Manucure, pédicure, semi-permanent, gel, BIAB — découvrez nos prestations." },
      { property: "og:image", content: ASSETS.heroServices },
    ],
  }),
  component: ServicesPage,
  errorComponent: ({ error }) => <div className="p-10 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="relative">
        <div className="aspect-[5/2] w-full overflow-hidden md:aspect-[5/1.5]">
          <img src={ASSETS.heroServices} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">La carte</p>
          <h1 className="mt-3 font-serif text-4xl text-primary md:text-6xl">Prestations</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Choisissez votre prestation ou consultez la grille tarifaire complète. Réservez en ligne ou par téléphone.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7"><Link to="/booking">Réserver</Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7"><Link to="/tarifs">Grille tarifaire</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
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

        <div className="mt-12 rounded-3xl border border-border bg-card p-8 text-center md:p-10">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Tous nos prix</p>
          <h2 className="mt-2 font-serif text-2xl text-primary md:text-3xl">Consultez la grille tarifaire complète</h2>
          <p className="mt-3 text-sm text-muted-foreground">Manucure, pédicure, semi-permanent, gel, BIAB, capsules — tous les tarifs en FCFA.</p>
          <Button asChild size="lg" className="mt-6 rounded-full px-7"><Link to="/tarifs">Voir la grille tarifaire</Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}

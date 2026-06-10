import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { ASSETS } from "@/lib/assets";
import { listGalleryImages, listServices } from "@/lib/booking.functions";

const servicesOpts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });
const galleryOpts = queryOptions({ queryKey: ["gallery"], queryFn: () => listGalleryImages() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NailHouse — For the beauty of nails" },
      { name: "description", content: "Atelier d'onglerie boutique à Yaoundé — manucure, pédicure, semi-permanent, gel, BIAB. Réservez votre rendez-vous chez NailHouse." },
      { property: "og:title", content: "NailHouse — For the beauty of nails" },
      { property: "og:description", content: "Atelier d'onglerie boutique à Yaoundé. Manucures couture, pédicures soin, prothésie ongulaire." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(servicesOpts),
      context.queryClient.ensureQueryData(galleryOpts),
    ]);
  },
  component: HomePage,
  errorComponent: ({ error }) => <div className="p-10 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

function HomePage() {
  const { data: services } = useSuspenseQuery(servicesOpts);
  const { data: gallery } = useSuspenseQuery(galleryOpts);

  const signature = services.slice(0, 3);
  const strip = gallery.slice(0, 6);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 md:grid-cols-2 md:pt-20">
          <div className="order-2 md:order-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-primary">
              <Sparkles className="h-3 w-3" /> Atelier boutique · Yaoundé
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-primary md:text-7xl">
              For the beauty<br />
              <em className="text-accent">of nails…</em>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
              NailHouse signe une onglerie couture : manucures précises, pédicures soin et prothésie ongulaire dans une ambiance feutrée à Ekoumdoum.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/booking">Réserver un rendez-vous</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                <Link to="/services">Voir les prestations <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-primary/10">
              <img src={ASSETS.burgundyManicure} alt="Manucure burgundy NailHouse" className="h-full w-full object-cover" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-background/85 px-4 py-3 backdrop-blur">
                <p className="font-serif text-lg text-primary">Manucure semi-permanent</p>
                <p className="text-xs text-muted-foreground">Tenue impeccable · finition glossy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY STRIP */}
      <section className="bg-muted/60 py-12">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl text-primary md:text-4xl">L'atelier en images</h2>
            <Link to="/gallery" className="text-sm text-primary underline-offset-4 hover:underline">Voir la galerie →</Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">
            {strip.map((img) => (
              <div key={img.id} className="aspect-square overflow-hidden rounded-2xl">
                <img src={img.url} alt={img.caption ?? ""} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE TREATMENTS */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Signature</p>
            <h2 className="mt-3 font-serif text-3xl text-primary md:text-5xl">Nos prestations phares</h2>
            <p className="mt-4 text-muted-foreground">
              Une sélection de soins emblématiques — découvrez la carte complète sur la page Prestations.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {signature.map((s, i) => (
              <article key={s.id} className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={[ASSETS.polkaDotNails, ASSETS.workstation, ASSETS.polishShelves][i] ?? ASSETS.burgundyManicure}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.category}</p>
                  <h3 className="mt-2 font-serif text-2xl text-primary">{s.name}</h3>
                  <p className="mt-4 text-sm text-accent">{s.price_fcfa.toLocaleString("fr-FR")} FCFA</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
        <img src={ASSETS.mindfulCandle} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary-foreground/70">Notre philosophie</p>
          <p className="mt-8 font-serif text-3xl italic leading-snug md:text-4xl">
            « Chaque rendez-vous est un moment confidentiel — un soin précis pensé pour révéler la beauté naturelle de vos mains. »
          </p>
          <div className="mt-10">
            <Button asChild size="lg" variant="secondary" className="rounded-full px-7">
              <Link to="/about">Découvrir l'atelier</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

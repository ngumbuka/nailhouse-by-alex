import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "L'atelier — NailHouse" },
      { name: "description", content: "Découvrez l'atelier NailHouse : notre mission, notre vision et notre approche du soin des ongles à Yaoundé." },
      { property: "og:title", content: "L'atelier — NailHouse" },
      { property: "og:description", content: "Mission, vision et approche du soin chez NailHouse." },
      { property: "og:image", content: ASSETS.mindfulCandle },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">L'atelier</p>
          <h1 className="mt-3 font-serif text-4xl text-primary md:text-6xl">Un soin, un instant suspendu.</h1>
          <p className="mt-6 text-muted-foreground">
            NailHouse est un atelier confidentiel à Ekoumdoum, dédié au soin minutieux des mains et des pieds. Chaque geste est pensé pour révéler la beauté naturelle de vos ongles, dans une ambiance feutrée et lumineuse.
          </p>
          <div className="mt-8">
            <Button asChild className="rounded-full px-6"><Link to="/booking">Prendre rendez-vous</Link></Button>
          </div>
        </div>
        <div className="aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl">
          <img src={ASSETS.mindfulCandle} alt="" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="bg-muted/60 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-2">
          <article className="rounded-3xl bg-card p-8 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Notre mission</p>
            <h2 className="mt-3 font-serif text-3xl text-primary">Sublimer, protéger, prendre soin.</h2>
            <p className="mt-4 text-muted-foreground">
              Offrir à chaque cliente une expérience boutique : soins précis, produits choisis avec exigence et écoute personnalisée. Nous prenons le temps qu'il faut pour des ongles sains et une finition impeccable.
            </p>
          </article>
          <article className="rounded-3xl bg-card p-8 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Notre vision</p>
            <h2 className="mt-3 font-serif text-3xl text-primary">L'onglerie comme art du détail.</h2>
            <p className="mt-4 text-muted-foreground">
              Devenir la référence de l'onglerie boutique à Yaoundé : un lieu où la technique, l'hygiène et l'élégance se rencontrent — pour la beauté des ongles, et celles qui les portent.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-20 md:grid-cols-3">
        {[
          { src: ASSETS.basketsCorner, t: "Une ambiance pensée pour vous", d: "Lumières douces, matières naturelles, musique discrète." },
          { src: ASSETS.workstation, t: "Une exigence professionnelle", d: "Outils stérilisés, produits sélectionnés, protocoles précis." },
          { src: ASSETS.coffeeEasel, t: "Hospitalité boutique", d: "Café, eau infusée, lecture — votre confort avant tout." },
        ].map((c) => (
          <div key={c.t} className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={c.src} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-6">
              <h3 className="font-serif text-xl text-primary">{c.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}

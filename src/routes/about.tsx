import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { SoftImage } from "@/components/ui/soft-image";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "L'atelier — NailHouse" },
      {
        name: "description",
        content:
          "Découvrez l'atelier NailHouse : notre mission, notre vision et notre approche du soin des ongles à Yaoundé.",
      },
      { property: "og:title", content: "L'atelier — NailHouse" },
      {
        property: "og:description",
        content: "Mission, vision et approche du soin chez NailHouse.",
      },
      { property: "og:image", content: ASSETS.heroAbout },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { language, t } = useI18n();
  const [activeIdx, setActiveIdx] = useState(0);

  const ENGAGEMENTS = [
    {
      title: language === "en" ? "Enhance & Protect" : "Sublimer & Protéger",
      tagline: language === "en" ? "OUR MISSION" : "NOTRE MISSION",
      description:
        language === "en"
          ? "Ensure the beauty and health of your nails through expert gestures, rigorously selected products, and surgical hygiene."
          : "Assurer la beauté et la santé de vos ongles grâce à des gestes experts, des vernis rigoureusement sélectionnés et une hygiène chirurgicale.",
      image: ASSETS.workstation,
      num: "01",
    },
    {
      title: language === "en" ? "Excellence as signature" : "L'excellence comme signature",
      tagline: language === "en" ? "OUR VISION" : "NOTRE VISION",
      description:
        language === "en"
          ? "Become the reference of modern nail care in Yaoundé, elevating each service to a couture and wellness experience."
          : "Devenir la référence absolue de l'onglerie moderne à Yaoundé, en élevant chaque prestation au rang d'expérience couture et bien-être.",
      image: ASSETS.polishShelves,
      num: "02",
    },
    {
      title: language === "en" ? "Respect for the natural nail" : "Le respect de l'ongle naturel",
      tagline: language === "en" ? "OUR CHARTER" : "NOTRE CHARTE",
      description:
        language === "en"
          ? "Ban aggressive techniques and prioritize flexible reinforcements (BIAB) promoting the healthy growth of your base."
          : "Bannir les techniques agressives et privilégier des renforcements souples (BIAB) favorisant la repousse saine de votre base.",
      image: ASSETS.mindfulCandle,
      num: "03",
    },
  ];

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % ENGAGEMENTS.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + ENGAGEMENTS.length) % ENGAGEMENTS.length);
  };

  return (
    <SiteLayout>
      {/* ── 1. HERO SECTION — Volumetric Dark Workspace ── */}
      <section className="px-5 py-6 md:py-10 bg-background">
        <div className="relative mx-auto max-w-6xl w-full overflow-hidden rounded-[2.5rem] bg-zinc-950 text-white min-h-[500px] md:min-h-[580px] flex flex-col justify-between p-8 md:p-14">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity filter contrast-125 pointer-events-none"
            style={{ backgroundImage: `url(${ASSETS.heroAbout})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Top Label */}
          <div className="relative z-10 flex justify-between items-center text-xs tracking-widest text-zinc-300">
            <span>{language === "en" ? "THE NAILHOUSE ATELIER" : "L'ATELIER NAILHOUSE"}</span>
            <span>{language === "en" ? "OUR STORY" : "NOTRE HISTOIRE"}</span>
          </div>

          {/* Main content */}
          <div className="relative z-10 my-auto max-w-2xl pt-12 pb-6">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight">
              {language === "en" ? (
                <>
                  A precious treatment,
                  <br />a moment <em className="text-gold not-italic">suspended</em> in time.
                </>
              ) : (
                <>
                  Un soin précieux,
                  <br />
                  un instant <em className="text-gold not-italic">suspendu</em> dans le temps.
                </>
              )}
            </h1>
            <p className="mt-6 text-sm text-zinc-300 leading-relaxed md:text-base">
              {language === "en"
                ? "NailHouse was born from the desire to create a private sanctuary in Ekoumdoum. A place where technical high-precision meets the absolute calm of a confidential cocoon."
                : "NailHouse est né de la volonté de créer un refuge confidentiel à Ekoumdoum. Un lieu où la haute précision technique rencontre le calme absolu d'un cocon privé."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-black hover:bg-white/90"
              >
                <Link to="/booking">
                  {language === "en" ? "Book a moment" : "Réserver un instant"}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full border border-zinc-700 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/services">
                  {language === "en" ? "Explore the menu" : "Explorer la carte"}
                </Link>
              </Button>
            </div>
          </div>

          {/* Bottom details */}
          <div className="relative z-10 flex justify-between items-center pt-6 border-t border-zinc-800/80 text-[10px] text-zinc-300 tracking-widest">
            <span>
              {language === "en" ? "SERVICES BY APPOINTMENT" : "PRESTATIONS SUR RENDEZ-VOUS"}
            </span>
            <span>YAOUNDÉ, CAMEROUN</span>
          </div>
        </div>
      </section>

      {/* ── 2. ENGAGEMENTS STEPPER SLIDER ── */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Left panel info */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              {/* Stepper tracker */}
              <div className="flex items-center gap-3 text-xs tracking-widest text-zinc-500">
                <span className="font-serif text-sm text-gold">0{activeIdx + 1}</span>
                <div className="h-px w-10 bg-zinc-300 relative">
                  <div
                    className="absolute left-0 top-0 h-full bg-gold transition-all duration-500"
                    style={{ width: `${((activeIdx + 1) / ENGAGEMENTS.length) * 100}%` }}
                  />
                </div>
                <span>03</span>
              </div>

              <p className="label-luxe mt-8">
                {language === "en" ? "Our commitments" : "Nos engagements"}
              </p>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl text-primary leading-tight">
                {language === "en"
                  ? "Nail care elevated to the rank of treatment ritual"
                  : "L'onglerie élevée au rang de rituel de soin"}
              </h2>
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-md">
                {language === "en"
                  ? "We make no compromises on your nail health and the comfort of your welcome. Discover the values that drive our team every day."
                  : "Nous ne faisons aucun compromis sur la santé de vos ongles et le confort de votre accueil. Découvrez les valeurs qui animent notre équipe chaque jour."}
              </p>
            </div>

            <div className="mt-10">
              <Button asChild className="rounded-full px-6">
                <Link to="/contact">{language === "en" ? "Visit us" : "Nous rendre visite"}</Link>
              </Button>
            </div>
          </div>

          {/* Right bento slider */}
          <div className="lg:col-span-7 relative">
            <div className="grid gap-6 sm:grid-cols-2">
              {ENGAGEMENTS.map((slide, idx) => {
                // Display current active slide and the next one
                const isVisible = idx === activeIdx || idx === (activeIdx + 1) % ENGAGEMENTS.length;
                if (!isVisible) return null;

                return (
                  <div
                    key={slide.title}
                    className="group relative h-[380px] rounded-3xl overflow-hidden shadow-md transition-all duration-700 bg-zinc-900 text-white"
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 filter saturate-[0.8] contrast-105 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    <div className="absolute inset-x-5 top-5 z-10 flex justify-between items-center">
                      <span className="rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 text-[8px] uppercase tracking-widest font-semibold text-white">
                        {slide.tagline}
                      </span>
                    </div>

                    <div className="absolute inset-x-5 bottom-5 z-10">
                      <h3 className="font-serif text-xl sm:text-2xl leading-snug">{slide.title}</h3>
                      <p className="text-zinc-300 text-xs mt-2 leading-relaxed">
                        {slide.description}
                      </p>
                    </div>

                    <span className="absolute bottom-2 right-4 font-serif text-8xl text-white/5 pointer-events-none font-bold select-none">
                      {slide.num}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Slider arrows */}
            <div className="flex gap-2 justify-end mt-8">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                aria-label="Slide précédent"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                aria-label="Slide suivant"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. STUDIO DETAILS GRID ── */}
      <section className="bg-muted/20 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="label-luxe">
              {language === "en" ? "The studio experience" : "L'expérience studio"}
            </p>
            <h2 className="mt-4 font-serif text-3xl text-primary md:text-4xl">
              {language === "en" ? "Attention to detail" : "Le sens du détail"}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                src: ASSETS.basketsCorner,
                t:
                  language === "en"
                    ? "An ambiance designed for you"
                    : "Une ambiance pensée pour vous",
                d:
                  language === "en"
                    ? "Soft lights, natural materials, discreet music to disconnect."
                    : "Lumières douces, matières naturelles, musique discrète pour déconnecter.",
              },
              {
                src: ASSETS.workstation,
                t:
                  language === "en" ? "A professional requirement" : "Une exigence professionnelle",
                d:
                  language === "en"
                    ? "Instruments sterilized in autoclave, premium products and strict protocols."
                    : "Outils stérilisés en autoclave, produits haut de gamme et protocoles stricts.",
              },
              {
                src: ASSETS.coffeeEasel,
                t: language === "en" ? "Boutique hospitality" : "Hospitalité boutique",
                d:
                  language === "en"
                    ? "Specialty coffee, fine teas, infused water — your comfort is our priority."
                    : "Café de spécialité, thés fins, eau infusée — votre confort est notre priorité.",
              },
            ].map((c) => (
              <div
                key={c.t}
                className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm"
              >
                <SoftImage src={c.src} alt={c.t} aspect="aspect-[4/3]" className="rounded-none" />
                <div className="p-6">
                  <h3 className="font-serif text-lg text-primary">{c.t}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FOOTER CTA BLOCK ── */}
      <section className="px-5 py-16 md:py-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-zinc-950 text-white py-20 px-8 text-center shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
            style={{ backgroundImage: `url(${ASSETS.barShelf})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <p className="label-luxe text-zinc-300">{t("btn_book")}</p>
            <h2 className="mt-6 font-serif text-3xl sm:text-4xl md:text-5xl leading-tight">
              {language === "en" ? (
                <>
                  Come live the experience.
                  <br />
                  Your suspended moment awaits you.
                </>
              ) : (
                <>
                  Venez vivre l'expérience.
                  <br />
                  Votre moment suspendu vous attend.
                </>
              )}
            </h2>
            <div className="mt-8 flex justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-black hover:bg-gold hover:text-white px-10 py-6 text-sm font-semibold shadow-lg"
              >
                <Link to="/booking">{t("btn_book_now")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

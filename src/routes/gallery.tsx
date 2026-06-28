import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, SlidersHorizontal, Eye, Play } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { AmbientVideo } from "@/components/ui/ambient-video";
import { listGalleryImages } from "@/lib/booking.functions";
import { ASSETS } from "@/lib/assets";
import { useI18n } from "@/hooks/use-i18n";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const opts = queryOptions({ queryKey: ["gallery"], queryFn: () => listGalleryImages() });

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Galerie — NailHouse" },
      {
        name: "description",
        content: "Plongez dans l'univers visuel de NailHouse : créations, atelier et ambiance.",
      },
      { property: "og:title", content: "Galerie — NailHouse" },
      { property: "og:description", content: "L'univers visuel de NailHouse." },
      { property: "og:image", content: ASSETS.salonPedicure },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: GalleryPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

type GalleryItem = {
  id: string;
  url: string;
  caption: string | null;
  sort: number;
  title: string;
  description: string;
  category: string;
  service_slug?: string | null;
};

function GalleryPage() {
  const { language, t } = useI18n();
  const { data } = useSuspenseQuery(opts) as { data: GalleryItem[] };
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter images based on category selection
  const filteredData = data.filter((img) =>
    selectedCat === "all" ? true : img.category === selectedCat,
  );

  // Dynamic grid mapping for asymmetric Bento-style layout (based on visible items)
  const getGridSpan = (idx: number) => {
    const pattern = [
      "sm:col-span-2 sm:row-span-1 aspect-[16/10] sm:aspect-auto", // Item 0: Landscape
      "sm:col-span-1 sm:row-span-1 aspect-square sm:aspect-auto", // Item 1: Square
      "sm:col-span-1 sm:row-span-2 aspect-[9/16] sm:aspect-auto", // Item 2: Tall portrait
      "sm:col-span-1 sm:row-span-1 aspect-square sm:aspect-auto", // Item 3: Square
      "sm:col-span-2 sm:row-span-1 aspect-[16/9] sm:aspect-auto", // Item 4: Landscape (center focal point)
      "sm:col-span-1 sm:row-span-2 aspect-[3/4] sm:aspect-auto", // Item 5: Tall portrait
      "sm:col-span-1 sm:row-span-2 aspect-[3/5] sm:aspect-auto", // Item 6: Tall portrait
      "sm:col-span-2 sm:row-span-1 aspect-[16/10] sm:aspect-auto", // Item 7: Landscape
    ];
    return pattern[idx % pattern.length];
  };

  const categories = [
    { value: "all", label: language === "en" ? "All" : "Tout" },
    { value: "mains", label: language === "en" ? "Hand Care" : "Soins des mains" },
    { value: "pieds", label: language === "en" ? "Foot Care" : "Soins des pieds" },
    { value: "ambiance", label: language === "en" ? "Atelier & Atmosphere" : "Atelier & Ambiance" },
  ];

  const getGalleryTranslation = (id: string, defaultTitle: string, defaultDesc: string) => {
    if (language !== "en") return { title: defaultTitle, description: defaultDesc };
    switch (id) {
      case "g1":
        return {
          title: "Burgundy Couture Manicure",
          description:
            "A deep burgundy polish application with intense glossy reflections, combined with complete cuticle care for perfect hands.",
        };
      case "g2":
        return {
          title: "Graphic & Polka Dot Nail Art",
          description:
            "Minimalist artistic creation hand-painted with a fine brush, combining nude shades and precise black accents. Ideal for a modern look.",
        };
      case "g3":
        return {
          title: "Prestige Pedicure Space",
          description:
            "Our high-end treatment chair with massage jets. A true sanctuary of relaxation to beautify and care for your feet.",
        };
      case "g4":
        return {
          title: "Our Atelier & Nail Bar",
          description:
            "A modern and warm space equipped with the best vacuum and drying equipment for your comfort and safety.",
        };
      case "g5":
        return {
          title: "Semi-permanent Polish Bar",
          description:
            "An infinite collection of bottles from prestigious brands selected for their impeccable hold and respect for the nail plate.",
        };
      case "g6":
        return {
          title: "Relaxation & Sensory Care",
          description:
            "Scented candles, warm massage oils and soft background music to totally disconnect from daily stress.",
        };
      case "g7":
        return {
          title: "Cuticle Care Range",
          description:
            "Our exclusive moisturizing serums and oils formulated with sweet almond and vitamin E to nourish your hands after each application.",
        };
      case "g8":
        return {
          title: "Welcome & Coffee Break",
          description:
            "Because the NailHouse experience begins as soon as you arrive, we offer you a selection of scented teas, coffees and refreshments.",
        };
      default:
        return { title: defaultTitle, description: defaultDesc };
    }
  };

  return (
    <SiteLayout>
      <div className="bg-background text-foreground min-h-screen">
        <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          {/* Header Section */}
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.28em] text-gold font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> {language === "en" ? "Art Gallery" : "Galerie d'Art"}
            </p>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-6xl tracking-wide leading-tight">
              {language === "en" ? "Our Artistic Universe" : "Notre Univers Artistique"}
            </h1>
            <div className="mt-6 h-px w-10 bg-gold" />
            <p className="mt-6 text-sm md:text-base leading-relaxed text-muted-foreground max-w-2xl font-sans">
              {language === "en"
                ? "Couture creations, our atelier's atmosphere, and suspended moments of relaxation. Each photograph tells the story of our dedication to refinement, technical skill, and excellence."
                : "Créations couture, atmosphère de notre atelier et moments de détente suspendus. Chaque cliché raconte notre dévouement pour le raffinement, la technicité et l'excellence."}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-12 flex flex-wrap gap-2.5 items-center">
            <SlidersHorizontal className="h-4 w-4 text-gold/60 mr-1.5 shrink-0 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCat(cat.value)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 border cursor-pointer ${
                  selectedCat === cat.value
                    ? "bg-gold text-white border-gold shadow-md"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/15"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Featured ambient video — the salon's craft in motion */}
          <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-border/40 shadow-sm">
            <AmbientVideo
              src={ASSETS.gestureLoopVideo}
              poster={ASSETS.burgundyManicure}
              alt={language === "en" ? "Brush stroke on a single nail" : "Geste de précision en gros plan"}
              className="aspect-[21/9] w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="pointer-events-none absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 text-white md:inset-x-10 md:bottom-8">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-soft">
                  <Play className="h-3 w-3 fill-current" />
                  {language === "en" ? "In motion" : "En mouvement"}
                </p>
                <h2 className="mt-2 font-serif text-2xl leading-tight md:text-3xl">
                  {language === "en"
                    ? "The precision of a single brush stroke."
                    : "La précision d'un seul geste."}
                </h2>
              </div>
              <span className="hidden text-[10px] uppercase tracking-[0.28em] text-white/70 sm:block">
                {language === "en" ? "NailHouse · Atelier" : "NailHouse · Atelier"}
              </span>
            </div>
          </div>

          {/* Asymmetric Bento-style Grid Layout */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-4 gap-4 auto-rows-[250px] md:auto-rows-[300px] animate-fade-in">
            {filteredData.map((img, idx) => {
              const numStr = String(idx + 1).padStart(2, "0");
              const { title } = getGalleryTranslation(img.id, img.title, img.description);
              return (
                <div
                  key={img.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveImage(img);
                    setIsDialogOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveImage(img);
                      setIsDialogOpen(true);
                    }
                  }}
                  aria-label={
                    language === "en"
                      ? `View details for: ${title}`
                      : `Afficher les détails de : ${title}`
                  }
                  className={`relative overflow-hidden rounded-3xl group bg-card border border-border/40 transition-all duration-500 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold ${getGridSpan(
                    idx,
                  )}`}
                >
                  <img
                    src={img.url}
                    alt={title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 filter saturate-[0.85] contrast-[1.02] group-hover:saturate-100"
                  />

                  {/* Soft elegant overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-50 group-hover:opacity-65 transition-opacity duration-500" />

                  {/* Top-right card index floating */}
                  <div className="absolute right-5 top-5 font-serif text-sm text-gold-soft/50 group-hover:text-gold/80 transition-colors duration-300">
                    {numStr}
                  </div>

                  {/* Eye detail indicator floating top-left */}
                  <div className="absolute left-5 top-5 h-7 w-7 rounded-full bg-white/95 border border-border/20 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 backdrop-blur-sm">
                    <Eye className="h-3.5 w-3.5 text-gold" />
                  </div>

                  {/* Slide-up glassmorphic caption */}
                  <div className="absolute bottom-0 inset-x-0 p-5 z-10 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-gold-soft font-semibold opacity-75">
                      {img.category === "mains"
                        ? language === "en"
                          ? "Hands"
                          : "Mains"
                        : img.category === "pieds"
                          ? language === "en"
                            ? "Feet"
                            : "Pieds"
                          : language === "en"
                            ? "Atmosphere"
                            : "Ambiance"}
                    </p>
                    <h3 className="mt-1 font-serif text-sm md:text-base text-white tracking-wide font-medium leading-snug">
                      {title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lightbox / Detail Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl w-[92vw] bg-card border-border rounded-3xl p-0 overflow-hidden shadow-2xl">
              {activeImage &&
                (() => {
                  const { title, description } = getGalleryTranslation(
                    activeImage.id,
                    activeImage.title,
                    activeImage.description,
                  );
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                      {/* Left column: Image */}
                      <div className="md:col-span-7 relative bg-muted/20 flex items-center justify-center min-h-[300px] md:min-h-[500px]">
                        <img
                          src={activeImage.url}
                          alt={title}
                          className="w-full h-full object-cover max-h-[500px] md:max-h-none"
                        />
                      </div>

                      {/* Right column: Details */}
                      <div className="md:col-span-5 p-8 flex flex-col justify-between bg-card text-foreground md:h-[500px] border-t md:border-t-0 md:border-l border-border/40">
                        <div>
                          {/* Category tag */}
                          <span className="rounded-full bg-gold/10 border border-gold/25 px-3.5 py-1 text-[8.5px] uppercase tracking-wider font-semibold text-gold w-fit mb-4 inline-block">
                            {activeImage.category === "mains"
                              ? language === "en"
                                ? "Hand Care"
                                : "Soins des mains"
                              : activeImage.category === "pieds"
                                ? language === "en"
                                  ? "Foot Care"
                                  : "Soins des pieds"
                                : language === "en"
                                  ? "Atelier & Atmosphere"
                                  : "Atelier & Ambiance"}
                          </span>

                          <DialogTitle className="font-serif text-2xl md:text-3xl text-primary tracking-wide font-medium leading-snug mb-3">
                            {title}
                          </DialogTitle>

                          <DialogDescription className="text-xs md:text-sm text-muted-foreground leading-relaxed font-sans mt-4">
                            {description}
                          </DialogDescription>
                        </div>

                        <div className="mt-8">
                          {activeImage.service_slug ? (
                            <Link
                              to="/services/$slug/$service"
                              params={{
                                slug: activeImage.category,
                                service: activeImage.service_slug,
                              }}
                              className="flex items-center justify-center gap-2 bg-gold hover:bg-gold/95 text-white font-sans font-bold text-[10px] uppercase tracking-[0.2em] px-6 py-4 rounded-full transition-all duration-300 w-full shadow-lg shadow-gold/10 cursor-pointer"
                            >
                              <span>
                                {language === "en" ? "Discover the treatment" : "Découvrir le soin"}
                              </span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          ) : (
                            <Link
                              to="/booking"
                              className="flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white font-sans font-bold text-[10px] uppercase tracking-[0.2em] px-6 py-4 rounded-full transition-all duration-300 w-full shadow-lg cursor-pointer"
                            >
                              <span>
                                {language === "en" ? "Book Appointment" : "Prendre Rendez-vous"}
                              </span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </DialogContent>
          </Dialog>

          {/* Bottom Stats & CTA Section */}
          <div className="mt-24 grid gap-10 border-t border-border pt-16 sm:grid-cols-4 items-center">
            {/* Stats block */}
            <div className="sm:col-span-2 grid grid-cols-3 gap-6">
              <div>
                <p className="font-serif text-3xl md:text-4xl text-gold font-bold">3000+</p>
                <p className="mt-1 text-[8.5px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {language === "en" ? "Treatments Completed" : "Soins Réalisés"}
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl text-gold font-bold">99.8%</p>
                <p className="mt-1 text-[8.5px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Satisfaction
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl text-gold font-bold">150+</p>
                <p className="mt-1 text-[8.5px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {language === "en" ? "Couture Shades" : "Teintes Couture"}
                </p>
              </div>
            </div>

            {/* Description & Action */}
            <div className="sm:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                {language === "en"
                  ? "Every detail of our salon, from the rigorous sterilization of our tools to the caring attention, is orchestrated to enhance your hands and offer you an exceptional moment."
                  : "Chaque détail de notre salon, de la stérilisation rigoureuse de nos outils à l'écoute bienveillante, est orchestré pour sublimer vos mains et vous offrir un moment d'exception."}
              </p>
              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full bg-ink text-white px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-white transition-all duration-300 w-fit shrink-0 shadow-lg cursor-pointer"
              >
                {language === "en" ? "Explore the Menu" : "Découvrir la carte"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

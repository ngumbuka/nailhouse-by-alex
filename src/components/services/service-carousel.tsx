import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ASSETS } from "@/lib/assets";

interface ServiceCarouselProps {
  serviceName: string;
  serviceId: string;
  categoryTitle: string;
  categorySlug: string;
}

export function ServiceCarousel({
  serviceName,
  serviceId,
  categoryTitle,
  categorySlug,
}: ServiceCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Determine standard editorial images based on category or service context
  const isPedicure = categorySlug.includes("pied") || serviceName.toLowerCase().includes("pedi");
  const isNailArt =
    serviceName.toLowerCase().includes("art") || serviceName.toLowerCase().includes("deco");

  const primaryImage = isPedicure
    ? ASSETS.salonPedicure
    : isNailArt
      ? ASSETS.polkaDotNails
      : ASSETS.burgundyManicure;

  const slides = [
    {
      id: "slide-1",
      subtitle: "Inspiration",
      title: "L'Exigence du Geste",
      description: `Chaque pose de ${serviceName.toLowerCase()} commence par une préparation méticuleuse de la plaque de l'ongle, révélant sa pureté originelle.`,
      image: primaryImage,
    },
    {
      id: "slide-2",
      subtitle: "Produits de soin",
      title: "Des Pigments de Luxe",
      description:
        "Une palette exclusive de couleurs et de bases nutritives sélectionnées chez les plus grandes marques de la haute cosmétique.",
      image: ASSETS.polishShelves,
    },
    {
      id: "slide-3",
      subtitle: "Savoir-faire",
      title: "Précision Millimétrée",
      description:
        "Des cuticules parfaitement soignées et repoussées avec des instruments professionnels de précision chirurgicale stérilisés à 100%.",
      image: ASSETS.workstation,
    },
    {
      id: "slide-4",
      subtitle: "Expérience boutique",
      title: "Un Instant de Sérénité",
      description:
        "Savourez une boisson chaude dans le calme de notre salon, pendant que notre praticienne donne vie à vos désirs esthétiques.",
      image: ASSETS.mindfulCandle,
    },
  ];

  return (
    <section className="bg-muted/10 border-t border-b border-border/40 py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* LEFT COLUMN: Editorial Text Panel */}
          <div className="lg:col-span-5 flex flex-col justify-center fade-up">
            {/* Pagination Stepper & Active Marker */}
            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="font-serif text-base text-gold">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <div className="relative h-px w-20 bg-border/60">
                <div
                  className="absolute left-0 top-0 h-full bg-gold transition-all duration-500"
                  style={{ width: `${((activeIndex + 1) / 4) * 100}%` }}
                />
              </div>
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`transition-colors duration-300 font-serif ${
                      idx === activeIndex ? "text-gold font-bold" : "text-muted-foreground/30"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                ))}
              </div>
            </div>

            {/* Subtitle / Context Category */}
            <p className="mt-8 text-xs uppercase tracking-[0.24em] text-gold font-bold">
              / {categoryTitle} · {serviceName}
            </p>

            {/* Headline Title */}
            <h2 className="mt-4 font-serif text-3xl leading-tight text-primary md:text-4xl min-h-[84px] transition-all duration-300">
              {slides[activeIndex].title}
            </h2>

            {/* Description Text */}
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground min-h-[80px] transition-all duration-300">
              {slides[activeIndex].description}
            </p>

            {/* CTA action */}
            <div className="mt-8">
              <Button
                asChild
                className="rounded-full bg-gold px-8 text-white hover:bg-gold/95 shadow-md shadow-gold/10"
              >
                <Link to="/booking" search={{ service: serviceId }}>
                  Prendre rendez-vous <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Asymmetric sliding cards */}
          <div className="lg:col-span-7 fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative overflow-hidden w-full py-4">
              <div
                className="flex gap-6 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeIndex * 55}px)` }}
              >
                {slides.map((slide, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={slide.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative w-[280px] sm:w-[320px] shrink-0 overflow-hidden rounded-3xl bg-card border border-border/40 transition-all duration-500 cursor-pointer ${
                        isActive
                          ? "scale-100 shadow-[0_20px_45px_rgba(195,161,95,0.12)] border-gold/30"
                          : "scale-95 opacity-60 hover:opacity-85"
                      }`}
                    >
                      {/* Card Content */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />

                        {/* Top Labels */}
                        <div className="absolute left-5 top-5 z-10 flex flex-col">
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                            {slide.subtitle}
                          </span>
                          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold mt-1">
                            Nos Valeurs
                          </span>
                        </div>

                        {/* Bottom Labels */}
                        <div className="absolute bottom-6 left-5 right-5 z-10">
                          <h3 className="font-serif text-lg sm:text-xl text-white tracking-wide leading-tight">
                            {slide.title}
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-white/70 line-clamp-2">
                            {slide.description}
                          </p>

                          {/* Learn More pill */}
                          <div
                            className={`mt-4 flex items-center gap-1.5 font-sans font-semibold text-xs uppercase tracking-[0.22em] px-3.5 py-2 rounded-full w-fit transition-all duration-300 ${
                              isActive ? "bg-white text-ink" : "bg-white/20 text-white"
                            }`}
                          >
                            <span>Découvrir</span>
                          </div>
                        </div>

                        {/* Number Overlay */}
                        <div className="absolute bottom-2 right-4 font-serif text-7xl font-bold leading-none text-white/10 select-none">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows at bottom right */}
            <div className="mt-6 flex items-center justify-end gap-3 pr-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-muted/10 cursor-pointer"
                aria-label="Diapositive précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-muted/10 cursor-pointer"
                aria-label="Diapositive suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

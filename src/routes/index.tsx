import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Clock, Star, Play, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { SoftImage } from "@/components/ui/soft-image";
import { AmbientVideo } from "@/components/ui/ambient-video";
import { ASSETS } from "@/lib/assets";
import { listServices, listGalleryImages, listActiveVideos } from "@/lib/booking.functions";
import { CATEGORIES } from "@/lib/service-categories";
import { useI18n } from "@/hooks/use-i18n";
import { resolveAssetUrl } from "@/lib/resolver";

const servicesOpts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });
const galleryOpts = queryOptions({ queryKey: ["gallery"], queryFn: () => listGalleryImages() });
const videosOpts = queryOptions({ queryKey: ["videos"], queryFn: () => listActiveVideos() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NailHouse — Pour la beauté des ongles" },
      {
        name: "description",
        content:
          "Atelier d'onglerie boutique à Yaoundé — manucure couture, pédicures d'exception, semi-permanent, gel, BIAB. Réservez votre rendez-vous chez NailHouse.",
      },
      { property: "og:title", content: "NailHouse — Pour la beauté des ongles" },
      {
        property: "og:description",
        content:
          "Atelier d'onglerie boutique à Yaoundé. Manucures couture, pédicures d'exception, prothésie ongulaire.",
      },
      { property: "og:image", content: ASSETS.burgundyManicure },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(servicesOpts),
      context.queryClient.ensureQueryData(galleryOpts),
      context.queryClient.ensureQueryData(videosOpts),
    ]);
  },
  component: HomePage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

function HomePage() {
  const { data: services } = useSuspenseQuery(servicesOpts);
  const { data: videos } = useSuspenseQuery(videosOpts);
  const { language, t } = useI18n();

  const [activeValue, setActiveValue] = useState(0);
  const [activeStudio, setActiveStudio] = useState(0);

  const HOMEPAGE_SLIDES = [
    {
      title: language === "en" ? "Hygiene & Sterilization" : "Hygiène & Stérilisation",
      tagline: language === "en" ? "STRICT SAFETY" : "SÉCURITÉ STRICTE",
      description:
        language === "en"
          ? "All our metal instruments undergo medical-grade autoclave sterilization."
          : "Tous nos instruments métalliques subissent une stérilisation par autoclave de classe médicale.",
      image: ASSETS.workstation,
      num: "01",
    },
    {
      title: language === "en" ? "Prestige Products" : "Produits de Prestige",
      tagline: language === "en" ? "LUXURY QUALITY" : "QUALITÉ LUXE",
      description:
        language === "en"
          ? "We select only polishes and oils from leading protective brands."
          : "Nous sélectionnons uniquement des vernis et huiles de grandes marques protectrices.",
      image: ASSETS.polishShelves,
      num: "02",
    },
    {
      title: language === "en" ? "Confidential Atelier" : "Atelier Confidentiel",
      tagline: language === "en" ? "PRIVATE ATMOSPHERE" : "ATMOSPHÈRE PRIVÉE",
      description:
        language === "en"
          ? "A cozy and intimate space in Ekoumdoum for total relaxation."
          : "Un espace feutré et intime à Ekoumdoum pour un moment de relaxation totale.",
      image: ASSETS.mindfulCandle,
      num: "03",
    },
    {
      title: language === "en" ? "High Precision Gesture" : "Geste de Haute Précision",
      tagline: language === "en" ? "RITUAL REQUIREMENT" : "EXIGENCE RITUELLE",
      description:
        language === "en"
          ? "Modern nail care techniques to preserve the natural health of your nails."
          : "Des techniques d'onglerie modernes pour préserver la santé naturelle de vos ongles.",
      image: ASSETS.burgundyManicure,
      num: "04",
    },
  ];

  const STUDIO_SLIDES = [
    {
      title: language === "en" ? "A space designed for calm" : "Un espace conçu pour le calme",
      desc:
        language === "en"
          ? "Soft lights, discreet music, and a welcome drink offered upon your arrival."
          : "Lumières douces, musique discrète, et boisson offerte lors de votre accueil.",
      image: ASSETS.basketsCorner,
      tag: language === "en" ? "Hospitality" : "Hospitalité",
    },
    {
      title: language === "en" ? "An impeccable workstation" : "Un poste de travail impeccable",
      desc:
        language === "en"
          ? "Built-in vacuum cleaners to avoid filing dust and optimal comfort."
          : "Aspirateurs intégrés pour éviter les poussières de limage et confort optimal.",
      image: ASSETS.workstation,
      tag: language === "en" ? "Ergonomics" : "Ergonomie",
    },
    {
      title: language === "en" ? "Noble & natural materials" : "Matériaux nobles & naturels",
      desc:
        language === "en"
          ? "A clean aesthetic blending raw wood, linen, and botanical touches."
          : "Une esthétique épurée mêlant bois brut, lin, et touches végétales.",
      image: ASSETS.coffeeEasel,
      tag: language === "en" ? "Design" : "Design",
    },
  ];

  const STATS_ITEMS = [
    {
      desc:
        language === "en"
          ? "Because your nail safety is our absolute priority, all our instruments undergo a medical-grade sterilization protocol."
          : "Parce que la sécurité de vos ongles est notre priorité absolue, tous nos instruments subissent un protocole de stérilisation de grade médical.",
      stat: "100%",
      label: language === "en" ? "Sterilized Instruments" : "Instruments Stérilisés",
    },
    {
      desc:
        language === "en"
          ? "Thousands of carefully crafted sets, from natural BIAB overlays to beautifully sculpted extensions."
          : "Des milliers de poses soignées, du BIAB naturel aux rallonges artistiques sculptées avec soin.",
      stat: "5K+",
      label: language === "en" ? "Sets Performed" : "Poses Réalisées",
    },
    {
      desc:
        language === "en"
          ? "An outstanding rating rewarding our constant attention to detail and care for our clients."
          : "Une note d'excellence récompensant notre souci constant du détail et l'écoute de nos clientes.",
      stat: "4.9/5",
      label: language === "en" ? "Google Average Rating" : "Note Moyenne Google",
    },
  ];

  const minPriceBySlug = (slug: string) => {
    const cat = CATEGORIES.find((c) => c.slug === slug);
    if (!cat) return undefined;
    const items = services.filter((s) => s.category === cat.category);
    return items.length ? Math.min(...items.map((s) => s.price_fcfa)) : undefined;
  };

  const handleNextValue = () => {
    setActiveValue((prev) => (prev + 1) % HOMEPAGE_SLIDES.length);
  };

  const handlePrevValue = () => {
    setActiveValue((prev) => (prev - 1 + HOMEPAGE_SLIDES.length) % HOMEPAGE_SLIDES.length);
  };

  const handleNextStudio = () => {
    setActiveStudio((prev) => (prev + 1) % STUDIO_SLIDES.length);
  };

  const handlePrevStudio = () => {
    setActiveStudio((prev) => (prev - 1 + STUDIO_SLIDES.length) % STUDIO_SLIDES.length);
  };

  return (
    <SiteLayout>
      {/* ── 1. HERO SECTION — Dark, immersive, rounded container ── */}
      <section className="px-5 py-6 md:py-10 bg-background">
        <div className="relative mx-auto max-w-6xl w-full overflow-hidden rounded-[2.5rem] bg-zinc-950 text-white min-h-[550px] md:min-h-[650px] flex flex-col justify-between p-8 md:p-14">
          {/* Ambient video background — only the salon's craft, in motion */}
          <div className="absolute inset-0 opacity-55 mix-blend-luminosity">
            <AmbientVideo
              src={ASSETS.heroLoopVideo}
              poster={ASSETS.heroServices}
              alt="NailHouse manucure couture"
              className="h-full w-full"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

          {/* Top Floating Nav details */}
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 text-xs tracking-widest text-zinc-300 text-center sm:text-left">
            <span>YAOUNDÉ · EKOUMDOUM</span>
            <span>
              {language === "en"
                ? "CONFIDENTIAL BOUTIQUE ATELIER"
                : "ATELIER BOUTIQUE CONFIDENTIEL"}
            </span>
          </div>

          {/* Central content */}
          <div className="relative z-10 my-auto max-w-3xl pt-16 pb-10">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight">
              {language === "en" ? (
                <>
                  A boutique salon
                  <br />
                  dedicated to <em className="text-gold not-italic">precision</em> — designed to
                  enhance your hands.
                </>
              ) : (
                <>
                  Un salon boutique
                  <br />
                  dédié à la <em className="text-gold not-italic">précision</em> — conçu pour
                  sublimer vos mains.
                </>
              )}
            </h1>
            <p className="mt-6 max-w-lg text-sm text-zinc-300 leading-relaxed md:text-base">
              {t("hero_desc")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-black hover:bg-white/90"
              >
                <Link to="/booking">{t("btn_book")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full bg-transparent border-zinc-700 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/services">
                  {language === "en" ? "Explore the menu" : "Explorer la carte"}
                </Link>
              </Button>
            </div>
          </div>

          {/* Bottom layout details */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-6 border-t border-zinc-800/80">
            {/* Social Links */}
            <div className="flex gap-4 text-xs text-zinc-300 tracking-wider">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                INSTAGRAM
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                FACEBOOK
              </a>
            </div>

            {/* Floating Widget: Featured Service Preview */}
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-850 p-4 rounded-2xl flex items-center gap-4 max-w-xs shadow-xl self-end">
              <img
                src={ASSETS.burgundyManicure}
                alt="BIAB"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-widest text-gold font-bold">
                  {language === "en" ? "Featured Treatment" : "Soin Vedette"}
                </p>
                <p className="text-xs font-serif font-semibold mt-0.5">
                  {language === "en" ? "Natural BIAB Overlay" : "Gainage BIAB Naturel"}
                </p>
                <p className="text-[10px] text-zinc-300 mt-0.5">
                  {language === "en"
                    ? "Strengthening & nude finish · 7,000 F"
                    : "Renforcement et fini nude · 7 000 F"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. VALUES SLIDER SECTION — Bento Stepper ── */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Left Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              {/* Stepper progress indicator */}
              <div className="flex items-center gap-3 text-xs tracking-widest text-zinc-500">
                <span className="font-serif text-sm text-gold">0{activeValue + 1}</span>
                <div className="h-px w-10 bg-zinc-300 relative">
                  <div
                    className="absolute left-0 top-0 h-full bg-gold transition-all duration-500"
                    style={{ width: `${((activeValue + 1) / HOMEPAGE_SLIDES.length) * 100}%` }}
                  />
                </div>
                <span>04</span>
              </div>

              <p className="label-luxe mt-8">{t("about_philosophy_tag")}</p>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl text-primary leading-tight">
                {language === "en"
                  ? "Reveal your natural beauty, day after day"
                  : "Révéler votre beauté naturelle, jour après jour"}
              </h2>
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-md">
                {language === "en"
                  ? "We believe beauty lies in health and precision. Our protocols combine medical-grade safety with couture elegance."
                  : "Nous pensons que la beauté réside dans la santé et la précision. Nos protocoles combinent rigueur médicale et élégance couture."}
              </p>
            </div>

            <div className="mt-10">
              <Button asChild className="rounded-full px-6">
                <Link to="/about">{language === "en" ? "Learn more" : "En savoir plus"}</Link>
              </Button>
            </div>
          </div>

          {/* Right Bento Cards Slider */}
          <div className="lg:col-span-7 relative">
            <div className="grid gap-6 sm:grid-cols-2">
              {HOMEPAGE_SLIDES.map((slide, idx) => {
                // Show current active slide and the next one to form a premium duo layout
                const isVisible =
                  idx === activeValue || idx === (activeValue + 1) % HOMEPAGE_SLIDES.length;
                if (!isVisible) return null;

                return (
                  <div
                    key={slide.title}
                    className="group relative h-[380px] rounded-3xl overflow-hidden shadow-md transition-all duration-700 bg-zinc-900 text-white"
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 filter saturate-[0.8] contrast-105 transition-transform duration-700 group-hover:scale-105"
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

                    {/* Volumetric step overlay */}
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
                onClick={handlePrevValue}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                aria-label="Slide précédent"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={handleNextValue}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                aria-label="Slide suivant"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. TEAM & TESTIMONIAL BLOCK — Video + Quote ── */}
      <section className="px-5 py-6 bg-muted/20">
        <div className="mx-auto max-w-6xl bg-card border border-border/40 rounded-[2.5rem] p-8 md:p-14 shadow-sm">
          <div className="mb-10 max-w-2xl">
            <p className="label-luxe">{t("about_team_tag")}</p>
            <h2 className="mt-4 font-serif text-2xl sm:text-3xl lg:text-4xl text-primary leading-snug">
              {language === "en"
                ? "We are a collective of passionate stylists and artists, dedicated to shaping the exceptional aesthetics of your nails."
                : "Nous sommes un collectif de stylistes et d'artistes passionnés, dédiés à façonner l'esthétique d'exception de vos ongles."}
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Left: Video block */}
            <div className="lg:col-span-7 relative rounded-[2rem] overflow-hidden aspect-[16/9] shadow-inner bg-zinc-950">
              {(() => {
                const rawUrl = videos?.[0]?.url || "/placeholder-manicure.html";
                const resolvedUrl = resolveAssetUrl(rawUrl);
                const isHtml = resolvedUrl.endsWith(".html");
                return (
                  <>
                    {isHtml ? (
                      <iframe
                        src={resolvedUrl}
                        className="w-full h-full border-0 object-cover opacity-80"
                        title="Presentation Video"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    ) : (
                      <video
                        src={resolvedUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-80 filter saturate-[0.8]"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                    {/* Play overlay button - only show for actual video */}
                    {!isHtml && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg animate-pulse">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Tag overlay */}
              <div className="absolute left-4 bottom-4 z-10 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-full">
                <span className="text-[10px] uppercase tracking-widest text-zinc-300">
                  {videos?.[0]?.title ||
                    (language === "en" ? "« The perfect gesture »" : "« Le geste parfait »")}
                </span>
              </div>
            </div>

            {/* Right: Testimonial Card */}
            <div className="lg:col-span-5 bg-muted/40 rounded-3xl p-6 md:p-8 border border-border/30">
              <div className="flex gap-0.5 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 font-serif text-sm leading-relaxed text-primary italic">
                {language === "en"
                  ? '"Nail art and extensions are not just about aesthetics, it is the art of magnifying the identity of each client while providing rigorous care."'
                  : "\"La prothésie ongulaire n'est pas seulement une question d'esthétique, c'est l'art de magnifier l'identité de chaque cliente tout en lui offrant un soin rigoureux.\""}
              </p>
              <div className="mt-6 flex items-center gap-4 pt-6 border-t border-border/50">
                <img
                  src={ASSETS.logo}
                  alt="Alexia"
                  className="w-10 h-10 rounded-full object-cover border border-gold/20"
                />
                <div>
                  <h4 className="font-serif text-sm text-primary">Alexia N.</h4>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    {language === "en"
                      ? "Founder & Nail Stylist"
                      : "Fondatrice & Styliste Ongulaire"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. STATS SECTION — Thin border lines ── */}
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <div className="divide-y divide-border/60">
          {STATS_ITEMS.map((item, idx) => (
            <div key={idx} className="grid md:grid-cols-12 gap-6 py-8 items-center">
              <div className="md:col-span-8">
                <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
                  {item.desc}
                </p>
              </div>
              <div className="md:col-span-4 text-left md:text-right">
                <span className="font-serif text-3xl sm:text-4xl text-primary font-semibold block">
                  {item.stat}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-medium block mt-1">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4.5 HIGHLIGHT REELS SECTION (Dynamic Promotional Videos) ── */}
      {videos && videos.length > 1 && (
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mb-12 text-center">
            <p className="label-luxe">{language === "en" ? "Our Realizations" : "Nos Créations"}</p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-primary">
              {language === "en" ? "The Art of Detail" : "L'Art du Détail"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(1, 4).map((video) => {
              const resolvedUrl = resolveAssetUrl(video.url);
              const isHtml = resolvedUrl.endsWith(".html");
              return (
                <div
                  key={video.id}
                  className="group relative rounded-3xl overflow-hidden shadow-lg border border-border/40 aspect-[9/16] bg-zinc-950"
                >
                  {isHtml ? (
                    <iframe
                      src={resolvedUrl}
                      className="w-full h-full border-0 object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                      title={video.title}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <video
                      src={resolvedUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                      {video.category}
                    </span>
                    <h3 className="text-white font-serif text-xl mt-3 leading-snug">
                      {video.title}
                    </h3>
                    <span
                      className="text-zinc-300 text-xs mt-2 line-clamp-2 block"
                      dangerouslySetInnerHTML={{ __html: video.description || "" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 5. SPLIT FEATURE SECTION — L'Atelier preview ── */}
      <section className="mx-auto max-w-6xl px-6 pb-20 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left content panel */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 text-xs tracking-widest text-zinc-500">
              <span className="font-serif text-sm text-gold">0{activeStudio + 1}</span>
              <div className="h-px w-10 bg-zinc-300 relative">
                <div
                  className="absolute left-0 top-0 h-full bg-gold transition-all duration-500"
                  style={{ width: `${((activeStudio + 1) / STUDIO_SLIDES.length) * 100}%` }}
                />
              </div>
              <span>03</span>
            </div>

            <p className="label-luxe mt-8">{language === "en" ? "The Studio" : "Le Studio"}</p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-primary leading-tight">
              {language === "en"
                ? "We cultivate the art of detail in a space designed for your comfort."
                : "Nous cultivons l'art du détail dans un espace conçu pour votre confort."}
            </h2>

            {/* Active slide desc */}
            <div className="mt-6 bg-muted/30 border border-border/40 p-5 rounded-2xl">
              <span className="text-[9px] uppercase tracking-widest text-gold font-bold">
                {STUDIO_SLIDES[activeStudio].tag}
              </span>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {STUDIO_SLIDES[activeStudio].desc}
              </p>
            </div>

            {/* Stepper arrow triggers */}
            <div className="flex gap-2 mt-8">
              <button
                onClick={handlePrevStudio}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                aria-label="Slide précédent"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={handleNextStudio}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                aria-label="Slide suivant"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>

          {/* Right Image rendering */}
          <div className="lg:col-span-7 relative">
            <div className="overflow-hidden rounded-3xl aspect-[4/3] shadow-md border border-border/40 bg-zinc-100">
              <img
                src={STUDIO_SLIDES[activeStudio].image}
                alt={STUDIO_SLIDES[activeStudio].title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
              />
            </div>
            {/* Floating tag */}
            <div className="absolute right-6 bottom-6 bg-white/90 backdrop-blur border border-border/10 p-4 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary">
                {language === "en" ? "100% Privacy" : "Confidentialité 100%"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FOOTER CTA BLOCK — Full-width dark card with avatars ── */}
      <section className="px-5 pb-16 md:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-zinc-950 text-white py-20 px-8 text-center shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
            style={{ backgroundImage: `url(${ASSETS.polishShelves})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <p className="label-luxe text-zinc-300">{t("btn_book")}</p>
            <h2 className="mt-6 font-serif text-3xl sm:text-4xl md:text-5xl leading-tight">
              {language === "en" ? (
                <>
                  Beautify your hands.
                  <br />
                  Book your suspended moment.
                </>
              ) : (
                <>
                  Sublimez vos mains.
                  <br />
                  Réservez votre instant suspendu.
                </>
              )}
            </h2>
            <div className="mt-8 flex justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-black hover:bg-gold hover:text-white px-10 py-6 text-sm font-semibold shadow-lg"
              >
                <Link to="/booking">{t("btn_book")}</Link>
              </Button>
            </div>

            {/* Stacked client avatars widget */}
            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="flex -space-x-3">
                {[ASSETS.logo, ASSETS.burgundyManicure, ASSETS.polkaDotNails].map((imgSrc, i) => (
                  <img
                    key={i}
                    src={imgSrc}
                    alt="Client avatar"
                    className="w-8 h-8 rounded-full border-2 border-zinc-950 object-cover"
                  />
                ))}
              </div>
              <p className="text-[10px] text-zinc-300 uppercase tracking-widest font-medium">
                {language === "en"
                  ? "Joined by over 500 clients this month"
                  : "Rejoint par plus de 500 clientes ce mois-ci"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

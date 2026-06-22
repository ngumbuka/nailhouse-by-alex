import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search, X, Clock, Plus, Trash2, ChevronRight, Gem, Shield } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { SoftImage } from "@/components/ui/soft-image";
import { Button } from "@/components/ui/button";
import { listServices } from "@/lib/booking.functions";
import { CATEGORIES, slugifyService, CATEGORY_BY_SLUG } from "@/lib/service-categories";
import { useServiceSelection } from "@/hooks/use-service-selection";
import { ShareButton } from "@/components/services/share-button";
import { ASSETS } from "@/lib/assets";
import { useI18n } from "@/hooks/use-i18n";

const servicesOpts = queryOptions({
  queryKey: ["services"],
  queryFn: () => listServices(),
});

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Nos Prestations — NailHouse" },
      {
        name: "description",
        content:
          "Découvrez nos soins d'exception NailHouse : manucure, pédicure, renforcement BIAB, extensions de gel, dépose et nail art couture.",
      },
      { property: "og:title", content: "Nos Prestations — NailHouse" },
      {
        property: "og:description",
        content: "Explorez nos prestations exclusives et réservez votre moment suspendu.",
      },
      { property: "og:image", content: ASSETS.heroServices },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(servicesOpts);
  },
  component: ServicesCatalog,
});

const CATEGORY_KEYS = [
  "all",
  "mains",
  "pieds",
  "naturels-renforces",
  "biab",
  "capsules",
  "supplements",
  "depose",
];

function ServicesCatalog() {
  const { language, t, translateService } = useI18n();
  const { data: rawServices } = useSuspenseQuery(servicesOpts);
  const { addService, removeService, isSelected } = useServiceSelection();

  // Localize raw services
  const services = (rawServices || []).map((s) => translateService(s));

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getCategoryName = (key: string) => {
    if (language === "en") {
      switch (key) {
        case "all":
          return "All Treatments";
        case "mains":
          return "Hand Care";
        case "pieds":
          return "Foot Care";
        case "naturels-renforces":
          return "Reinforced Natural Nails";
        case "biab":
          return "Natural Nail BIAB";
        case "capsules":
          return "Tips & Extensions";
        case "supplements":
          return "Add-ons & Nail Art";
        case "depose":
          return "Removal in Salon";
        default:
          return key;
      }
    } else {
      switch (key) {
        case "all":
          return "Tous les soins";
        case "mains":
          return "Soins des mains";
        case "pieds":
          return "Soins des pieds";
        case "naturels-renforces":
          return "Ongles naturels renforcés";
        case "biab":
          return "Ongle naturel BIAB";
        case "capsules":
          return "Capsule sur ongle";
        case "supplements":
          return "Supplément";
        case "depose":
          return "Dépose";
        default:
          return key;
      }
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesCategory =
      selectedCategory === "all" || s.category === getCategoryName(selectedCategory);
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <SiteLayout>
      {/* ── UNIFORM HERO HEADER (Boutique Aesthetic) ── */}
      <section className="px-5 py-6 md:py-10 bg-background">
        <div className="relative mx-auto max-w-6xl w-full overflow-hidden rounded-[2.5rem] bg-zinc-950 text-white min-h-[420px] flex flex-col justify-between p-8 md:p-14">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity filter contrast-125 pointer-events-none"
            style={{ backgroundImage: `url(${ASSETS.heroServices})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Top Line Info */}
          <div className="relative z-10 flex justify-between items-center text-xs tracking-[0.24em] text-zinc-300 uppercase">
            <span>NailHouse Studio</span>
            <span>Ekoumdoum, Yaoundé</span>
          </div>

          {/* Title & Desc */}
          <div className="relative z-10 my-auto max-w-2xl pt-8 pb-4">
            <span className="text-gold text-xs uppercase tracking-[0.24em] font-semibold font-sans">
              {t("catalog_title")}
            </span>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-white font-bold">
              {language === "en" ? (
                <>
                  Our Beauty <em className="text-gold not-italic">Universes</em>
                </>
              ) : (
                <>
                  Nos Univers de <em className="text-gold not-italic">Beauté</em>
                </>
              )}
            </h1>
            <div className="mt-6 h-px w-10 bg-gold" />
            <p className="mt-6 text-sm text-zinc-300 leading-relaxed md:text-base max-w-lg">
              {t("catalog_desc")}
            </p>
          </div>

          {/* Bottom stats recap */}
          <div className="relative z-10 flex flex-wrap justify-between items-center pt-6 border-t border-zinc-800/80 text-[10px] text-zinc-300 tracking-[0.22em] uppercase">
            <span>
              {services.length} {t("catalog_stats_1")}
            </span>
            <span>{t("catalog_stats_2")}</span>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE CONTROLS (SEARCH & FILTERING) ── */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-4">
        <div className="flex flex-col gap-6 bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-sm">
          {/* Category Pills Slider */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              {t("filter_label")}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORY_KEYS.map((key) => {
                const isActive = selectedCategory === key;
                const name = getCategoryName(key);
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-4 py-2 rounded-full text-xs font-serif transition duration-300 cursor-pointer shrink-0 border ${
                      isActive
                        ? "bg-gold text-white dark:text-ink border-gold font-semibold shadow-sm shadow-gold/10"
                        : "bg-background border-border/40 text-primary hover:border-gold/40"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <label htmlFor="service-search-all" className="sr-only">
              {language === "en" ? "Search for a service" : "Rechercher un soin"}
            </label>
            <input
              id="service-search-all"
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border/40 hover:border-gold/30 focus:border-gold focus:outline-none rounded-full py-4 pl-12 pr-10 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 shadow-inner"
            />
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer p-0.5"
                aria-label={language === "en" ? "Clear search" : "Effacer la recherche"}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Result counts */}
          <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>
              {t("search_results", {
                count: filteredServices.length,
                s: filteredServices.length !== 1 ? "s" : "",
              })}
            </span>
            {searchQuery || selectedCategory !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-gold hover:text-gold/80 transition-colors cursor-pointer"
              >
                {t("filter_reset")}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── PRESTATIONS LIST (HORIZONTAL CARDS) ── */}
      <section className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        {filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-[2rem] border border-dashed border-border/60 max-w-md mx-auto">
            <Gem className="mx-auto h-8 w-8 text-gold/40 stroke-1" />
            <p className="mt-4 font-serif text-lg text-primary">{t("no_service_found")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("no_service_desc")}</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              variant="outline"
              className="mt-6 rounded-full border-gold text-gold hover:bg-gold/10 cursor-pointer"
            >
              {t("all_services_btn")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredServices.map((s) => {
              const catSlug =
                CATEGORY_KEYS.find((key) => getCategoryName(key) === s.category) || "mains";
              const catInfo = CATEGORY_BY_SLUG[catSlug];
              const thumbnail = catInfo ? catInfo.image : ASSETS.workstation;

              return (
                <div
                  key={s.id}
                  className="group relative flex flex-col sm:flex-row gap-5 items-center sm:items-start rounded-3xl border border-border/40 bg-card p-5 hover:shadow-md hover:border-gold/30 transition duration-300"
                >
                  {/* Share button floating right */}
                  <div className="absolute right-4 top-4 z-20">
                    <ShareButton
                      title={s.name}
                      text={t("share_text", { name: s.name, category: s.category })}
                      path={`/services/${catSlug}/${slugifyService(s.name)}`}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gold/10 text-gold"
                    />
                  </div>

                  {/* Left Side: Thumbnail */}
                  <Link
                    to="/services/$slug/$service"
                    params={{ slug: catSlug, service: slugifyService(s.name) }}
                    className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden cursor-pointer"
                  >
                    <SoftImage
                      src={thumbnail}
                      alt={s.name}
                      aspect="aspect-square"
                      className="w-full h-full object-cover"
                      size="sm"
                    />
                  </Link>

                  {/* Right Side: Details */}
                  <div className="flex-1 flex flex-col justify-between h-full min-w-0 w-full">
                    <Link
                      to="/services/$slug/$service"
                      params={{ slug: catSlug, service: slugifyService(s.name) }}
                      className="cursor-pointer block"
                    >
                      <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                        {s.category}
                      </span>
                      <h3 className="font-serif text-base text-primary font-semibold mt-1 group-hover:text-gold transition-colors truncate pr-8">
                        {s.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {s.description || (catInfo && catInfo.intro)}
                      </p>
                    </Link>

                    {/* Bottom Line Specs & Actions */}
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40 gap-4 w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground flex items-center shrink-0">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gold/60" />{" "}
                          {s.duration || (catInfo && catInfo.duration)}
                        </span>
                        <span className="font-serif text-sm sm:text-base text-gold font-bold shrink-0">
                          {s.price_fcfa.toLocaleString("fr-FR")} F
                        </span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          size="sm"
                          className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 text-xs px-3.5 h-7.5 font-sans font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          <Link to="/booking" search={{ service: s.id }}>
                            {t("btn_book")}
                          </Link>
                        </Button>

                        {isSelected(s.id) ? (
                          <button
                            onClick={() => {
                              removeService(s.id);
                              toast.success(t("toast_removed"));
                            }}
                            className="p-1.5 rounded-full border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
                            title={language === "en" ? "Remove" : "Retirer"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              addService(s.id);
                              toast.success(t("toast_added"));
                            }}
                            className="p-1.5 rounded-full border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20 transition-colors cursor-pointer"
                            title={language === "en" ? "Add" : "Ajouter"}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

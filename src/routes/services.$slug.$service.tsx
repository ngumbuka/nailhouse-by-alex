import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Check,
  Sparkles,
  Star,
  Plus,
  Trash2,
  Shield,
  Clock,
  Gem,
  Share2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { SoftImage } from "@/components/ui/soft-image";
import { Button } from "@/components/ui/button";
import { listServices, listReviewsForService, createReview } from "@/lib/booking.functions";
import { listServiceGallery } from "@/lib/service-gallery.functions";
import { CATEGORY_BY_SLUG, slugifyService, CATEGORIES } from "@/lib/service-categories";
import { buildServiceCopy } from "@/lib/service-copy";
import { StickyPurchaseBar } from "@/components/services/sticky-purchase-bar";
import { useServiceSelection } from "@/hooks/use-service-selection";
import { ShareButton } from "@/components/services/share-button";
import { ASSETS } from "@/lib/assets";
import { useI18n } from "@/hooks/use-i18n";

const servicesOpts = queryOptions({
  queryKey: ["services"],
  queryFn: () => listServices(),
});

const galleryOpts = (slug: string) =>
  queryOptions({
    queryKey: ["service-gallery", slug],
    queryFn: () => listServiceGallery({ data: { slug } }),
  });

const reviewsOpts = (serviceId: string) =>
  queryOptions({
    queryKey: ["service-reviews", serviceId],
    queryFn: () => listReviewsForService({ data: { service_id: serviceId } }),
  });

export const Route = createFileRoute("/services/$slug/$service")({
  head: ({ params }) => {
    const info = CATEGORY_BY_SLUG[params.slug];
    const pretty = params.service.replace(/-/g, " ");
    const title = info ? `${pretty} — ${info.title} — NailHouse` : "Prestation — NailHouse";
    const desc = info?.intro.slice(0, 155) ?? "Prestation NailHouse";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: info?.image ?? "" },
      ],
    };
  },
  loader: async ({ context, params }) => {
    if (!CATEGORY_BY_SLUG[params.slug]) throw notFound();
    const services = await context.queryClient.ensureQueryData(servicesOpts);
    const info = CATEGORY_BY_SLUG[params.slug];
    const categoryServices = services.filter((s) => s.category === info.category);
    const service = categoryServices.find((s) => slugifyService(s.name) === params.service);

    await Promise.all([
      service ? context.queryClient.ensureQueryData(reviewsOpts(service.id)) : Promise.resolve(),
      context.queryClient.ensureQueryData(galleryOpts(params.slug)),
    ]);
  },
  component: ServiceDetailPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="font-serif text-4xl text-primary">Prestation introuvable</h1>
        <p className="mt-4 text-muted-foreground">Cette prestation n'existe pas ou plus.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/services">Voir toutes les prestations</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
});

function ServiceDetailPage() {
  const { language, t, translateService, translateCategory } = useI18n();
  const { slug, service: serviceSlug } = Route.useParams();

  const rawInfo = CATEGORY_BY_SLUG[slug]!;
  const info = translateCategory(rawInfo);

  const { data: rawServices } = useSuspenseQuery(servicesOpts);
  const { data: uploaded } = useSuspenseQuery(galleryOpts(slug));

  const services = (rawServices || []).map((s) => translateService(s));
  const categoryServices = services.filter((s) => s.category === info.category);
  const service = categoryServices.find((s) => slugifyService(s.name) === serviceSlug);
  const serviceId = service?.id || "00000000-0000-0000-0000-000000000000";

  const { data: reviews } = useSuspenseQuery(reviewsOpts(serviceId));
  const queryClient = useQueryClient();
  const { addService, removeService, isSelected } = useServiceSelection();

  const [clientName, setClientName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();

  const submitReview = useServerFn(createReview);

  if (!service) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="font-serif text-4xl text-primary">Prestation introuvable</h1>
          <p className="mt-4 text-muted-foreground">
            {language === "en"
              ? `This service does not exist in the ${info.title.toLowerCase()} menu.`
              : `Cette prestation n'existe pas dans la carte ${info.title.toLowerCase()}.`}
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/services/$slug" params={{ slug }}>
              {language === "en"
                ? `View ${info.title} menu`
                : `Voir la carte ${info.title.toLowerCase()}`}
            </Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const copy = buildServiceCopy(service, info, language);
  const siblings = categoryServices.filter((s) => s.id !== service.id);

  // Setup multiple images for the bento grid at the top
  const mainImage = uploaded.length > 0 ? uploaded[0].url : info.image;
  const secondaryImage = uploaded.length > 1 ? uploaded[1].url : ASSETS.workstation;
  const tertiaryImage = uploaded.length > 2 ? uploaded[2].url : ASSETS.polishShelves;

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5;

  const durationText = service.duration || info.duration;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-6 md:px-10">
        {/* ── BREADCRUMB ── */}
        <nav
          aria-label={language === "en" ? "Breadcrumb" : "Fil d'Ariane"}
          className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground"
        >
          <Link to="/" className="hover:text-gold transition-colors">
            {t("breadcrumb_home")}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <Link to="/services" className="hover:text-gold transition-colors">
            {t("breadcrumb_services")}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <Link
            to="/services/$slug"
            params={{ slug }}
            className="hover:text-gold transition-colors"
          >
            {info.title}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span className="text-gold font-medium">{service.name}</span>
        </nav>

        {/* ── 1. TOP IMAGE GRID (Bento Aesthetic) ── */}
        <div className="grid gap-4 md:grid-cols-3 mb-10 overflow-hidden rounded-[2rem]">
          {/* Main big image */}
          <div className="md:col-span-2 aspect-[16/10] md:aspect-auto md:h-[450px]">
            <SoftImage
              src={mainImage}
              alt={service.name}
              aspect="aspect-full"
              className="w-full h-full object-cover rounded-none"
              size="lg"
              loading="eager"
            />
          </div>
          {/* Side stacked images */}
          <div className="hidden md:flex flex-col gap-4 h-[450px]">
            <div className="flex-1 min-h-0">
              <SoftImage
                src={secondaryImage}
                alt="Workspace preview"
                aspect="aspect-full"
                className="w-full h-full object-cover rounded-none"
                size="md"
              />
            </div>
            <div className="flex-1 min-h-0">
              <SoftImage
                src={tertiaryImage}
                alt="Product shelves"
                aspect="aspect-full"
                className="w-full h-full object-cover rounded-none"
                size="md"
              />
            </div>
          </div>
        </div>

        {/* ── 2. TWO-COLUMN DETAILS GRID ── */}
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] items-start">
          {/* LEFT COLUMN: Main Info & Detailed Prose */}
          <div className="space-y-12">
            <div>
              <p className="label-luxe">{copy.tagline}</p>
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight font-semibold tracking-tight">
                {service.name}
              </h1>

              {/* Quick specifications line */}
              <dl className="mt-8 flex flex-wrap gap-8 border-y border-border/60 py-5 text-sm">
                <div className="flex items-center gap-2.5">
                  <dt className="text-muted-foreground flex items-center">
                    <Clock className="w-4 h-4 text-gold/70 mr-1.5" />{" "}
                    {language === "en" ? "Duration" : "Durée"}
                  </dt>
                  <dd className="font-serif font-medium text-primary">{durationText}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <dt className="text-muted-foreground flex items-center">
                    <Gem className="w-4 h-4 text-gold/70 mr-1.5" />{" "}
                    {language === "en" ? "Price" : "Tarif"}
                  </dt>
                  <dd className="font-serif font-medium text-gold">
                    {service.price_fcfa.toLocaleString("fr-FR")} F
                  </dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <dt className="text-muted-foreground flex items-center">
                    <Shield className="w-4 h-4 text-gold/70 mr-1.5" />{" "}
                    {language === "en" ? "Hygiene" : "Hygiène"}
                  </dt>
                  <dd className="font-serif font-medium text-primary">
                    {language === "en" ? "Autoclave Sterilized" : "Autoclave Stérilisé"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Focused prose description */}
            <section className="bg-card/40 border border-border/40 p-6 md:p-8 rounded-3xl">
              <p className="label-luxe">{language === "en" ? "The Treatment" : "Le Soin"}</p>
              <h2 className="mt-3 font-serif text-2xl text-primary">
                {language === "en" ? "Detailed Presentation" : "Présentation détaillée"}
              </h2>
              <div className="mt-4 h-px w-10 bg-gold" />
              <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-muted-foreground font-sans">
                <p className="font-serif italic text-primary/95 text-lg leading-relaxed">
                  « {copy.whatItIs} »
                </p>
                {copy.forWhom && (
                  <p className="pt-2">
                    <strong className="text-primary font-medium">
                      {language === "en" ? "Recommendation: " : "Recommandation : "}
                    </strong>
                    {copy.forWhom}
                  </p>
                )}
                {copy.finalNote && (
                  <p className="pt-2 text-xs uppercase tracking-wider text-gold font-semibold">
                    {copy.finalNote}
                  </p>
                )}
              </div>
            </section>

            {/* Le Déroulement timeline */}
            <section>
              <p className="label-luxe">
                {language === "en" ? "The Experience" : "Le Déroulement"}
              </p>
              <h2 className="mt-3 font-serif text-2xl text-primary">{t("details_experience")}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {info.steps.map((step, i) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm"
                  >
                    <span className="font-serif text-2xl text-gold/30 font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-serif text-lg text-primary font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Aftercare & FAQ Section */}
            <section className="grid gap-8 md:grid-cols-2 pt-6 border-t border-border/50">
              <div>
                <p className="label-luxe">
                  {language === "en" ? "Between Appointments" : "Entre deux rendez-vous"}
                </p>
                <h3 className="mt-3 font-serif text-xl text-primary font-semibold">
                  {language === "en" ? "Aftercare Tips" : "Conseils d'entretien"}
                </h3>
                <ul className="mt-5 space-y-3">
                  {info.care.map((c) => (
                    <li key={c} className="flex gap-2.5 text-xs text-muted-foreground">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label-luxe">{t("details_faq_title")}</p>
                <h3 className="mt-3 font-serif text-xl text-primary font-semibold">
                  {language === "en" ? "Answers & Information" : "Réponses & Informations"}
                </h3>
                <div className="mt-5 divide-y divide-border font-sans">
                  {info.faq.map((f) => (
                    <details key={f.q} className="group py-3 first:pt-0 last:pb-0">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 text-xs font-medium text-primary">
                        <span>{f.q}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-gold transition group-open:rotate-90" />
                      </summary>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="pt-6 border-t border-border/50">
              <div>
                <p className="label-luxe">
                  {language === "en" ? "Reviews & Testimonials" : "Avis & Témoignages"}
                </p>
                <h2 className="mt-3 font-serif text-2xl text-primary font-semibold">
                  {language === "en" ? "Shared Experience" : "L'expérience partagée"}
                </h2>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex text-gold">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(avgRating)
                            ? "fill-gold text-gold"
                            : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {language === "en"
                      ? `${avgRating.toFixed(1)} · ${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
                      : `${avgRating.toFixed(1)} · ${reviews.length} avis`}
                  </span>
                </div>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                {/* Submit Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!clientName.trim()) {
                      toast.error(
                        language === "en"
                          ? "Please enter your name."
                          : "Veuillez saisir votre nom.",
                      );
                      return;
                    }
                    startTransition(async () => {
                      try {
                        await submitReview({
                          data: {
                            service_id: service.id,
                            client_name: clientName,
                            rating,
                            comment: comment.trim() || null,
                          },
                        });
                        toast.success(
                          language === "en"
                            ? "Thank you! Your review has been saved."
                            : "Merci ! Votre avis a été enregistré.",
                        );
                        setClientName("");
                        setComment("");
                        setRating(5);
                        queryClient.invalidateQueries({
                          queryKey: ["service-reviews", service.id],
                        });
                      } catch (err) {
                        console.error(err);
                        toast.error(
                          language === "en"
                            ? "Error submitting review."
                            : "Erreur lors de la soumission de l'avis.",
                        );
                      }
                    });
                  }}
                  className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm space-y-4"
                >
                  <h4 className="font-serif text-base text-primary font-semibold">
                    {language === "en" ? "Your Feedback" : "Votre retour d'expérience"}
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {language === "en" ? "Overall Rating" : "Note globale"}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-gold focus:outline-none cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= (hoverRating || rating)
                                ? "fill-gold text-gold"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5 font-sans">
                    <label
                      htmlFor="clientName"
                      className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                    >
                      {language === "en" ? "Your Name" : "Votre nom"}
                    </label>
                    <input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={language === "en" ? "E.g. Sarah M." : "Ex: Sophie L."}
                      required
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 font-sans">
                    <label
                      htmlFor="comment"
                      className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                    >
                      {language === "en" ? "Comment" : "Commentaire"}
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        language === "en"
                          ? "Share your experience..."
                          : "Partagez votre ressenti..."
                      }
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:border-gold focus:outline-none resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 cursor-pointer text-xs"
                  >
                    {isPending
                      ? language === "en"
                        ? "Publishing..."
                        : "Publication..."
                      : language === "en"
                        ? "Post my review"
                        : "Publier mon avis"}
                  </Button>
                </form>

                {/* List of Reviews */}
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-border/40 bg-card">
                      <Star className="h-6 w-6 text-gold/30 stroke-1" />
                      <p className="mt-3 text-xs text-muted-foreground font-serif italic">
                        {language === "en" ? "No reviews yet." : "Aucun avis pour le moment."}
                      </p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="py-4 border-b border-border/40 last:border-0 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs font-sans">
                          <span className="font-serif font-semibold text-primary">
                            {rev.client_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(rev.created_at).toLocaleDateString(
                              language === "en" ? "en-US" : "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex text-gold">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-2.5 w-2.5 ${
                                star <= rev.rating
                                  ? "fill-gold text-gold"
                                  : "text-muted-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                        {rev.comment && (
                          <p className="text-xs leading-relaxed text-muted-foreground italic font-serif">
                            « {rev.comment} »
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Desktop Sticky Booking Sidebar Panel */}
          <aside className="hidden lg:block lg:sticky lg:top-24 bg-card border border-border/40 rounded-[2rem] p-8 shadow-md space-y-6">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gold font-bold">
                {copy.tagline}
              </span>
              <h3 className="font-serif text-2xl text-primary font-semibold mt-1 font-serif">
                {service.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {language === "en"
                  ? "Meticulous treatment at the Ekoumdoum studio."
                  : "Prestation soignée à l'atelier d'Ekoumdoum."}
              </p>
            </div>

            <div className="border-t border-b border-border/50 py-5 space-y-3 font-sans">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">
                  {language === "en" ? "Unique price" : "Tarif unique"}
                </span>
                <span className="font-serif text-3xl text-gold font-bold">
                  {service.price_fcfa.toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  {language === "en" ? "Estimated duration" : "Durée estimée"}
                </span>
                <span className="font-serif font-medium text-primary">{durationText}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground font-sans">
              <div className="flex gap-2">
                <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>
                  {language === "en"
                    ? "Medical-grade autoclave sterilization."
                    : "Stérilisation autoclave de grade médical."}
                </span>
              </div>
              <div className="flex gap-2">
                <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>
                  {language === "en"
                    ? "Selected premium polishes and oils."
                    : "Vernis et huiles haut de gamme sélectionnés."}
                </span>
              </div>
              <div className="flex gap-2">
                <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>
                  {language === "en"
                    ? "Quiet space and complimentary hot drink."
                    : "Espace calme et boisson chaude offerte."}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 cursor-pointer"
              >
                <Link to="/booking" search={{ service: service.id }}>
                  {language === "en" ? "Book this treatment" : "Réserver ce soin"}
                </Link>
              </Button>

              {isSelected(service.id) ? (
                <Button
                  onClick={() => {
                    removeService(service.id);
                    toast.success(t("toast_removed"));
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-destructive text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />{" "}
                  {language === "en" ? "Remove from my selection" : "Retirer de ma sélection"}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    addService(service.id);
                    toast.success(t("toast_added"));
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-gold text-gold hover:bg-gold/10 cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />{" "}
                  {language === "en" ? "Add to my selection" : "Ajouter à ma sélection"}
                </Button>
              )}

              <ShareButton
                title={service.name}
                text={t("share_text", { name: service.name, category: info.title })}
                path={`/services/${slug}/${serviceSlug}`}
                variant="outline"
                size="lg"
                showLabel={true}
                className="w-full rounded-full h-11"
              />
            </div>
          </aside>
        </div>

        {/* ── 3. SIBLINGS SECTION (Recommended Curated Grid) ── */}
        {siblings.length > 0 && (
          <section className="border-t border-border py-16 mt-16">
            <p className="label-luxe">
              {language === "en" ? "In the Same Family" : "Dans la même famille"}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-primary font-semibold">
              {language === "en"
                ? `Other ${info.title.toLowerCase()} services`
                : `Autres prestations ${info.title.toLowerCase()}`}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground max-w-xl font-sans">
              {language === "en"
                ? "Complete or discover other services from our menu to beautify your hands and feet."
                : "Complétez ou découvrez d'autres soins de notre carte pour magnifier vos mains et pieds."}
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {siblings.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="group relative flex flex-col sm:flex-row gap-5 items-center sm:items-start rounded-3xl border border-border/40 bg-card p-5 hover:shadow-md hover:border-gold/30 transition duration-300"
                >
                  <Link
                    to="/services/$slug/$service"
                    params={{ slug, service: slugifyService(s.name) }}
                    className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden cursor-pointer"
                  >
                    <SoftImage
                      src={secondaryImage}
                      alt={s.name}
                      aspect="aspect-square"
                      className="w-full h-full object-cover"
                      size="sm"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between h-full min-w-0 w-full">
                    <Link
                      to="/services/$slug/$service"
                      params={{ slug, service: slugifyService(s.name) }}
                      className="cursor-pointer block"
                    >
                      <span className="text-xs uppercase tracking-widest text-gold font-bold">
                        {info.title}
                      </span>
                      <h3 className="font-serif text-base text-primary font-semibold mt-1 group-hover:text-gold transition-colors truncate">
                        {s.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans">
                        {s.description || info.intro}
                      </p>
                    </Link>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40 gap-4 w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground flex items-center shrink-0">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gold/60" />{" "}
                          {s.duration || info.duration}
                        </span>
                        <span className="font-serif text-sm sm:text-base text-gold font-bold shrink-0">
                          {s.price_fcfa.toLocaleString("fr-FR")} F
                        </span>
                      </div>

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
              ))}
            </div>
          </section>
        )}

        {/* ── 4. VISUAL CATEGORY SWITCHER ── */}
        <section className="border-t border-border py-16 mt-6">
          <p className="label-luxe">
            {language === "en" ? "Change Category" : "Changer de catégorie"}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-primary font-semibold">
            {language === "en" ? "Explore Other Menus" : "Explorer les autres cartes"}
          </h2>
          <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            {CATEGORIES.map((cat) => {
              const isActive = cat.slug === slug;
              return (
                <Link
                  key={cat.slug}
                  to="/services/$slug"
                  params={{ slug: cat.slug }}
                  className={`flex flex-col items-center text-center p-4 rounded-2xl border transition duration-300 ${
                    isActive
                      ? "bg-gold/10 border-gold/40 text-gold"
                      : "bg-card border-border/40 text-primary hover:border-gold/40"
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider font-semibold font-serif">
                    {cat.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── MOBILE STICKY PURCHASE BAR ── */}
      <StickyPurchaseBar
        serviceId={service.id}
        serviceName={service.name}
        priceFcfa={service.price_fcfa}
        duration={durationText}
        path={`/services/${slug}/${serviceSlug}`}
      />
    </SiteLayout>
  );
}

// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trash2,
  User,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  createBooking,
  listServices,
  validatePromo,
  getAvailableTimeSlots,
} from "@/lib/booking.functions";
import { getUserProfile } from "@/lib/portal.functions";
import { supabase } from "@/integrations/supabase/client";
import { ASSETS } from "@/lib/assets";
import { MockProfile } from "@/lib/mock-db";
import { useI18n } from "@/hooks/use-i18n";
import { SoftImage } from "@/components/ui/soft-image";

const opts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });

export const Route = createFileRoute("/booking")({
  validateSearch: (s: Record<string, unknown>) =>
    z
      .object({
        service: z.string().uuid().optional(),
        services: z.string().optional(),
      })
      .parse(s),
  head: () => ({
    meta: [
      { title: "Réserver — NailHouse" },
      {
        name: "description",
        content:
          "Réservez votre rendez-vous NailHouse en ligne — sélection de la prestation, date et créneau.",
      },
      { property: "og:title", content: "Réserver — NailHouse" },
      { property: "og:description", content: "Réservation en ligne chez NailHouse." },
      { property: "og:image", content: ASSETS.burgundyManicure },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: BookingPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

function BookingPage() {
  const { language, t, translateService } = useI18n();
  const { data: rawServices } = useSuspenseQuery(opts);
  const submit = useServerFn(createBooking);
  const getAvailableTimeSlotsFn = useServerFn(getAvailableTimeSlots);
  const { service: preselectId, services: preselectIdsStr } = Route.useSearch();

  // Translate services data
  const services = (rawServices || [])
    .filter((s) => s.is_active !== false)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map((s) => translateService(s));

  const initialIds = (() => {
    if (preselectIdsStr)
      return preselectIdsStr.split(",").filter((id) => z.string().uuid().safeParse(id).success);
    if (preselectId) return [preselectId];
    return [];
  })();

  // State
  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [userProfile, setUserProfile] = useState<MockProfile | null>(null);
  const [useProfilePreferences, setUseProfilePreferences] = useState(true);

  // Promo states
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_percent: number;
    description?: string | null;
  } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const getActiveServicePrice = (s: {
    price_fcfa: number;
    seasonal_price_fcfa?: number | null;
    seasonal_price_start?: string | null;
    seasonal_price_end?: string | null;
  }): number => {
    if (
      s.seasonal_price_fcfa !== undefined &&
      s.seasonal_price_fcfa !== null &&
      s.seasonal_price_start &&
      s.seasonal_price_end
    ) {
      const now = new Date();
      const start = new Date(s.seasonal_price_start);
      const end = new Date(s.seasonal_price_end);
      if (now >= start && now <= end) {
        return s.seasonal_price_fcfa;
      }
    }
    return s.price_fcfa;
  };

  const qc = useQueryClient();
  const getProfileFn = useServerFn(getUserProfile);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const usr = data.session?.user ?? null;
      if (usr) {
        setEmail(usr.email || "");
        getProfileFn().then((prof) => {
          if (prof) {
            setName(prof.name || "");
            setPhone(prof.phone || "");
            setUserProfile(prof);
          }
        });
      }
    });
  }, [getProfileFn]);

  const selectedServices = services.filter((s) => selectedIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + getActiveServicePrice(s), 0);
  const totalDurationMins = selectedServices.reduce((sum, s) => sum + (s.duration_mins || 60), 0);
  const discountAmount = appliedPromo
    ? Math.round(totalPrice * (appliedPromo.discount_percent / 100))
    : 0;
  const finalPrice = totalPrice - discountAmount;

  const timeSlotsQuery = useQuery({
    queryKey: ["timeSlots", date?.toISOString(), totalDurationMins],
    queryFn: async () => {
      if (!date) return [];
      const slots = await getAvailableTimeSlotsFn({
        data: { dateISO: date.toISOString(), durationMins: totalDurationMins },
      });
      return slots;
    },
    enabled: !!date,
  });
  const availableTimeSlots = timeSlotsQuery.data || [];

  const grouped = services.reduce<Record<string, typeof services>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  // Validation per step
  const canProceed = {
    1: selectedIds.length > 0 && selectedServices.some((s) => !s.is_addon),
    2: !!date && !!time,
    3: name.trim().length >= 2 && phone.trim().length >= 6 && email.includes("@"),
  };

  const currentLocale = language === "en" ? enUS : fr;

  const STEPS = [
    { id: 1, label: t("booking_step_1").replace(/^\d+\.\s*/, ""), icon: Sparkles },
    { id: 2, label: t("booking_step_2").replace(/^\d+\.\s*/, ""), icon: CalendarIcon },
    { id: 3, label: t("booking_step_3").replace(/^\d+\.\s*/, ""), icon: User },
  ];

  const validatePromoFn = useServerFn(validatePromo);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canProceed[3]) return;
    const [hh, mm] = time.split(":").map(Number);
    const scheduled = new Date(date!);
    scheduled.setHours(hh, mm, 0, 0);
    setLoading(true);
    const finalNotesParts: string[] = [];
    if (useProfilePreferences && userProfile) {
      const prefParts: string[] = [];
      if (userProfile.preferred_length && userProfile.preferred_length !== "none") {
        prefParts.push(`Length: ${userProfile.preferred_length}`);
      }
      if (userProfile.preferred_shape && userProfile.preferred_shape !== "none") {
        prefParts.push(`Shape: ${userProfile.preferred_shape}`);
      }
      if (userProfile.preferred_style && userProfile.preferred_style !== "none") {
        prefParts.push(`Style: ${userProfile.preferred_style}`);
      }
      if (userProfile.preferred_stylist) {
        prefParts.push(`Stylist: ${userProfile.preferred_stylist}`);
      }
      if (userProfile.allergies_contraindications) {
        prefParts.push(`Allergies/Sensitivities: ${userProfile.allergies_contraindications}`);
      }
      if (prefParts.length > 0) {
        finalNotesParts.push(`[Profile Preferences] ${prefParts.join(", ")}`);
      }
    }
    if (appliedPromo) {
      finalNotesParts.push(
        `[Promo Code] Code: ${appliedPromo.code} (-${appliedPromo.discount_percent}%)`,
      );
    }
    if (notes.trim()) {
      finalNotesParts.push(notes.trim());
    }
    const finalNotes = finalNotesParts.join("\n");

    try {
      await submit({
        data: {
          name,
          phone,
          email,
          service_id: selectedServices[0].id,
          service_name: selectedServices[0].name,
          service_ids: selectedServices.map((s) => s.id),
          service_names: selectedServices.map((s) => s.name),
          scheduled_at: scheduled.toISOString(),
          notes: finalNotes || null,
        },
      });
      setDone(true);
      qc.invalidateQueries({ queryKey: ["portal", "bookings"] });
      qc.invalidateQueries({ queryKey: ["portal", "notifications"] });
      toast.success(
        language === "en"
          ? "Your appointment request has been successfully sent."
          : "Votre demande de rendez-vous a bien été envoyée.",
      );
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("nailhouse-service-selection");
        window.dispatchEvent(new Event("nailhouse-selection-change"));
      }
    } catch (err) {
      console.error(err);
      toast.error(
        language === "en"
          ? "An error occurred. Please try again or call us."
          : "Une erreur est survenue. Veuillez réessayer ou nous appeler.",
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setDone(false);
    setStep(1);
    setSelectedIds([]);
    setDate(undefined);
    setTime("");
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
  }

  // ─── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <SiteLayout>
        <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center animate-in fade-in duration-500">
          <span className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold border border-gold/30">
            <Check className="h-7 w-7" />
          </span>
          <h1 className="font-serif text-3xl text-primary md:text-4xl">
            {language === "en"
              ? `Thank you, ${name.split(" ")[0]}!`
              : `Merci, ${name.split(" ")[0]} !`}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {language === "en" ? (
              <>
                Your request has been received. We will call you back at{" "}
                <span className="font-medium text-foreground">{phone}</span> to confirm your slot on{" "}
                <span className="font-medium text-foreground">
                  {date && format(date, "EEEE, MMMM d", { locale: currentLocale })} at {time}
                </span>
                .
              </>
            ) : (
              <>
                Votre demande est bien enregistrée. Nous vous rappelons au{" "}
                <span className="font-medium text-foreground">{phone}</span> pour valider votre
                créneau du{" "}
                <span className="font-medium text-foreground">
                  {date && format(date, "EEEE d MMMM", { locale: currentLocale })} à {time}
                </span>
                .
              </>
            )}
          </p>
          <div className="mt-6 w-full rounded-2xl border border-gold/15 bg-card p-6 text-left shadow-sm">
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              {t("booking_summary_title")}
            </p>
            {selectedServices.map((s) => {
              const sPrice = getActiveServicePrice(s);
              return (
                <div
                  key={s.id}
                  className="flex justify-between py-2 text-sm border-b border-muted/50 last:border-none"
                >
                  <span className="font-serif text-primary font-medium">{s.name}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-gold font-semibold">
                      {sPrice.toLocaleString("fr-FR")} F
                    </span>
                    {sPrice !== s.price_fcfa && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        {s.price_fcfa.toLocaleString("fr-FR")} F
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="mt-4 flex flex-col gap-1.5 border-t border-gold/15 pt-3.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{language === "en" ? "Duration" : "Durée"}</span>
                <span>
                  {Math.floor(totalDurationMins / 60) > 0 &&
                    `${Math.floor(totalDurationMins / 60)}h`}
                  {totalDurationMins % 60 > 0 && `${totalDurationMins % 60}m`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{language === "en" ? "Subtotal" : "Sous-total"}</span>
                <span>{totalPrice.toLocaleString("fr-FR")} F</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-xs text-emerald-500 font-semibold">
                  <span>
                    Promo ({appliedPromo.code}): -{appliedPromo.discount_percent}%
                  </span>
                  <span>-{discountAmount.toLocaleString("fr-FR")} F</span>
                </div>
              )}
              <div className="flex justify-between font-serif text-base font-semibold text-primary pt-2 border-t border-dashed border-gold/10">
                <span>{t("cart_total_prefix")}</span>
                <span className="text-gold font-bold">
                  {finalPrice.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              onClick={reset}
              variant="outline"
              className="rounded-full border-gold/40 hover:bg-gold/5 cursor-pointer"
            >
              {language === "en" ? "New booking" : "Nouvelle réservation"}
            </Button>
            <Button
              asChild
              className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 cursor-pointer shadow-lg shadow-gold/10"
            >
              <Link to="/">{t("btn_back_home")}</Link>
            </Button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // ─── Main form ─────────────────────────────────────────────────────────────
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="label-luxe">{t("booking_hero_tag")}</p>
          <h1 className="mt-4 font-serif text-4xl text-primary md:text-5xl tracking-tight">
            {t("booking_hero_title")}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            {language === "en"
              ? "Three simple steps to book your signature treatment."
              : "Trois étapes simples pour réserver votre soin signature."}
          </p>
        </div>

        {/* Progress stepper */}
        <div className="mx-auto mb-12 flex max-w-md items-center justify-between px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => step > s.id && setStep(s.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all duration-200",
                    step < s.id ? "opacity-35 cursor-default" : "cursor-pointer hover:opacity-90",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                      step === s.id
                        ? "border-gold bg-gold text-white dark:text-ink shadow-lg shadow-gold/20"
                        : step > s.id
                          ? "border-gold/50 bg-gold/10 text-gold"
                          : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {step > s.id ? (
                      <Check className="h-4.5 w-4.5" />
                    ) : (
                      <Icon className="h-4.5 w-4.5" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "hidden text-[10px] uppercase tracking-[0.2em] font-semibold sm:block",
                      step === s.id ? "text-gold font-bold" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-3 h-0.5 flex-1 transition-all duration-500",
                      step > s.id ? "bg-gold/40" : "bg-border",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Content grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">
          {/* Left: step panels */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            {/* ── STEP 1: Services ────────────────────────── */}
            {step === 1 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="font-serif text-2xl text-primary">
                  {language === "en" ? "Choose your treatments" : "Choisissez vos soins"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {language === "en"
                    ? "Select one or more services."
                    : "Sélectionnez une ou plusieurs prestations."}
                </p>

                <div className="mt-6 space-y-6">
                  {Object.entries(grouped).map(([cat, items]) => (
                    <div
                      key={cat}
                      className="border-b border-muted last:border-none pb-4 last:pb-0"
                    >
                      <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
                        {cat}
                      </p>
                      <div className="space-y-2.5">
                        {items.map((s) => {
                          const selected = selectedIds.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() =>
                                setSelectedIds(
                                  selected
                                    ? selectedIds.filter((id) => id !== s.id)
                                    : [...selectedIds, s.id],
                                )
                              }
                              className={cn(
                                "flex w-full cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 hover:scale-[1.005]",
                                selected
                                  ? "border-gold/50 bg-gold/5 shadow-sm ring-1 ring-gold/25"
                                  : "border-border hover:border-gold/30 hover:bg-muted/40",
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {s.image_url && (
                                  <img
                                    src={s.image_url}
                                    alt=""
                                    className="h-10 w-10 shrink-0 rounded object-cover border border-border/50"
                                  />
                                )}
                                <span
                                  className={cn(
                                    "grid h-5 w-5 shrink-0 place-items-center rounded border transition-all duration-200",
                                    selected
                                      ? "border-gold bg-gold text-white dark:text-ink"
                                      : "border-border bg-background",
                                  )}
                                >
                                  {selected && <Check className="h-3 w-3" />}
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-serif text-sm text-primary font-medium truncate">
                                    {s.name}
                                  </span>
                                  {s.is_addon && (
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                                      Supplément
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="ml-3 shrink-0 font-serif text-sm text-gold font-bold">
                                  {getActiveServicePrice(s).toLocaleString("fr-FR")} F
                                </span>
                                {getActiveServicePrice(s) !== s.price_fcfa && (
                                  <span className="text-[10px] text-muted-foreground line-through">
                                    {s.price_fcfa.toLocaleString("fr-FR")} F
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4">
                  {selectedIds.length > 0 && !canProceed[1] && (
                    <span className="text-xs text-amber-600 font-semibold text-right max-w-xs animate-in slide-in-from-right-4">
                      {language === "en"
                        ? "Please select at least one primary service. Add-ons cannot be booked alone."
                        : "Veuillez sélectionner au moins une prestation principale. Un supplément ne peut être réservé seul."}
                    </span>
                  )}
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceed[1]}
                    className="rounded-full bg-gold px-8 text-white dark:text-ink hover:bg-gold/90 cursor-pointer shadow-lg shadow-gold/10 font-semibold"
                  >
                    {t("booking_btn_next").replace(/\s*step\s*/i, "")}{" "}
                    <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Date & Time ──────────────────────── */}
            {step === 2 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="font-serif text-2xl text-primary">
                  {language === "en" ? "Choose a time slot" : "Choisissez un créneau"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {language === "en"
                    ? "Select your preferred date and time."
                    : "Sélectionnez votre date et l'heure qui vous convient."}
                </p>

                <div className="mt-6 space-y-6">
                  {/* Date picker */}
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
                      Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "mt-2 w-full justify-start rounded-xl border-border hover:border-gold/30 text-left font-normal cursor-pointer py-6 shadow-sm",
                            !date && "text-muted-foreground",
                            date && "border-gold/30 bg-gold/5",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4.5 w-4.5 text-gold shrink-0" />
                          <span className="font-serif text-sm text-primary">
                            {date
                              ? format(
                                  date,
                                  language === "en" ? "EEEE, MMMM d, yyyy" : "EEEE d MMMM yyyy",
                                  { locale: currentLocale },
                                )
                              : language === "en"
                                ? "Choose a date"
                                : "Choisir une date"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time slots grid */}
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
                      {language === "en" ? "Time" : "Heure"}
                    </Label>
                    <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {timeSlotsQuery.isLoading ? (
                        <div className="col-span-full py-6 text-center text-sm text-muted-foreground">
                          {language === "en"
                            ? "Checking availability..."
                            : "Vérification des disponibilités..."}
                        </div>
                      ) : availableTimeSlots.length === 0 && date ? (
                        <div className="col-span-full py-6 text-center text-sm text-muted-foreground">
                          {language === "en"
                            ? "No available slots for this duration."
                            : "Aucun créneau disponible pour cette durée."}
                        </div>
                      ) : (
                        availableTimeSlots.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTime(t)}
                            className={cn(
                              "flex cursor-pointer items-center justify-center rounded-lg border py-2 text-xs font-semibold tracking-wider transition-all duration-200 hover:scale-[1.03]",
                              time === t
                                ? "border-gold bg-[#6D5337] text-white dark:bg-gold dark:text-ink shadow-md"
                                : "border-border hover:border-gold/40 hover:bg-muted/50 text-primary",
                            )}
                          >
                            <Clock className="mr-1 h-3 w-3 opacity-50 shrink-0" />
                            {t}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="rounded-full text-muted-foreground cursor-pointer font-semibold"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />{" "}
                    {t("booking_btn_prev").replace(/\s*step\s*/i, "")}
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceed[2]}
                    className="rounded-full bg-gold px-8 text-white dark:text-ink hover:bg-gold/90 cursor-pointer shadow-lg shadow-gold/10 font-semibold"
                  >
                    {t("booking_btn_next").replace(/\s*step\s*/i, "")}{" "}
                    <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Contact ──────────────────────────── */}
            {step === 3 && (
              <form onSubmit={onSubmit} className="animate-in fade-in duration-300">
                <h2 className="font-serif text-2xl text-primary">
                  {t("booking_step_3").replace(/^\d+\.\s*/, "")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {language === "en"
                    ? "We will confirm your appointment by phone."
                    : "Nous vous confirmons votre rendez-vous par téléphone."}
                </p>

                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="name"
                        className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold"
                      >
                        {t("booking_field_name")} *
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                        placeholder="Amina Bello"
                        className="rounded-xl border-border focus-visible:ring-gold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="phone"
                        className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold"
                      >
                        {t("booking_field_phone")} *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="6XX XXX XXX"
                        className="rounded-xl border-border focus-visible:ring-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold"
                    >
                      {t("booking_field_email")} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="vous@exemple.com"
                      className="rounded-xl border-border focus-visible:ring-gold"
                    />
                  </div>

                  {/* Preferences Card */}
                  {userProfile && (
                    <div className="rounded-xl border border-gold/15 bg-gold/5 p-4 space-y-2.5 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between">
                        <Label
                          className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5 cursor-pointer"
                          htmlFor="use-pref"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {language === "en"
                            ? "Apply Saved Profile Preferences?"
                            : "Appliquer vos préférences de profil ?"}
                        </Label>
                        <input
                          type="checkbox"
                          id="use-pref"
                          checked={useProfilePreferences}
                          onChange={(e) => setUseProfilePreferences(e.target.checked)}
                          className="rounded text-gold focus:ring-gold/30 h-4.5 w-4.5 accent-gold cursor-pointer"
                        />
                      </div>

                      {useProfilePreferences && (
                        <div className="text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-gold/10">
                          {userProfile.preferred_length &&
                            userProfile.preferred_length !== "none" && (
                              <p>
                                • {language === "en" ? "Length:" : "Longueur :"}{" "}
                                <span className="text-foreground font-medium capitalize">
                                  {userProfile.preferred_length}
                                </span>
                              </p>
                            )}
                          {userProfile.preferred_shape &&
                            userProfile.preferred_shape !== "none" && (
                              <p>
                                • {language === "en" ? "Shape:" : "Forme :"}{" "}
                                <span className="text-foreground font-medium capitalize">
                                  {userProfile.preferred_shape}
                                </span>
                              </p>
                            )}
                          {userProfile.preferred_style &&
                            userProfile.preferred_style !== "none" && (
                              <p>
                                • {language === "en" ? "Style:" : "Style :"}{" "}
                                <span className="text-foreground font-medium capitalize">
                                  {userProfile.preferred_style}
                                </span>
                              </p>
                            )}
                          {userProfile.preferred_stylist && (
                            <p>
                              • {language === "en" ? "Stylist:" : "Styliste :"}{" "}
                              <span className="text-foreground font-medium capitalize">
                                {userProfile.preferred_stylist}
                              </span>
                            </p>
                          )}
                          {userProfile.allergies_contraindications && (
                            <p className="col-span-2 text-amber-500 font-medium">
                              ⚠️ {language === "en" ? "Allergies:" : "Allergies :"}{" "}
                              <span className="italic">
                                {userProfile.allergies_contraindications}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="notes"
                      className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold"
                    >
                      {t("booking_field_notes")}
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder={t("booking_notes_placeholder")}
                      className="rounded-xl border-border focus-visible:ring-gold resize-none"
                    />
                  </div>

                  {/* Code Promo */}
                  <div className="space-y-1.5 pt-4 border-t border-border/50">
                    <Label
                      htmlFor="promo"
                      className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold"
                    >
                      {language === "en" ? "Promo Code" : "Code Promo"}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={!!appliedPromo || validatingPromo}
                        placeholder={language === "en" ? "E.g., SUMMER20" : "Ex: SUMMER20"}
                        className="rounded-xl border-border focus-visible:ring-gold uppercase"
                      />
                      {appliedPromo ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setAppliedPromo(null);
                            setPromoCode("");
                          }}
                          className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive"
                        >
                          {language === "en" ? "Remove" : "Retirer"}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={!promoCode.trim() || validatingPromo}
                          onClick={async () => {
                            setValidatingPromo(true);
                            try {
                              const res = await validatePromoFn({
                                code: promoCode.trim().toUpperCase(),
                                serviceId: selectedIds[0] || null,
                              });
                              setAppliedPromo(res);
                              toast.success(
                                language === "en"
                                  ? `Promo applied: -${res.discount_percent}%!`
                                  : `Code promo appliqué : -${res.discount_percent}% !`,
                              );
                            } catch (err: unknown) {
                              const errMsg =
                                err instanceof Error ? err.message : "Code promo invalide";
                              toast.error(errMsg);
                            } finally {
                              setValidatingPromo(false);
                            }
                          }}
                          className="rounded-xl bg-gold hover:bg-gold/90 text-white dark:text-ink font-medium"
                        >
                          {validatingPromo
                            ? language === "en"
                              ? "Validating..."
                              : "Validation..."
                            : language === "en"
                              ? "Apply"
                              : "Appliquer"}
                        </Button>
                      )}
                    </div>
                    {appliedPromo && (
                      <p className="text-xs text-emerald-500 font-medium">
                        ✓{" "}
                        {appliedPromo.description ||
                          (language === "en" ? "Promotion applied!" : "Promotion appliquée !")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="rounded-full text-muted-foreground cursor-pointer font-semibold"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />{" "}
                    {t("booking_btn_prev").replace(/\s*step\s*/i, "")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !canProceed[3]}
                    className="rounded-full bg-gold px-8 text-white dark:text-ink hover:bg-gold/90 cursor-pointer shadow-lg shadow-gold/10 font-semibold"
                  >
                    {loading ? (
                      language === "en" ? (
                        "Sending..."
                      ) : (
                        "Envoi…"
                      )
                    ) : (
                      <>
                        {t("booking_btn_confirm")}{" "}
                        <Check className="ml-1.5 h-4.5 w-4.5 font-bold" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="mt-5 text-center text-xs text-muted-foreground">
                  {language === "en" ? "Or call us at" : "Ou appelez-nous au"}{" "}
                  <a
                    href="tel:+237677216185"
                    className="text-gold font-bold underline-offset-2 hover:underline"
                  >
                    677 216 185
                  </a>
                </p>
              </form>
            )}
          </div>

          {/* Right: sticky summary */}
          <aside className="space-y-4">
            {/* Order summary */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
                {t("booking_summary_title")}
              </p>

              {selectedServices.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("booking_summary_empty")}
                </p>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {selectedServices.map((s) => (
                      <div key={s.id} className="flex items-start justify-between py-3">
                        <div className="mr-3 min-w-0">
                          <p className="font-serif text-sm leading-snug text-primary font-medium">
                            {s.name}
                          </p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {s.category}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <div className="flex flex-col items-end">
                            <span className="font-serif text-sm text-gold font-bold">
                              {getActiveServicePrice(s).toLocaleString("fr-FR")} F
                            </span>
                            {getActiveServicePrice(s) !== s.price_fcfa && (
                              <span className="text-[10px] text-muted-foreground line-through">
                                {s.price_fcfa.toLocaleString("fr-FR")} F
                              </span>
                            )}
                          </div>
                          {step === 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedIds(selectedIds.filter((id) => id !== s.id))
                              }
                              className="cursor-pointer text-muted-foreground transition hover:text-destructive"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex flex-col gap-2 border-t border-border pt-3">
                    <div className="flex justify-between font-serif text-sm font-medium text-muted-foreground">
                      <span>{language === "en" ? "Subtotal" : "Sous-total"}</span>
                      <span>{totalPrice.toLocaleString("fr-FR")} F</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-xs text-emerald-500 font-semibold animate-in fade-in duration-200">
                        <span>
                          Promo ({appliedPromo.code}): -{appliedPromo.discount_percent}%
                        </span>
                        <span>-{discountAmount.toLocaleString("fr-FR")} F</span>
                      </div>
                    )}
                    <div className="flex justify-between font-serif text-base font-semibold text-primary pt-1 border-t border-dashed border-border/50">
                      <span>{t("cart_total_prefix")}</span>
                      <span className="text-gold font-bold">
                        {finalPrice.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Date / time summary */}
            {(date || time) && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-in fade-in duration-300">
                <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
                  {language === "en" ? "Time Slot" : "Créneau"}
                </p>
                {date && (
                  <p className="font-serif text-sm text-primary font-medium">
                    {format(date, language === "en" ? "EEEE, MMMM d, yyyy" : "EEEE d MMMM yyyy", {
                      locale: currentLocale,
                    })}
                  </p>
                )}
                {time && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-gold font-bold">
                    <Clock className="h-3.5 w-3.5" /> {time}
                  </p>
                )}
              </div>
            )}

            {/* Sticky image with SoftImage visual polish matching home page */}
            <div className="hidden overflow-hidden lg:block shrink-0">
              <SoftImage
                src={ASSETS.polkaDotNails}
                alt="NailHouse Boutique"
                aspect="aspect-[3/4]"
                className="rounded-2xl shadow-sm border border-gold/10"
              />
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
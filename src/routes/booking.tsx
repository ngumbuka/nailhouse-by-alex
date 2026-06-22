import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
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
import { createBooking, listServices } from "@/lib/booking.functions";
import { ASSETS } from "@/lib/assets";
import { useI18n } from "@/hooks/use-i18n";

const opts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });

const TIME_SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 9; h < 19; h++)
    for (const m of [0, 30]) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  return out;
})();

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
  const { service: preselectId, services: preselectIdsStr } = Route.useSearch();

  // Translate services data
  const services = (rawServices || []).map((s) => translateService(s));

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

  const selectedServices = services.filter((s) => selectedIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price_fcfa, 0);

  const grouped = services.reduce<Record<string, typeof services>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  // Validation per step
  const canProceed = {
    1: selectedIds.length > 0,
    2: !!date && !!time,
    3: name.trim().length >= 2 && phone.trim().length >= 6 && email.includes("@"),
  };

  const currentLocale = language === "en" ? enUS : fr;

  const STEPS = [
    { id: 1, label: language === "en" ? "Services" : "Prestations", icon: Sparkles },
    { id: 2, label: language === "en" ? "Date & Time" : "Date & Heure", icon: CalendarIcon },
    { id: 3, label: language === "en" ? "Your details" : "Vos infos", icon: User },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canProceed[3]) return;
    const [hh, mm] = time.split(":").map(Number);
    const scheduled = new Date(date!);
    scheduled.setHours(hh, mm, 0, 0);
    setLoading(true);
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
          notes: notes || null,
        },
      });
      setDone(true);
      toast.success(
        language === "en"
          ? "Your appointment request has been successfully sent."
          : "Votre demande de rendez-vous a bien été envoyée.",
      );
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("nailhouse-selected-services");
        window.dispatchEvent(new Event("storage"));
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
        <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
          <span className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold">
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
                Votre demande est bien arrivée. Nous vous rappelons au{" "}
                <span className="font-medium text-foreground">{phone}</span> pour confirmer votre
                créneau du{" "}
                <span className="font-medium text-foreground">
                  {date && format(date, "EEEE d MMMM", { locale: currentLocale })} à {time}
                </span>
                .
              </>
            )}
          </p>
          <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5 text-left">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground font-semibold">
              {language === "en" ? "Summary" : "Récapitulatif"}
            </p>
            {selectedServices.map((s) => (
              <div key={s.id} className="flex justify-between py-1.5 text-sm">
                <span className="font-serif text-primary">{s.name}</span>
                <span className="text-gold">{s.price_fcfa.toLocaleString("fr-FR")} F</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-serif text-base font-semibold text-primary">
              <span>{language === "en" ? "Total" : "Total"}</span>
              <span className="text-gold">{totalPrice.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={reset}
              variant="outline"
              className="rounded-full border-gold/40 cursor-pointer"
            >
              {language === "en" ? "New booking" : "Nouvelle réservation"}
            </Button>
            <Button
              asChild
              className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 cursor-pointer"
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
        <div className="mb-10 text-center">
          <p className="label-luxe">
            {language === "en" ? "Online Reservation" : "Réservation en ligne"}
          </p>
          <h1 className="mt-4 font-serif text-4xl text-primary md:text-5xl">
            {language === "en" ? "Book an Appointment" : "Prenez rendez-vous"}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            {language === "en"
              ? "Three simple steps to book your signature treatment."
              : "Trois étapes simples pour réserver votre soin signature."}
          </p>
        </div>

        {/* Progress stepper */}
        <div className="mx-auto mb-10 flex max-w-md items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => step > s.id && setStep(s.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-opacity",
                  step < s.id ? "opacity-40 cursor-default" : "cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-medium transition-all",
                    step === s.id
                      ? "border-gold bg-gold text-white dark:text-ink shadow-sm shadow-gold/30"
                      : step > s.id
                        ? "border-gold/60 bg-gold/10 text-gold"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </span>
                <span
                  className={cn(
                    "hidden text-xs uppercase tracking-[0.2em] sm:block",
                    step === s.id ? "text-gold font-medium" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1 transition-colors",
                    step > s.id ? "bg-gold/40" : "bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left: step panels */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            {/* ── STEP 1: Services ────────────────────────── */}
            {step === 1 && (
              <div>
                <h2 className="font-serif text-2xl text-primary">
                  {language === "en" ? "Choose your treatments" : "Choisissez vos soins"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {language === "en"
                    ? "Select one or more services."
                    : "Sélectionnez une ou plusieurs prestations."}
                </p>

                <div className="mt-6 space-y-4">
                  {Object.entries(grouped).map(([cat, items]) => (
                    <div key={cat}>
                      <p className="mb-2 text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold">
                        {cat}
                      </p>
                      <div className="space-y-2">
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
                                "flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                                selected
                                  ? "border-gold/50 bg-gold/8 ring-1 ring-gold/20"
                                  : "border-border hover:border-gold/30 hover:bg-muted/40",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "grid h-5 w-5 shrink-0 place-items-center rounded border transition-all",
                                    selected
                                      ? "border-gold bg-gold text-white dark:text-ink"
                                      : "border-border bg-background",
                                  )}
                                >
                                  {selected && <Check className="h-3 w-3" />}
                                </span>
                                <span className="font-serif text-sm text-primary">{s.name}</span>
                              </div>
                              <span className="ml-3 shrink-0 font-serif text-sm text-gold font-bold">
                                {s.price_fcfa.toLocaleString("fr-FR")} F
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceed[1]}
                    className="rounded-full bg-gold px-8 text-white dark:text-ink hover:bg-gold/90 cursor-pointer"
                  >
                    {language === "en" ? "Next" : "Suivant"}{" "}
                    <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Date & Time ──────────────────────── */}
            {step === 2 && (
              <div>
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
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                      Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "mt-2 w-full justify-start rounded-xl border-border text-left font-normal cursor-pointer",
                            !date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-gold" />
                          {date
                            ? format(
                                date,
                                language === "en" ? "EEEE, MMMM d, yyyy" : "EEEE d MMMM yyyy",
                                { locale: currentLocale },
                              )
                            : language === "en"
                              ? "Choose a date"
                              : "Choisir une date"}
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
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                      {language === "en" ? "Time" : "Heure"}
                    </Label>
                    <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTime(t)}
                          className={cn(
                            "flex cursor-pointer items-center justify-center rounded-lg border py-2 text-sm font-medium transition-all",
                            time === t
                              ? "border-gold bg-gold text-white dark:text-ink shadow-sm"
                              : "border-border hover:border-gold/40 hover:bg-muted/50",
                          )}
                        >
                          <Clock className="mr-1 h-3 w-3 opacity-50" />
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="rounded-full text-muted-foreground cursor-pointer"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> {language === "en" ? "Back" : "Retour"}
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceed[2]}
                    className="rounded-full bg-gold px-8 text-white dark:text-ink hover:bg-gold/90 cursor-pointer"
                  >
                    {language === "en" ? "Next" : "Suivant"}{" "}
                    <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Contact ──────────────────────────── */}
            {step === 3 && (
              <form onSubmit={onSubmit}>
                <h2 className="font-serif text-2xl text-primary">
                  {language === "en" ? "Your details" : "Vos coordonnées"}
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
                        className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold"
                      >
                        {language === "en" ? "Full name *" : "Nom complet *"}
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                        placeholder="Amina Bello"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="phone"
                        className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold"
                      >
                        {language === "en" ? "Phone *" : "Téléphone *"}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="6XX XXX XXX"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold"
                    >
                      {language === "en" ? "Email address *" : "Adresse email *"}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="vous@exemple.com"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="notes"
                      className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold"
                    >
                      {language === "en" ? "Notes (optional)" : "Notes (optionnel)"}
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder={
                        language === "en"
                          ? "Details, special requests, allergies..."
                          : "Précisions, demandes particulières, allergies…"
                      }
                      className="rounded-xl resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="rounded-full text-muted-foreground cursor-pointer"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> {language === "en" ? "Back" : "Retour"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !canProceed[3]}
                    className="rounded-full bg-gold px-8 text-white dark:text-ink hover:bg-gold/90 cursor-pointer"
                  >
                    {loading ? (
                      language === "en" ? (
                        "Sending..."
                      ) : (
                        "Envoi…"
                      )
                    ) : (
                      <>
                        {language === "en" ? "Confirm" : "Confirmer"}{" "}
                        <Check className="ml-1.5 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="mt-5 text-center text-xs text-muted-foreground">
                  {language === "en" ? "Or call us at" : "Ou appelez-nous au"}{" "}
                  <a
                    href="tel:+237677216185"
                    className="text-gold underline-offset-2 hover:underline"
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
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold">
                {language === "en" ? "Summary" : "Récapitulatif"}
              </p>

              {selectedServices.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {language === "en" ? "No service selected" : "Aucun soin sélectionné"}
                </p>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {selectedServices.map((s) => (
                      <div key={s.id} className="flex items-start justify-between py-3">
                        <div className="mr-3 min-w-0">
                          <p className="font-serif text-sm leading-snug text-primary">{s.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{s.category}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="font-serif text-sm text-gold font-bold">
                            {s.price_fcfa.toLocaleString("fr-FR")} F
                          </span>
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
                  <div className="mt-1 flex justify-between border-t border-border pt-3 font-serif text-base font-semibold text-primary">
                    <span>{language === "en" ? "Total" : "Total"}</span>
                    <span className="text-gold font-bold">
                      {totalPrice.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Date / time summary */}
            {(date || time) && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="mb-3 text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold">
                  {language === "en" ? "Time Slot" : "Créneau"}
                </p>
                {date && (
                  <p className="font-serif text-sm text-primary">
                    {format(date, language === "en" ? "EEEE, MMMM d, yyyy" : "EEEE d MMMM yyyy", {
                      locale: currentLocale,
                    })}
                  </p>
                )}
                {time && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gold font-semibold">
                    <Clock className="h-3.5 w-3.5" /> {time}
                  </p>
                )}
              </div>
            )}

            {/* Sticky image */}
            <div className="hidden aspect-[3/4] overflow-hidden rounded-2xl lg:block">
              <img src={ASSETS.polkaDotNails} alt="" className="h-full w-full object-cover" />
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createBooking, listServices } from "@/lib/booking.functions";
import { ASSETS } from "@/lib/assets";

const opts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });

const TIME_SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 9; h < 19; h++) for (const m of [0, 15, 30, 45]) {
    out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return out;
})();

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Réserver — NailHouse" },
      { name: "description", content: "Réservez votre rendez-vous NailHouse en ligne — sélection de la prestation, date et créneau." },
      { property: "og:title", content: "Réserver — NailHouse" },
      { property: "og:description", content: "Réservation en ligne chez NailHouse." },
      { property: "og:image", content: ASSETS.burgundyManicure },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: BookingPage,
  errorComponent: ({ error }) => <div className="p-10 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

function BookingPage() {
  const { data: services } = useSuspenseQuery(opts);
  const submit = useServerFn(createBooking);

  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const grouped = services.reduce<Record<string, typeof services>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const service = services.find((s) => s.id === serviceId);
    if (!service || !date || !time) {
      toast.error("Merci de choisir une prestation, une date et un créneau.");
      return;
    }
    const [hh, mm] = time.split(":").map(Number);
    const scheduled = new Date(date);
    scheduled.setHours(hh, mm, 0, 0);
    setLoading(true);
    try {
      await submit({
        data: {
          name,
          phone,
          email,
          service_id: service.id,
          service_name: service.name,
          scheduled_at: scheduled.toISOString(),
          notes: notes || null,
        },
      });
      setDone(true);
      toast.success("Votre demande de rendez-vous a bien été envoyée.");
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue. Veuillez réessayer ou nous appeler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Réservation</p>
          <h1 className="mt-3 font-serif text-4xl text-primary md:text-6xl">Prenez rendez-vous.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Choisissez votre prestation et le créneau qui vous convient. Nous confirmons votre rendez-vous par téléphone.
          </p>

          {done ? (
            <div className="mt-10 rounded-3xl border border-border bg-card p-8">
              <h2 className="font-serif text-2xl text-primary">Merci {name.split(" ")[0]} !</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Votre demande est bien arrivée. Nous vous rappelons rapidement au {phone} pour confirmer votre créneau.
              </p>
              <Button className="mt-6 rounded-full" onClick={() => { setDone(false); setServiceId(""); setDate(undefined); setTime(""); setName(""); setPhone(""); setEmail(""); setNotes(""); }}>
                Nouvelle réservation
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-10 space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="6XX XXX XXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Prestation</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger><SelectValue placeholder="Choisissez une prestation" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(grouped).map(([cat, items]) => (
                      <SelectGroup key={cat}>
                        <SelectLabel>{cat}</SelectLabel>
                        {items.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} — {s.price_fcfa.toLocaleString("fr-FR")} FCFA
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: fr }) : "Choisir une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Créneau</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger><SelectValue placeholder="Choisir un horaire" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {TIME_SLOTS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Précisions, demandes particulières..." />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full rounded-full">
                {loading ? "Envoi…" : "Confirmer la demande"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Vous pouvez aussi nous appeler au <a href="tel:+237677216185" className="underline">677 216 185</a>.
              </p>
            </form>
          )}
        </div>

        <div className="hidden md:block">
          <div className="sticky top-24 aspect-[3/4] overflow-hidden rounded-[2rem] shadow-xl">
            <img src={ASSETS.polkaDotNails} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/booking.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ASSETS } from "@/lib/assets";
import { Instagram, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribe({ data: { email } });
      toast.success("Merci ! Vous êtes inscrite à notre lettre.");
      setEmail("");
    } catch {
      toast.error("Impossible d'enregistrer cet email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={ASSETS.logo} alt="" className="h-10 w-10 rounded-full ring-1 ring-primary-foreground/30" />
            <span className="font-serif text-2xl">NailHouse</span>
          </div>
          <p className="mt-4 max-w-sm font-serif text-2xl italic leading-snug text-primary-foreground/85">
            For the beauty of nails…
          </p>
          <p className="mt-6 max-w-md text-sm text-primary-foreground/70">
            Un atelier confidentiel à Ekoumdoum dédié au soin des mains et des pieds — manucures couture, pédicures soin, prothésie ongulaire.
          </p>
          <form onSubmit={onSubmit} className="mt-8 flex max-w-md gap-2">
            <Input
              type="email"
              required
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-primary-foreground/10 border-primary-foreground/30 placeholder:text-primary-foreground/50 text-primary-foreground"
            />
            <Button type="submit" disabled={loading} variant="secondary" className="rounded-full px-5">
              S'inscrire
            </Button>
          </form>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60">Visiter</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/services" className="hover:underline">Prestations</Link></li>
            <li><Link to="/gallery" className="hover:underline">Galerie</Link></li>
            <li><Link to="/about" className="hover:underline">L'atelier</Link></li>
            <li><Link to="/booking" className="hover:underline">Réserver</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60">Nous trouver</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Ekoumdoum, à côté du Bilbao Lounge — Yaoundé</span>
            </li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> <a href="tel:+237677216185" className="hover:underline">677 216 185</a></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> <a href="tel:+237698905829" className="hover:underline">698 905 829</a></li>
            <li className="flex items-center gap-2"><Instagram className="h-4 w-4" /> @nailhouse</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-primary-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} NailHouse. Tous droits réservés.</p>
          <Link to="/auth" className="hover:text-primary-foreground">Espace admin</Link>
        </div>
      </div>
    </footer>
  );
}

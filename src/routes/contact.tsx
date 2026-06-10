import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — NailHouse" },
      { name: "description", content: "Contactez NailHouse à Ekoumdoum, à côté du Bilbao Lounge. Téléphones : 677 216 185 / 698 905 829." },
      { property: "og:title", content: "Contact — NailHouse" },
      { property: "og:description", content: "Adresse, téléphones et horaires de NailHouse." },
      { property: "og:image", content: ASSETS.salonPedicure },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Contact</p>
          <h1 className="mt-3 font-serif text-4xl text-primary md:text-6xl">Venez nous rencontrer.</h1>
          <p className="mt-4 text-muted-foreground">
            Pour toute question ou réservation rapide, n'hésitez pas à nous appeler. Nous accueillons sur rendez-vous.
          </p>

          <ul className="mt-8 space-y-5 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-accent" />
              <div>
                <p className="font-medium">Ekoumdoum, Yaoundé</p>
                <p className="text-muted-foreground">À côté du Bilbao Lounge</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-accent" />
              <div className="space-y-1">
                <a href="tel:+237677216185" className="block hover:underline">677 216 185</a>
                <a href="tel:+237698905829" className="block hover:underline">698 905 829</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-accent" />
              <div>
                <p>Lundi – Samedi · 9h00 – 19h00</p>
                <p className="text-muted-foreground">Dimanche sur rendez-vous</p>
              </div>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-6"><Link to="/booking">Réserver en ligne</Link></Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <a href="tel:+237677216185">Appeler maintenant</a>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] shadow-xl">
          <img src={ASSETS.salonPedicure} alt="Salon NailHouse" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="overflow-hidden rounded-3xl border border-border">
          <iframe
            title="Carte NailHouse"
            src="https://www.google.com/maps?q=Ekoumdoum%20Yaound%C3%A9&output=embed"
            className="h-[400px] w-full"
            loading="lazy"
          />
        </div>
      </section>
    </SiteLayout>
  );
}

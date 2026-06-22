import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { MessageSquare, Phone, MapPin, Clock, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { ASSETS } from "@/lib/assets";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — NailHouse" },
      {
        name: "description",
        content:
          "Contactez NailHouse à Ekoumdoum, à côté du Bilbao Lounge. Téléphones : 677 216 185 / 698 905 829.",
      },
      { property: "og:title", content: "Contact — NailHouse" },
      { property: "og:description", content: "Adresse, téléphones et horaires de NailHouse." },
      { property: "og:image", content: ASSETS.heroContact },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { language, t } = useI18n();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      toast.error(
        language === "en"
          ? "Please fill in the required fields (First name, Email, Message)"
          : "Veuillez remplir les champs obligatoires (Prénom, E-mail, Message)",
      );
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success(
        language === "en"
          ? "Your message has been sent successfully! We will get back to you as soon as possible."
          : "Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.",
      );
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
      setSubmitting(false);
    }, 1200);
  };

  const FAQ_ITEMS = [
    {
      q: language === "en" ? "How can I book?" : "Comment puis-je réserver ?",
      a:
        language === "en"
          ? "Booking is done directly online in a few clicks via our 'Book' button. You can also call us for last-minute slots."
          : "La réservation s'effectue directement en ligne en quelques clics via notre bouton 'Réserver'. Vous pouvez également nous téléphoner pour des créneaux de dernière minute.",
    },
    {
      q:
        language === "en"
          ? "What payment methods are accepted?"
          : "Quels sont les moyens de paiement acceptés ?",
      a:
        language === "en"
          ? "We accept payments in cash, as well as mobile transfers (Orange Money, MTN Mobile Money) on site at the end of your service."
          : "Nous acceptons les paiements en espèces, ainsi que les transferts mobiles (Orange Money, MTN Mobile Money) sur place à la fin de votre prestation.",
    },
    {
      q:
        language === "en"
          ? "Where exactly is the atelier located?"
          : "Où se trouve précisément l'atelier ?",
      a:
        language === "en"
          ? "NailHouse is located in Ekoumdoum, Yaoundé, right next to the Bilbao Lounge. Secured parking is available."
          : "NailHouse est situé à Ekoumdoum, Yaoundé, juste à côté du Bilbao Lounge. Un parking sécurisé est à votre disposition.",
    },
    {
      q:
        language === "en"
          ? "What is your cancellation policy?"
          : "Quelle est votre politique d'annulation ?",
      a:
        language === "en"
          ? "In case of unexpected events, we thank you for letting us know at least 24 hours in advance to release the slot for another client."
          : "En cas d'imprévu, nous vous remercions de nous prévenir au moins 24 heures à l'avance afin de libérer le créneau pour une autre cliente.",
    },
  ];

  return (
    <SiteLayout>
      {/* ── MAIN EDITORIAL CONTACT SECTION (FINPRO INSPIRED) ── */}
      <section className="bg-zinc-50/50 py-12 md:py-24 border-b border-border/30">
        <div className="mx-auto max-w-6xl px-6 grid gap-12 md:grid-cols-12 items-center">
          {/* Left Column: Editorial & Info Details */}
          <div className="md:col-span-5 space-y-6 text-left">
            <div>
              <span className="text-gold text-[10px] uppercase tracking-[0.24em] font-semibold">
                {language === "en" ? "Keep in touch" : "Restez en contact"}
              </span>
              <h1 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-primary font-bold">
                {language === "en" ? (
                  <>
                    Get in — <br />
                    <em className="text-gold not-italic">touch</em> with us
                  </>
                ) : (
                  <>
                    Prenez — <br />
                    <em className="text-gold not-italic">contact</em> avec nous
                  </>
                )}
              </h1>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {language === "en"
                ? "Whether you have a question about our signature treatments, need help scheduling your session, or want to share your feedback, our team is listening."
                : "Que vous ayez une question sur nos soins d'exception, besoin d'aide pour planifier votre séance, ou souhaitiez nous faire part de vos impressions, notre équipe est à votre écoute."}
            </p>

            <div className="space-y-4 pt-4 border-t border-border/40 text-sm">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                  E-mail
                </p>
                <a
                  href="mailto:hello@nailhouse.com"
                  className="text-base text-primary font-serif font-semibold hover:text-gold transition"
                >
                  hello@nailhouse.com
                </a>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {language === "en" ? "Phone & WhatsApp" : "Téléphone & WhatsApp"}
                </p>
                <div className="space-y-0.5">
                  <a
                    href="tel:+237677216185"
                    className="block text-base text-primary font-serif font-semibold hover:text-gold transition"
                  >
                    +237 677 216 185
                  </a>
                  <a
                    href="tel:+237698905829"
                    className="block text-base text-primary font-serif font-semibold hover:text-gold transition"
                  >
                    +237 698 905 829
                  </a>
                </div>
                <p className="text-[10px] text-muted-foreground/80 mt-1">
                  {language === "en"
                    ? "Available Monday to Saturday, from 9:00 AM to 7:00 PM."
                    : "Disponible du Lundi au Samedi, de 9h00 à 19h00."}
                </p>
              </div>
            </div>

            {/* Direct WhatsApp Pill CTA */}
            <div className="pt-4">
              <a
                href="https://wa.me/237677216185"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-zinc-950 text-white hover:bg-zinc-900 px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold shadow-sm transition duration-300"
              >
                {language === "en" ? "Chat on WhatsApp" : "Discuter sur WhatsApp"}{" "}
                <ArrowRight className="h-3.5 w-3.5 text-gold" />
              </a>
            </div>
          </div>

          {/* Right Column: Premium Contact Form Card */}
          <div className="md:col-span-7">
            <div className="bg-card rounded-[2.5rem] border border-border/60 p-6 md:p-10 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"
                    >
                      {language === "en" ? "First Name" : "Prénom"}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder={language === "en" ? "Your first name" : "Votre prénom"}
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-zinc-100/40 border border-border focus:border-gold focus:ring-1 focus:ring-gold rounded-2xl px-4 py-3 text-sm text-primary transition duration-300 outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"
                    >
                      {language === "en" ? "Last Name" : "Nom"}
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder={language === "en" ? "Your last name" : "Votre nom"}
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-zinc-100/40 border border-border focus:border-gold focus:ring-1 focus:ring-gold rounded-2xl px-4 py-3 text-sm text-primary transition duration-300 outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"
                  >
                    {language === "en" ? "Email Address" : "Adresse E-mail"}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="nom@exemple.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-100/40 border border-border focus:border-gold focus:ring-1 focus:ring-gold rounded-2xl px-4 py-3 text-sm text-primary transition duration-300 outline-none placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"
                  >
                    {language === "en"
                      ? "How can we help you?"
                      : "Comment pouvons-nous vous aider ?"}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder={
                      language === "en"
                        ? "Write your message here..."
                        : "Écrivez votre message ici..."
                    }
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-zinc-100/40 border border-border focus:border-gold focus:ring-1 focus:ring-gold rounded-2xl px-4 py-3 text-sm text-primary transition duration-300 outline-none resize-none placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-ink px-7 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold shadow-sm transition duration-300 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting
                      ? language === "en"
                        ? "Sending..."
                        : "Envoi en cours..."
                      : language === "en"
                        ? "Send the message"
                        : "Envoyer le message"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHYSICAL LOCATION MAP & TIMINGS ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20 grid gap-10 md:grid-cols-12 items-center">
        {/* Timings / Location Details */}
        <div className="md:col-span-4 space-y-6">
          <div>
            <span className="text-gold text-[9px] uppercase tracking-[0.2em] font-semibold">
              {language === "en" ? "NailHouse Atelier" : "Atelier NailHouse"}
            </span>
            <h2 className="mt-2 font-serif text-2xl text-primary md:text-3xl font-semibold">
              {language === "en" ? "Where to find us" : "Où nous trouver"}
            </h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary">Ekoumdoum, Yaoundé</p>
                <p className="text-muted-foreground">
                  {language === "en" ? "Next to Bilbao Lounge" : "À côté du Bilbao Lounge"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary">
                  {language === "en" ? "Monday – Saturday" : "Lundi – Samedi"}
                </p>
                <p className="text-muted-foreground">9h00 – 19h00</p>
                <p className="text-xs text-gold mt-1 font-semibold">
                  {language === "en" ? "Sunday by appointment only" : "Dimanche uniquement sur RDV"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button asChild variant="outline" className="rounded-full px-6">
              <a
                href="https://maps.google.com/?q=Ekoumdoum+Yaoundé"
                target="_blank"
                rel="noopener noreferrer"
              >
                {language === "en" ? "Open in Google Maps" : "Ouvrir dans Google Maps"}
              </a>
            </Button>
          </div>
        </div>

        {/* Embedded Interactive Map Card */}
        <div className="md:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-border/50 shadow-sm">
            <iframe
              title="Carte NailHouse"
              src="https://www.google.com/maps?q=Ekoumdoum%20Yaound%C3%A9&output=embed"
              className="h-[380px] w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ EXPRESS ── */}
      <section className="bg-muted/30 py-16 md:py-24 border-t border-border/40">
        <div className="mx-auto max-w-4xl px-6 md:px-10">
          <div className="mb-12 text-center">
            <p className="text-gold text-[9px] uppercase tracking-widest font-semibold">
              {language === "en" ? "Any questions?" : "Des questions ?"}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-primary font-semibold">FAQ Express</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {FAQ_ITEMS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl bg-card p-6 border border-border/40 shadow-sm"
              >
                <h3 className="font-serif text-base text-primary font-semibold">{faq.q}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

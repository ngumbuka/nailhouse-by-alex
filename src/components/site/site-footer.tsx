import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/booking.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ASSETS } from "@/lib/assets";
import { Instagram, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export function SiteFooter() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { language, t } = useI18n();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribe({ data: { email } });
      toast.success(t("footer_success_newsletter"));
      setEmail("");
    } catch {
      toast.error(
        language === "en"
          ? "Failed to register this email."
          : "Impossible d'enregistrer cet email.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={ASSETS.logo}
              alt=""
              className="h-10 w-10 rounded-full ring-1 ring-primary-foreground/30"
            />
            <span className="font-serif text-2xl">NailHouse</span>
          </div>
          <p className="mt-4 max-w-sm font-serif text-2xl italic leading-snug text-primary-foreground/85">
            {t("footer_quote")}
          </p>
          <p className="mt-6 max-w-md text-sm text-primary-foreground/70">{t("footer_desc")}</p>
          <form onSubmit={onSubmit} className="mt-8 flex max-w-md gap-2">
            <Input
              type="email"
              required
              placeholder={t("footer_email_placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-primary-foreground/10 border-primary-foreground/30 placeholder:text-primary-foreground/50 text-primary-foreground"
            />
            <Button
              type="submit"
              disabled={loading}
              variant="secondary"
              className="rounded-full px-5 cursor-pointer"
            >
              {t("footer_subscribe")}
            </Button>
          </form>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60">
            {t("footer_explore")}
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/services" className="hover:underline">
                {t("nav_services")}
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:underline">
                {t("nav_gallery")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                {t("nav_about")}
              </Link>
            </li>
            <li>
              <Link to="/booking" className="hover:underline">
                {t("btn_book")}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                {t("nav_contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60">
            {t("footer_find_us")}
          </h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t("footer_detailed_address")}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />{" "}
              <a href="tel:+237677216185" className="hover:underline">
                677 216 185
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />{" "}
              <a href="tel:+237698905829" className="hover:underline">
                698 905 829
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4" /> @nailhouse
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-primary-foreground/60 md:flex-row">
          <p>
            © {new Date().getFullYear()} NailHouse. {t("footer_rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

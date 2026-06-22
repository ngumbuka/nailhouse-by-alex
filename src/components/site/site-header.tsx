import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, Languages, UserCheck } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { to: "/", label: t("nav_home") },
    { to: "/services", label: t("nav_services") },
    { to: "/tarifs", label: t("nav_prices") },
    { to: "/gallery", label: t("nav_gallery") },
    { to: "/about", label: t("nav_about") },
    { to: "/contact", label: t("nav_contact") },
  ] as const;

  const LangSwitcher = () => (
    <button
      onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
      className="flex items-center gap-1.5 py-1.5 transition-all cursor-pointer text-xs font-bold uppercase tracking-wider text-gold hover:opacity-80"
      title={language === "fr" ? "Switch to English" : "Passer en Français"}
    >
      <Languages className="h-4.5 w-4.5 text-primary dark:text-zinc-300" />
      <span>{language.toUpperCase()}</span>
    </button>
  );

  const isAdmin = user?.email === "admin@nailhouse.com";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setOpen(false)}>
          <img
            src={ASSETS.logo}
            alt="NailHouse"
            className="h-10 w-10 rounded-full object-cover ring-1 ring-primary/20 shrink-0"
          />
          <div className="leading-tight max-w-[150px] sm:max-w-[180px] md:max-w-[140px] lg:max-w-[180px]">
            <p className="font-serif text-xl text-primary font-semibold">NailHouse</p>
            <p className="text-[7.5px] uppercase tracking-[0.16em] text-muted-foreground whitespace-normal leading-normal mt-0.5">
              {t("footer_tagline")}
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm tracking-wide text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-medium" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              to={isAdmin ? "/admin" : "/portal"}
              className="text-sm font-semibold tracking-wide text-gold transition-colors hover:text-gold/80 flex items-center gap-1.5"
              activeProps={{ className: "text-gold font-bold underline underline-offset-4" }}
            >
              <UserCheck className="h-4 w-4" />
              {isAdmin ? "Admin" : language === "en" ? "My Space" : "Mon Espace"}
            </Link>
          )}
          <LangSwitcher />
          <Button asChild size="sm" className="rounded-full px-5">
            <Link to="/booking">{t("btn_book")}</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <LangSwitcher />
          <button
            aria-label="Menu"
            className="rounded-full border border-border/70 p-2"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-border/60 transition-all",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm hover:bg-muted"
              activeProps={{ className: "bg-muted text-primary font-medium" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              to={isAdmin ? "/admin" : "/portal"}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-gold font-semibold hover:bg-muted"
              activeProps={{ className: "bg-muted text-gold font-bold" }}
            >
              {isAdmin ? "Admin" : language === "en" ? "My Space" : "Mon Espace"}
            </Link>
          )}
          <Button asChild className="mt-2 rounded-full" onClick={() => setOpen(false)}>
            <Link to="/booking">{t("btn_book_now")}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

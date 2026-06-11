import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/services", label: "Prestations" },
  { to: "/tarifs", label: "Grille tarifaire" },
  { to: "/gallery", label: "Galerie" },
  { to: "/about", label: "L'atelier" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={ASSETS.logo} alt="NailHouse" className="h-10 w-10 rounded-full object-cover ring-1 ring-primary/20" />
          <div className="leading-tight">
            <p className="font-serif text-xl text-primary">NailHouse</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">For the beauty of nails</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
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
          <Button asChild size="sm" className="rounded-full px-5">
            <Link to="/booking">Réserver</Link>
          </Button>
        </nav>
        <button
          aria-label="Menu"
          className="md:hidden rounded-full border border-border/70 p-2"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div className={cn("md:hidden overflow-hidden border-t border-border/60 transition-all", open ? "max-h-96" : "max-h-0")}>
        <nav className="flex flex-col gap-1 px-5 py-3">
          {NAV.map((item) => (
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
          <Button asChild className="mt-2 rounded-full" onClick={() => setOpen(false)}>
            <Link to="/booking">Réserver un rendez-vous</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

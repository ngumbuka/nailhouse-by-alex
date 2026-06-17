import { Link } from "@tanstack/react-router";
import { ChevronRight, Clock } from "lucide-react";
import { CATEGORY_BY_SLUG, SLUG_BY_CATEGORY, slugifyService } from "@/lib/service-categories";

export type ServiceCardItem = {
  id: string;
  name: string;
  category: string;
  price_fcfa: number;
};

type Props = {
  service: ServiceCardItem;
  /** "flat" alternates per-service image fallback for visual variety */
  variant?: "hero" | "flat";
  className?: string;
};

export function ServiceCard({ service, variant = "hero", className = "" }: Props) {
  const slug = SLUG_BY_CATEGORY[service.category];
  const info = slug ? CATEGORY_BY_SLUG[slug] : undefined;
  if (!slug || !info) return null;
  const img = variant === "flat" ? info.flat : info.image;
  const serviceSlug = slugifyService(service.name);

  return (
    <Link
      to="/services/$slug/$service"
      params={{ slug, service: serviceSlug }}
      className={`group flex h-full flex-col overflow-hidden border border-gold/15 bg-card transition hover:border-gold hover:shadow-lg ${className}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={img}
          alt={service.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
        />
        <div className="pointer-events-none absolute inset-2 border border-gold/25" />
        <span className="absolute left-3 top-3 bg-ink/80 px-2.5 py-1 text-[9px] uppercase tracking-[0.25em] text-gold backdrop-blur-sm">
          {info.title}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div>
          <h3 className="font-serif text-lg leading-tight text-primary md:text-xl">
            {service.name}
          </h3>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <Clock className="h-3 w-3" /> {info.duration}
          </p>
        </div>
        <div className="flex items-end justify-between">
          <p className="font-serif text-2xl text-gold leading-none">
            {service.price_fcfa.toLocaleString("fr-FR")}
            <span className="ml-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              F
            </span>
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-gold opacity-0 transition group-hover:opacity-100">
            Détail <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

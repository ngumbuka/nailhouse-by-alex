import { Link, useNavigate } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/service-categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortKey = "popular" | "price-asc" | "price-desc" | "duration";

type Props = {
  active?: string;
  sort: SortKey;
  count: number;
};

export function CatalogFilters({ active, sort, count }: Props) {
  const navigate = useNavigate({ from: "/services" });

  return (
    <div className="sticky top-[64px] z-30 -mx-5 border-y border-gold/15 bg-background/95 px-5 py-4 backdrop-blur md:top-[72px]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Filter chips — horizontal scroll on mobile */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip to={{ to: "/services", search: {} }} active={!active} label="Tout" />
          {CATEGORIES.map((c) => (
            <Chip
              key={c.slug}
              to={{ to: "/services", search: { cat: c.slug } }}
              active={active === c.slug}
              label={c.title}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {count} prestation{count > 1 ? "s" : ""}
          </p>
          <Select
            value={sort}
            onValueChange={(v) =>
              navigate({
                search: (prev) => ({ ...prev, sort: v === "popular" ? undefined : (v as SortKey) }),
              })
            }
          >
            <SelectTrigger className="h-9 w-[160px] rounded-none border-gold/30 text-xs uppercase tracking-[0.2em]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Populaire</SelectItem>
              <SelectItem value="price-asc">Prix ↑</SelectItem>
              <SelectItem value="price-desc">Prix ↓</SelectItem>
              <SelectItem value="duration">Durée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function Chip({
  to,
  active,
  label,
}: {
  to: { to: "/services"; search: { cat?: string } };
  active: boolean;
  label: string;
}) {
  return (
    <Link
      {...to}
      className={`shrink-0 whitespace-nowrap border px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition ${
        active
          ? "border-gold bg-gold text-ink"
          : "border-gold/25 text-muted-foreground hover:border-gold/60 hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}

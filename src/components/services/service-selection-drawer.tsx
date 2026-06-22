import { useQuery, queryOptions } from "@tanstack/react-query";
import { listServices } from "@/lib/booking.functions";
import { useServiceSelection } from "@/hooks/use-service-selection";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const servicesOpts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });

export function ServiceSelectionDrawer() {
  const { selectedIds, removeService, clearSelection } = useServiceSelection();
  const { data: services = [] } = useQuery(servicesOpts);

  if (selectedIds.length === 0) return null;

  const selectedServices = services.filter((s) => selectedIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price_fcfa, 0);
  const bookingServicesParam = selectedIds.join(",");

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-auto w-full max-w-5xl px-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-gold/40 bg-ink/95 px-5 py-3 text-primary-foreground shadow-2xl backdrop-blur-md md:px-7 rounded-sm">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold hover:underline cursor-pointer focus:outline-none"
              >
                <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold border border-gold/30">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-white dark:text-ink">
                    {selectedServices.length}
                  </span>
                </span>
                <span className="hidden sm:inline">Détails</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-ink text-primary-foreground border-l border-gold/25 flex flex-col justify-between h-full w-full sm:max-w-md p-6"
            >
              <div>
                <SheetHeader className="border-b border-gold/15 pb-5">
                  <SheetTitle className="font-serif text-2xl text-primary-foreground flex items-center gap-2.5">
                    <CalendarRange className="h-5 w-5 text-gold" />
                    Ma Sélection
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-gold/20">
                  {selectedServices.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start justify-between gap-4 border-b border-gold/10 pb-4"
                    >
                      <div>
                        <h4 className="font-serif text-base text-primary-foreground">{s.name}</h4>
                        <p className="text-[11px] uppercase tracking-wider text-gold/80 mt-1">
                          {s.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-sm text-gold">
                          {s.price_fcfa.toLocaleString("fr-FR")} F
                        </span>
                        <button
                          onClick={() => removeService(s.id)}
                          className="text-primary-foreground/60 hover:text-destructive transition cursor-pointer"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gold/15 pt-6 bg-ink">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/60">
                      Total Estimé
                    </span>
                    <p className="font-serif text-3xl text-gold mt-1">
                      {totalPrice.toLocaleString("fr-FR")}
                      <span className="text-xs uppercase tracking-widest ml-1 text-primary-foreground/60">
                        F
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="text-xs uppercase tracking-widest text-primary-foreground/40 hover:text-gold transition cursor-pointer"
                  >
                    Vider
                  </button>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 font-medium"
                >
                  <Link to="/booking" search={{ services: bookingServicesParam }}>
                    Continuer la réservation
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="min-w-0">
            <p className="font-serif text-base md:text-lg text-primary-foreground">
              Ma Sélection ({selectedServices.length} soin{selectedServices.length > 1 ? "s" : ""})
            </p>
            <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60">
              Total · <span className="text-gold">{totalPrice.toLocaleString("fr-FR")} FCFA</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="rounded-full bg-gold px-7 text-white dark:text-ink hover:bg-gold/90"
          >
            <Link to="/booking" search={{ services: bookingServicesParam }}>
              Réserver la sélection
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

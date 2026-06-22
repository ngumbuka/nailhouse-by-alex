import { useQuery, queryOptions } from "@tanstack/react-query";
import { listServices } from "@/lib/booking.functions";
import { useServiceSelection } from "@/hooks/use-service-selection";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/hooks/use-i18n";

const servicesOpts = queryOptions({ queryKey: ["services"], queryFn: () => listServices() });

export function ServiceSelectionDrawer() {
  const { selectedIds, removeService, clearSelection } = useServiceSelection();
  const { data: services = [] } = useQuery(servicesOpts);
  const { language, t, translateService } = useI18n();

  if (selectedIds.length === 0) return null;

  const rawSelectedServices = services.filter((s) => selectedIds.includes(s.id));
  const selectedServices = rawSelectedServices.map((s) => translateService(s));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price_fcfa, 0);
  const bookingServicesParam = selectedIds.join(",");

  const careWord =
    language === "en"
      ? `care${selectedServices.length > 1 ? "s" : ""}`
      : `soin${selectedServices.length > 1 ? "s" : ""}`;

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 mx-auto w-full max-w-4xl px-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-4 border border-gold/30 bg-ink/90 px-6 py-3.5 text-primary-foreground shadow-2xl backdrop-blur-md md:px-8 rounded-full">
        <div className="flex items-center gap-4 min-w-0">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] font-medium text-gold hover:text-gold/80 transition-colors cursor-pointer focus:outline-none shrink-0"
              >
                <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-all">
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-white dark:text-ink shadow-sm">
                    {selectedServices.length}
                  </span>
                </span>
                <span className="hidden sm:inline">{t("cart_details")}</span>
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
                    {t("cart_title")}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-gold/20">
                  {selectedServices.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start justify-between gap-4 border-b border-gold/10 pb-4"
                    >
                      <div className="min-w-0">
                        <h4 className="font-serif text-base text-primary-foreground truncate">
                          {s.name}
                        </h4>
                        <p className="text-[10px] uppercase tracking-wider text-gold/80 mt-1 truncate">
                          {s.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-serif text-sm text-gold font-bold">
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
                    <span className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/60 font-semibold">
                      {t("cart_total_estimated")}
                    </span>
                    <p className="font-serif text-3xl text-gold mt-1 font-bold">
                      {totalPrice.toLocaleString("fr-FR")}
                      <span className="text-xs uppercase tracking-widest ml-1 text-primary-foreground/60 font-serif">
                        F
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="text-xs uppercase tracking-widest text-primary-foreground/40 hover:text-gold transition cursor-pointer font-bold"
                  >
                    {t("cart_clear")}
                  </button>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 font-semibold shadow-lg shadow-gold/10"
                >
                  <Link to="/booking" search={{ services: bookingServicesParam }}>
                    {t("cart_continue")}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="min-w-0">
            <p className="font-serif text-sm md:text-base text-primary-foreground truncate">
              {t("cart_title")} ({selectedServices.length} {careWord})
            </p>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-primary-foreground/60 mt-0.5">
              {t("cart_total_prefix")} ·{" "}
              <span className="text-gold font-bold">{totalPrice.toLocaleString("fr-FR")} FCFA</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            asChild
            className="rounded-full bg-gold px-5 md:px-7 text-xs md:text-sm text-white dark:text-ink hover:bg-gold/90 transition-all font-semibold shadow-lg shadow-gold/10"
          >
            <Link to="/booking" search={{ services: bookingServicesParam }}>
              {t("cart_book_selection")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

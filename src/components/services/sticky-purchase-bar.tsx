import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useServiceSelection } from "@/hooks/use-service-selection";
import { ShareButton } from "@/components/services/share-button";
import { useI18n } from "@/hooks/use-i18n";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  serviceId: string;
  serviceName: string;
  priceFcfa: number;
  duration: string;
  path: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export function StickyPurchaseBar({
  serviceId,
  serviceName,
  priceFcfa,
  duration,
  path,
  isFavorite = false,
  onToggleFavorite,
}: Props) {
  const { language, t } = useI18n();
  const [visible, setVisible] = useState(false);
  const { selectedIds } = useServiceSelection();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (selectedIds.length > 0) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {visible && (
        <div className="pointer-events-auto border-t border-gold/30 bg-ink/95 text-primary-foreground shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8 md:py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base md:text-lg">{serviceName}</p>
              <p className="truncate text-xs uppercase tracking-[0.25em] text-primary-foreground/60">
                {duration} ·{" "}
                <span className="text-gold">{priceFcfa.toLocaleString("fr-FR")} F</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleFavorite}
                className={cn(
                  "border-gold/35 text-gold hover:bg-gold/10 rounded-full h-9 w-9 shrink-0",
                  isFavorite && "bg-gold/15 border-gold text-gold",
                )}
                aria-label="Toggle Favorite"
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-gold")} />
              </Button>
              <ShareButton
                title={serviceName}
                text={t("share_text", { name: serviceName, category: "" })}
                path={path}
                variant="outline"
                size="icon"
                className="border-gold/35 text-gold hover:bg-gold/10 rounded-full h-9 w-9 shrink-0"
              />
              <Button
                asChild
                className="shrink-0 rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 md:px-8 cursor-pointer"
              >
                <Link to="/booking" search={{ service: serviceId }}>
                  {t("btn_book")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

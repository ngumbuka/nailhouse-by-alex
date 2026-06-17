import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type Props = {
  serviceId: string;
  serviceName: string;
  priceFcfa: number;
  duration: string;
};

export function StickyPurchaseBar({ serviceId, serviceName, priceFcfa, duration }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="pointer-events-auto border-t border-gold/30 bg-ink/95 text-primary-foreground shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8 md:py-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-base md:text-lg">{serviceName}</p>
            <p className="truncate text-[10px] uppercase tracking-[0.25em] text-primary-foreground/60">
              {duration} ·{" "}
              <span className="text-gold">{priceFcfa.toLocaleString("fr-FR")} F</span>
            </p>
          </div>
          <Button
            asChild
            className="shrink-0 rounded-full bg-gold px-6 text-ink hover:bg-gold/90 md:px-8"
          >
            <Link to="/booking" search={{ service: serviceId }}>
              Réserver
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

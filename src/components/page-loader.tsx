import { ASSETS } from "@/lib/assets";
import { resolveAssetUrl } from "@/lib/resolver";

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-7">
        <div className="relative h-20 w-20">
          <img
            src={resolveAssetUrl(ASSETS.logo)}
            alt=""
            aria-hidden="true"
            className="absolute inset-2 h-16 w-16 rounded-full object-cover opacity-90 ring-1 ring-gold/30"
          />
          <div className="absolute inset-0 rounded-full border border-gold/15" />
          <div className="absolute inset-0 rounded-full border border-transparent border-t-gold animate-spin [animation-duration:1.6s]" />
          <div className="absolute -inset-1 rounded-full border border-transparent border-b-primary/60 animate-spin [animation-duration:2.4s] [animation-direction:reverse]" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-serif text-xl tracking-[0.08em] text-primary">NailHouse</p>
          <span className="block h-px w-10 bg-gold/60" />
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            Pour la beauté des ongles
          </p>
        </div>
      </div>
    </div>
  );
}

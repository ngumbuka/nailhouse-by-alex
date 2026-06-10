import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/site-layout";
import { listGalleryImages } from "@/lib/booking.functions";
import { ASSETS } from "@/lib/assets";

const opts = queryOptions({ queryKey: ["gallery"], queryFn: () => listGalleryImages() });

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Galerie — NailHouse" },
      { name: "description", content: "Plongez dans l'univers visuel de NailHouse : créations, atelier et ambiance." },
      { property: "og:title", content: "Galerie — NailHouse" },
      { property: "og:description", content: "L'univers visuel de NailHouse." },
      { property: "og:image", content: ASSETS.salonPedicure },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: GalleryPage,
  errorComponent: ({ error }) => <div className="p-10 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

function GalleryPage() {
  const { data } = useSuspenseQuery(opts);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Galerie</p>
        <h1 className="mt-3 font-serif text-4xl text-primary md:text-6xl">Notre univers en images</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Créations couture, ambiance, atelier — une promenade visuelle dans NailHouse.
        </p>
        <div className="mt-12 columns-1 gap-4 sm:columns-2 md:columns-3 [&>*]:mb-4">
          {data.map((img) => (
            <figure key={img.id} className="break-inside-avoid overflow-hidden rounded-2xl">
              <img src={img.url} alt={img.caption ?? ""} className="w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
              {img.caption ? <figcaption className="px-1 pt-2 text-xs text-muted-foreground">{img.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { resolveAssetUrl } from "@/lib/resolver";
import { Edit, Trash2, Clock, Globe } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CATEGORIES } from "@/lib/service-categories";

interface ServicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  service: {
    id: string;
    name: string;
    name_en?: string | null;
    category: string;
    price_fcfa: number;
    duration_mins?: number | null;
    description: string;
    description_en?: string | null;
    image_url?: string | null;
    is_active?: boolean;
    is_addon?: boolean;
    seasonal_price_fcfa?: number | null;
  } | null;
  onEdit: (service: {
    id: string;
    name: string;
    name_en?: string | null;
    category: string;
    price_fcfa: number;
    duration_mins?: number | null;
    description: string;
    description_en?: string | null;
    image_url?: string | null;
    is_active?: boolean;
    is_addon?: boolean;
    seasonal_price_fcfa?: number | null;
  }) => void;
  onDelete: (id: string) => void;
}

export function ServicePreviewModal({
  open,
  onClose,
  service,
  onEdit,
  onDelete,
}: ServicePreviewModalProps) {
  if (!service) return null;

  const category = CATEGORIES.find((c) => c.category === service.category);
  const displayImage = service.image_url || category?.image;
  const displayDuration = service.duration_mins || category?.duration || 45;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-[2rem] overflow-hidden bg-background">
        {/* Header Image Area */}
        <div className="relative h-64 w-full bg-muted">
          {displayImage ? (
            <img
              src={resolveAssetUrl(displayImage)}
              alt={service.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-serif">
              Aucune image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6">
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold bg-background/50 backdrop-blur-md px-2 py-1 rounded-md">
              {service.category}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-primary mt-3 leading-tight">
              {service.name}
            </h2>
            <div className="flex items-center gap-4 mt-3 text-sm font-medium">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {displayDuration} min
              </span>
              <span className="text-primary font-bold">
                {service.price_fcfa.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Attributes */}
          <div className="flex flex-wrap gap-2">
            {service.is_active ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                Actif (Visible)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold uppercase tracking-wider">
                Inactif (Caché)
              </span>
            )}
            {service.is_addon && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-wider">
                Supplément
              </span>
            )}
            {service.seasonal_price_fcfa && (
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wider">
                Promo: {service.seasonal_price_fcfa.toLocaleString("fr-FR")} FCFA
              </span>
            )}
          </div>

          {/* Bilingual Description */}
          <div className="rounded-2xl border border-border overflow-hidden bg-muted/10">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <Globe className="h-4 w-4 text-gold" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Contenu de la page publique
              </span>
            </div>

            <Tabs defaultValue="fr" className="p-4">
              <TabsList className="mb-4">
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>

              <TabsContent value="fr" className="space-y-4 text-sm leading-relaxed mt-0">
                <div
                  className="prose prose-sm prose-zinc dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      service.description ||
                      (category?.intro
                        ? `<p>${category.intro}</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">À propos de la catégorie</p>`
                        : "<p class='italic text-muted-foreground'>Aucune description française</p>"),
                  }}
                />
              </TabsContent>

              <TabsContent value="en" className="space-y-4 text-sm leading-relaxed mt-0">
                <div className="font-serif text-xl mb-3 text-primary">
                  {service.name_en || "<No English Name>"}
                </div>
                <div
                  className="prose prose-sm prose-zinc dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      service.description_en ||
                      (category?.intro
                        ? `<p class='italic text-muted-foreground'>Defaulting to French category intro:</p><p>${category.intro}</p>`
                        : "<p class='italic text-muted-foreground'>No English description</p>"),
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              variant="outline"
              className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              onClick={() => {
                if (confirm(`Voulez-vous vraiment supprimer "${service.name}" ?`)) {
                  onDelete(service.id);
                  onClose();
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
            <Button
              variant="gold"
              className="rounded-full"
              onClick={() => {
                onClose();
                onEdit(service);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

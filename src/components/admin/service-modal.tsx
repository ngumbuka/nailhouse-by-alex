// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe } from "lucide-react";
import { CATEGORIES as SYSTEM_CATEGORIES } from "@/lib/service-categories";
import { resolveAssetUrl } from "@/lib/resolver";

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Record<string, unknown> | null;
  isPending: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
}

export function ServiceModal({ open, onClose, initial, isPending, onSubmit }: ServiceModalProps) {
  const isEdit = !!initial;
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [category, setCategory] = useState(SYSTEM_CATEGORIES[0]?.category || "");
  const [price, setPrice] = useState(15000);
  const [duration, setDuration] = useState(45);
  const [desc, setDesc] = useState("");
  const [descEn, setDescEn] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<string>("");
  const [mediaTab, setMediaTab] = useState("url");
  const [seasonalPrice, setSeasonalPrice] = useState<number | "">("");
  const [seasonalStart, setSeasonalStart] = useState("");
  const [seasonalEnd, setSeasonalEnd] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isAddon, setIsAddon] = useState(false);
  const [sort, setSort] = useState("0");

  useEffect(() => {
    console.log("ServiceModal initial prop:", initial);
    if (initial) {
      setName(initial.name ?? "");
      setNameEn(initial.name_en ?? "");
      setCategory(initial.category ?? (SYSTEM_CATEGORIES[0]?.category || ""));
      setPrice(initial.price_fcfa ?? 15000);
      setDuration(initial.duration_mins ?? 45);
      setDesc(initial.description ?? "");
      setDescEn(initial.description_en ?? "");
      setSlug(initial.slug ?? "");
      setImageUrl(initial.image_url ?? "");
      setSeasonalPrice(initial.seasonal_price_fcfa ?? "");
      const safeDate = (dateStr: unknown) => {
        if (!dateStr || typeof dateStr !== "string") return "";
        try {
          return new Date(dateStr).toISOString().slice(0, 16);
        } catch {
          return "";
        }
      };

      setSeasonalStart(safeDate(initial.seasonal_price_start));
      setSeasonalEnd(safeDate(initial.seasonal_price_end));
      setIsActive(initial.is_active ?? true);
      setIsAddon(initial.is_addon ?? false);
      setSort(initial.sort?.toString() ?? "0");
    } else {
      setName("");
      setNameEn("");
      setCategory(SYSTEM_CATEGORIES[0]?.category || "");
      setPrice(15000);
      setDuration(45);
      setDesc("");
      setDescEn("");
      setSlug("");
      setImageUrl("");
      setImageFile("");
      setSeasonalPrice("");
      setSeasonalStart("");
      setSeasonalEnd("");
      setIsActive(true);
      setIsAddon(false);
      setSort("0");
    }
  }, [initial, open]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageFile(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalImage = mediaTab === "upload" ? imageFile : imageUrl;
    const payload = {
      name,
      name_en: nameEn || undefined,
      category,
      price_fcfa: Number(price),
      duration_mins: Number(duration),
      description: desc,
      description_en: descEn || undefined,
      slug,
      image_url: finalImage || null,
      seasonal_price_fcfa: seasonalPrice !== "" ? Number(seasonalPrice) : null,
      seasonal_price_start: seasonalStart ? new Date(seasonalStart).toISOString() : null,
      seasonal_price_end: seasonalEnd ? new Date(seasonalEnd).toISOString() : null,
      is_active: isActive,
      is_addon: isAddon,
      sort: Number(sort),
    };
    if (isEdit) onSubmit({ id: initial.id, ...payload });
    else onSubmit(payload);
  }

  const preview = mediaTab === "upload" ? imageFile : imageUrl;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-primary">
            {isEdit ? "Modifier la prestation" : "Ajouter une prestation"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Bilingual content */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border">
              <Globe className="h-4 w-4 text-gold" />
              <span className="text-xs font-bold uppercase tracking-wider text-gold">
                Contenu bilingue
              </span>
            </div>
            <Tabs defaultValue="fr" className="p-4">
              <TabsList className="mb-4 bg-muted/40 rounded-lg">
                <TabsTrigger
                  value="fr"
                  className="data-[state=active]:bg-background rounded-md text-sm"
                >
                  🇫🇷 Français
                </TabsTrigger>
                <TabsTrigger
                  value="en"
                  className="data-[state=active]:bg-background rounded-md text-sm"
                >
                  🇬🇧 English
                </TabsTrigger>
              </TabsList>
              <TabsContent value="fr" className="space-y-3 mt-0">
                <div className="space-y-1.5">
                  <Label>Nom du soin (FR) *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ex: Manucure Signature"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (FR) *</Label>
                  <RichTextEditor
                    key={`desc-${initial?.id ?? "new"}`}
                    value={desc}
                    onChange={setDesc}
                    placeholder="Description complète du soin…"
                  />
                </div>
              </TabsContent>
              <TabsContent value="en" className="space-y-3 mt-0">
                <div className="space-y-1.5">
                  <Label>Service Name (EN)</Label>
                  <Input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Signature Manicure"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (EN)</Label>
                  <RichTextEditor
                    key={`desc-en-${initial?.id ?? "new"}`}
                    value={descEn}
                    onChange={setDescEn}
                    placeholder="Full service description..."
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Core fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Catégorie *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_CATEGORIES.map((c) => (
                    <SelectItem key={c.category} value={c.category}>
                      {c.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Identifiant slug (URL) *</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex: manucure-signature"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tarif (FCFA) *</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Durée (minutes) *</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
                min={1}
              />
            </div>
          </div>

          {/* Media upload */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/30 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Image du soin
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={mediaTab === "url" ? "default" : "outline"}
                  className="rounded-full text-xs"
                  onClick={() => setMediaTab("url")}
                >
                  Lien URL
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mediaTab === "upload" ? "default" : "outline"}
                  className="rounded-full text-xs"
                  onClick={() => setMediaTab("upload")}
                >
                  Télécharger
                </Button>
              </div>
              {mediaTab === "url" ? (
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://…"
                />
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-sm text-muted-foreground"
                />
              )}
              {preview && (
                <img
                  src={resolveAssetUrl(preview)}
                  alt="preview"
                  className="h-24 w-24 rounded-lg object-cover border border-border"
                />
              )}
            </div>
          </div>

          {/* Seasonal pricing */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">
              Tarification saisonnière (optionnel)
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Tarif promo (FCFA)</Label>
                <Input
                  type="number"
                  value={seasonalPrice}
                  onChange={(e) =>
                    setSeasonalPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Ex: 12000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Début</Label>
                <Input
                  type="datetime-local"
                  value={seasonalStart}
                  onChange={(e) => setSeasonalStart(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fin</Label>
                <Input
                  type="datetime-local"
                  value={seasonalEnd}
                  onChange={(e) => setSeasonalEnd(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Advanced */}
          <div className="grid gap-3 sm:grid-cols-3 items-center">
            <div className="space-y-1.5">
              <Label>Ordre d'affichage</Label>
              <Input type="number" value={sort} onChange={(e) => setSort(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-5">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-700"
              />
              <span className="text-sm font-medium">Actif (visible)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer pt-5">
              <input
                type="checkbox"
                checked={isAddon}
                onChange={(e) => setIsAddon(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-700"
              />
              <span className="text-sm font-medium">Supplément (add-on)</span>
            </label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
              Annuler
            </Button>
            <Button type="submit" disabled={isPending} variant="gold" className="rounded-full">
              {isPending ? "Enregistrement…" : isEdit ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

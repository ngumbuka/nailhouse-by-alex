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
import { Globe, Tag } from "lucide-react";

interface Service {
  id: string;
  name: string;
}

interface PromoModalProps {
  open: boolean;
  onClose: () => void;
  services: Service[];
  isPending: boolean;
  onSubmit: (data: {
    code: string;
    discount_percent: number;
    description: string;
    description_en?: string;
    active: boolean;
    service_id: string | null;
    start_date: string | null;
    end_date: string | null;
  }) => void;
}

export function PromoModal({ open, onClose, services, isPending, onSubmit }: PromoModalProps) {
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState(10);
  const [desc, setDesc] = useState("");
  const [descEn, setDescEn] = useState("");
  const [active, setActive] = useState(true);
  const [serviceId, setServiceId] = useState("all");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    if (!open) {
      setCode("");
      setPercent(10);
      setDesc("");
      setDescEn("");
      setActive(true);
      setServiceId("all");
      setStart("");
      setEnd("");
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      code: code.trim().toUpperCase(),
      discount_percent: Number(percent),
      description: desc.trim(),
      description_en: descEn.trim() || undefined,
      active,
      service_id: serviceId === "all" ? null : serviceId,
      start_date: start ? new Date(start).toISOString() : null,
      end_date: end ? new Date(end).toISOString() : null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-primary flex items-center gap-2">
            <Tag className="h-5 w-5 text-gold" />
            Créer un code promo
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="pm-code">Code de réduction *</Label>
            <Input
              id="pm-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: SUMMER20"
              required
              className="uppercase tracking-wider font-semibold"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pm-pct">Réduction (%) *</Label>
            <Input
              id="pm-pct"
              type="number"
              min={1}
              max={100}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              required
            />
          </div>

          {/* Bilingual description */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border">
              <Globe className="h-4 w-4 text-gold" />
              <span className="text-xs font-bold uppercase tracking-wider text-gold">
                Description bilingue
              </span>
            </div>
            <Tabs defaultValue="fr" className="p-3">
              <TabsList className="mb-3 bg-muted/40 rounded-lg">
                <TabsTrigger value="fr" className="text-sm">
                  🇫🇷 Français
                </TabsTrigger>
                <TabsTrigger value="en" className="text-sm">
                  🇬🇧 English
                </TabsTrigger>
              </TabsList>
              <TabsContent value="fr" className="mt-0">
                <RichTextEditor
                  value={desc}
                  onChange={setDesc}
                  placeholder="Ex: 20% de rabais sur toutes les prestations"
                />
              </TabsContent>
              <TabsContent value="en" className="mt-0">
                <RichTextEditor
                  value={descEn}
                  onChange={setDescEn}
                  placeholder="e.g. 20% off all services"
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-1.5">
            <Label>Prestation ciblée</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les prestations</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 grid-cols-2">
            <div className="space-y-1.5">
              <Label>Début de validité</Label>
              <Input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fin de validité</Label>
              <Input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded accent-amber-700"
            />
            <span className="text-sm font-medium">Code actif immédiatement</span>
          </label>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
              Annuler
            </Button>
            <Button type="submit" disabled={isPending} variant="gold" className="rounded-full">
              {isPending ? "Création…" : "Générer le code"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

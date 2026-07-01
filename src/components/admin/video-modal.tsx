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
import { Video } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES as SYSTEM_CATEGORIES } from "@/lib/service-categories";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Record<string, unknown> | null;
  isPending: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
}

export function VideoModal({ open, onClose, initial, isPending, onSubmit }: VideoModalProps) {
  const isEdit = !!initial;
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [desc, setDesc] = useState("");
  const [descEn, setDescEn] = useState("");
  const [category, setCategory] = useState(SYSTEM_CATEGORIES[0]?.category || "");
  const [active, setActive] = useState(true);
  const [sort, setSort] = useState("0");

  useEffect(() => {
    if (initial) {
      setUrl(initial.url ?? "");
      setTitle(initial.title ?? "");
      setTitleEn(initial.title_en ?? "");
      setDesc(initial.description ?? "");
      setDescEn(initial.description_en ?? "");
      setCategory(initial.category ?? (SYSTEM_CATEGORIES[0]?.category || ""));
      setActive(initial.active ?? true);
      setSort(String(initial.sort ?? 0));
    } else {
      setUrl("");
      setTitle("");
      setTitleEn("");
      setDesc("");
      setDescEn("");
      setCategory(SYSTEM_CATEGORIES[0]?.category || "");
      setActive(true);
      setSort("0");
    }
  }, [initial, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      url,
      title,
      description: desc,
      category,
      active,
      sort: parseInt(sort) || 0,
    };
    if (isEdit) onSubmit({ id: initial.id, ...payload });
    else onSubmit(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-primary flex items-center gap-2">
            <Video className="h-5 w-5 text-gold" />
            {isEdit ? "Modifier la vidéo" : "Ajouter une vidéo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>URL de la vidéo (MP4 / WebM) *</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…mp4"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Collez un lien direct vers un fichier vidéo ou une page HTML de lecture.
            </p>
          </div>

          {/* FR/EN title and description */}
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/30">
              <span className="text-xs font-bold uppercase tracking-wider text-gold">
                🇫🇷 Français
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Titre (FR) *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Nom de la réalisation"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description (FR)</Label>
                <RichTextEditor value={desc} onChange={setDesc} placeholder="Brève description…" />
              </div>
            </div>
            <div className="px-4 py-2.5 bg-muted/30">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                🇬🇧 English
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Title (EN)</Label>
                <Input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Service name in English"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description (EN)</Label>
                <RichTextEditor
                  value={descEn}
                  onChange={setDescEn}
                  placeholder="Short description…"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 items-end">
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
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
              <Label>Ordre (tri)</Label>
              <Input type="number" value={sort} onChange={(e) => setSort(e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded accent-amber-700"
            />
            <span className="text-sm font-medium">Vidéo visible sur le site</span>
          </label>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
              Annuler
            </Button>
            <Button type="submit" disabled={isPending} className="rounded-full" variant="gold">
              {isPending ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
  isPending: boolean;
  onSubmit: (data: { url: string; caption?: string }) => void;
}

export function GalleryModal({ open, onClose, isPending, onSubmit }: GalleryModalProps) {
  const [mediaTab, setMediaTab] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [fileData, setFileData] = useState("");
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (!open) {
      setUrl("");
      setFileData("");
      setCaption("");
      setMediaTab("url");
    }
  }, [open]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFileData(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalUrl = mediaTab === "upload" ? fileData : url;
    if (!finalUrl) return;
    onSubmit({ url: finalUrl, caption: caption || undefined });
  }

  const preview = mediaTab === "upload" ? fileData : url;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-primary flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-gold" />
            Ajouter à la galerie
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={mediaTab === "url" ? "default" : "outline"}
              className="rounded-full text-xs flex-1"
              onClick={() => setMediaTab("url")}
            >
              Lien URL
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mediaTab === "upload" ? "default" : "outline"}
              className="rounded-full text-xs flex-1"
              onClick={() => setMediaTab("upload")}
            >
              Télécharger
            </Button>
          </div>

          {mediaTab === "url" ? (
            <div className="space-y-1.5">
              <Label>URL de l'image *</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                required={mediaTab === "url"}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Fichier image *</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="text-sm text-muted-foreground w-full"
                required={mediaTab === "upload"}
              />
            </div>
          )}

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="h-32 w-full object-cover rounded-xl border border-border"
            />
          )}

          <div className="space-y-1.5">
            <Label>Légende (optionnel)</Label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ex: Manucure couture bordeaux"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending || (!url && !fileData)}
              className="rounded-full"
              variant="gold"
            >
              {isPending ? "Ajout…" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

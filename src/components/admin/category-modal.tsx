// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, HelpCircle, Footprints, Sparkles, CheckCircle2 } from "lucide-react";
import { resolveAssetUrl } from "@/lib/resolver";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Record<string, any> | null;
  isPending: boolean;
  onSubmit: (data: any) => void;
}

export function CategoryModal({ open, onClose, initial, isPending, onSubmit }: CategoryModalProps) {
  const isEdit = !!initial;

  // General fields
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [intro, setIntro] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [flat, setFlat] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [sort, setSort] = useState("10");

  // Arrays and lists
  const [highlights, setHighlights] = useState<string[]>([]);
  const [care, setCare] = useState<string[]>([]);
  const [whyUs, setWhyUs] = useState<string[]>([]);
  const [steps, setSteps] = useState<{ title: string; description: string }[]>([]);
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([]);

  // Local helper states for list inputs
  const [newHighlight, setNewHighlight] = useState("");
  const [newCare, setNewCare] = useState("");
  const [newWhyUs, setNewWhyUs] = useState("");

  useEffect(() => {
    if (initial) {
      setSlug(initial.slug ?? "");
      setCategory(initial.category ?? "");
      setTitle(initial.title ?? "");
      setTagline(initial.tagline ?? "");
      setIntro(initial.intro ?? "");
      setDuration(initial.duration ?? "");
      setImage(initial.image ?? "");
      setFlat(initial.flat ?? "");
      setBestFor(initial.bestFor ?? "");
      setSort(initial.sort?.toString() ?? "10");

      setHighlights(initial.highlights ?? []);
      setCare(initial.care ?? []);
      setWhyUs(initial.whyUs ?? []);
      setSteps(initial.steps ?? []);
      setFaq(initial.faq ?? []);
    } else {
      setSlug("");
      setCategory("");
      setTitle("");
      setTagline("");
      setIntro("");
      setDuration("");
      setImage("");
      setFlat("");
      setBestFor("");
      setSort("10");

      setHighlights([]);
      setCare([]);
      setWhyUs([]);
      setSteps([]);
      setFaq([]);
    }
  }, [initial, open]);

  // Generators
  function handleCategoryChange(val: string) {
    setCategory(val);
    if (!isEdit) {
      // Auto slugify
      setSlug(
        val
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      );
    }
  }

  // Lists managers
  const addHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };
  const removeHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const addCare = () => {
    if (newCare.trim()) {
      setCare([...care, newCare.trim()]);
      setNewCare("");
    }
  };
  const removeCare = (idx: number) => {
    setCare(care.filter((_, i) => i !== idx));
  };

  const addWhyUs = () => {
    if (newWhyUs.trim()) {
      setWhyUs([...whyUs, newWhyUs.trim()]);
      setNewWhyUs("");
    }
  };
  const removeWhyUs = (idx: number) => {
    setWhyUs(whyUs.filter((_, i) => i !== idx));
  };

  const addStep = () => {
    setSteps([...steps, { title: "", description: "" }]);
  };
  const updateStep = (idx: number, field: "title" | "description", val: string) => {
    const next = [...steps];
    next[idx][field] = val;
    setSteps(next);
  };
  const removeStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const addFaq = () => {
    setFaq([...faq, { q: "", a: "" }]);
  };
  const updateFaq = (idx: number, field: "q" | "a", val: string) => {
    const next = [...faq];
    next[idx][field] = val;
    setFaq(next);
  };
  const removeFaq = (idx: number) => {
    setFaq(faq.filter((_, i) => i !== idx));
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      slug,
      category,
      title,
      tagline,
      intro,
      duration,
      image: image || null,
      flat: flat || null,
      highlights,
      care,
      whyUs,
      steps,
      faq,
      bestFor,
      sort: Number(sort),
    };
    onSubmit(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-muted/20">
          <DialogTitle className="font-serif text-2xl text-primary font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            {isEdit ? "Modifier la catégorie" : "Ajouter une catégorie"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <Tabs defaultValue="general" className="w-full">
            <div className="px-6 border-b border-border bg-muted/10">
              <TabsList className="bg-transparent rounded-none p-0 flex gap-4 h-12 overflow-x-auto scrollbar-none justify-start w-full">
                <TabsTrigger
                  value="general"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-semibold text-xs uppercase tracking-wider text-muted-foreground transition-all cursor-pointer h-12"
                >
                  Général
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-semibold text-xs uppercase tracking-wider text-muted-foreground transition-all cursor-pointer h-12"
                >
                  Points clés & Conseils
                </TabsTrigger>
                <TabsTrigger
                  value="steps"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-semibold text-xs uppercase tracking-wider text-muted-foreground transition-all cursor-pointer h-12"
                >
                  Étapes & FAQ
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {/* TAB 1: GENERAL */}
              <TabsContent value="general" className="space-y-4 mt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="category-name">Nom de la catégorie *</Label>
                    <Input
                      id="category-name"
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      required
                      placeholder="Ex: Soins des mains"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category-slug">Slug (URL) *</Label>
                    <Input
                      id="category-slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                      disabled={isEdit}
                      placeholder="Ex: mains"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="category-title">Titre d'affichage *</Label>
                    <Input
                      id="category-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Ex: Soins des mains"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category-tagline">Slogan / Sous-titre *</Label>
                    <Input
                      id="category-tagline"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      required
                      placeholder="Ex: Manucure couture"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="category-duration">Durée globale (ex: 45 min – 1 h 15) *</Label>
                    <Input
                      id="category-duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                      placeholder="Ex: 45 min – 1 h 15"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category-sort">Ordre de tri *</Label>
                    <Input
                      id="category-sort"
                      type="number"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category-intro">Introduction description *</Label>
                  <Textarea
                    id="category-intro"
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    required
                    rows={3}
                    placeholder="Entrez une introduction accrocheuse pour cette catégorie..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category-best-for">Idéal pour (Best For) *</Label>
                  <Input
                    id="category-best-for"
                    value={bestFor}
                    onChange={(e) => setBestFor(e.target.value)}
                    required
                    placeholder="Ex: Pour les femmes qui veulent des mains soignées au quotidien..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 border border-border rounded-xl p-4 bg-muted/5">
                  <div className="space-y-1.5">
                    <Label htmlFor="category-image">Lien Image Principale (Cover)</Label>
                    <Input
                      id="category-image"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                    />
                    {image && (
                      <img
                        src={resolveAssetUrl(image)}
                        alt="cover preview"
                        className="mt-2 h-16 w-32 object-cover rounded-lg border border-border"
                      />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category-flat">Lien Image Secondaire (Flat)</Label>
                    <Input
                      id="category-flat"
                      value={flat}
                      onChange={(e) => setFlat(e.target.value)}
                      placeholder="https://..."
                    />
                    {flat && (
                      <img
                        src={resolveAssetUrl(flat)}
                        alt="flat preview"
                        className="mt-2 h-16 w-32 object-cover rounded-lg border border-border"
                      />
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: DETAILS */}
              <TabsContent value="details" className="space-y-5 mt-0">
                {/* Highlights */}
                <div className="space-y-2.5">
                  <Label className="font-semibold text-sm flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-gold" /> Points forts (Highlights)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      placeholder="Ajouter un point fort..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                    />
                    <Button type="button" onClick={addHighlight} className="bg-gold text-white">
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {highlights.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-muted border border-border text-foreground rounded-full"
                      >
                        {h}
                        <button
                          type="button"
                          onClick={() => removeHighlight(i)}
                          className="text-muted-foreground hover:text-destructive text-sm font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {highlights.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Aucun point fort défini
                      </p>
                    )}
                  </div>
                </div>

                {/* Care Tips */}
                <div className="space-y-2.5">
                  <Label className="font-semibold text-sm flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-gold" /> Conseils d'entretien (Care Tips)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCare}
                      onChange={(e) => setNewCare(e.target.value)}
                      placeholder="Ajouter un conseil d'entretien..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCare())}
                    />
                    <Button type="button" onClick={addCare} className="bg-gold text-white">
                      Ajouter
                    </Button>
                  </div>
                  <div className="space-y-2 pt-1.5">
                    {care.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm px-3 py-2 bg-muted border border-border rounded-lg"
                      >
                        <span>{c}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCare(i)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {care.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Aucun conseil d'entretien défini
                      </p>
                    )}
                  </div>
                </div>

                {/* Why Us */}
                <div className="space-y-2.5">
                  <Label className="font-semibold text-sm flex items-center gap-1">
                    <HelpCircle className="h-4 w-4 text-gold" /> Pourquoi nous choisir (Why Us)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newWhyUs}
                      onChange={(e) => setNewWhyUs(e.target.value)}
                      placeholder="Ajouter un argument..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addWhyUs())}
                    />
                    <Button type="button" onClick={addWhyUs} className="bg-gold text-white">
                      Ajouter
                    </Button>
                  </div>
                  <div className="space-y-2 pt-1.5">
                    {whyUs.map((w, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm px-3 py-2 bg-muted border border-border rounded-lg"
                      >
                        <span>{w}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWhyUs(i)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {whyUs.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">Aucun argument défini</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: STEPS & FAQ */}
              <TabsContent value="steps" className="space-y-6 mt-0">
                {/* Steps */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-semibold text-sm flex items-center gap-1">
                      <Footprints className="h-4 w-4 text-gold" /> Étapes du soin (Steps)
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addStep}
                      className="text-xs border-gold text-gold hover:bg-gold/10"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Ajouter une étape
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {steps.map((step, i) => (
                      <div
                        key={i}
                        className="border border-border rounded-xl p-3 bg-muted/20 relative space-y-2"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(i)}
                          className="absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="pr-8 space-y-2">
                          <Input
                            value={step.title}
                            onChange={(e) => updateStep(i, "title", e.target.value)}
                            placeholder={`Étape ${i + 1} : Titre`}
                            className="bg-card font-semibold"
                            required
                          />
                          <Textarea
                            value={step.description}
                            onChange={(e) => updateStep(i, "description", e.target.value)}
                            placeholder="Description de l'étape..."
                            className="bg-card text-xs"
                            rows={2}
                            required
                          />
                        </div>
                      </div>
                    ))}
                    {steps.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">Aucune étape définie</p>
                    )}
                  </div>
                </div>

                {/* FAQ */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <Label className="font-semibold text-sm flex items-center gap-1">
                      <HelpCircle className="h-4 w-4 text-gold" /> FAQ
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addFaq}
                      className="text-xs border-gold text-gold hover:bg-gold/10"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Ajouter une FAQ
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {faq.map((item, i) => (
                      <div
                        key={i}
                        className="border border-border rounded-xl p-3 bg-muted/20 relative space-y-2"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFaq(i)}
                          className="absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="pr-8 space-y-2">
                          <Input
                            value={item.q}
                            onChange={(e) => updateFaq(i, "q", e.target.value)}
                            placeholder={`Question ${i + 1}`}
                            className="bg-card font-semibold"
                            required
                          />
                          <Textarea
                            value={item.a}
                            onChange={(e) => updateFaq(i, "a", e.target.value)}
                            placeholder="Réponse..."
                            className="bg-card text-xs"
                            rows={2}
                            required
                          />
                        </div>
                      </div>
                    ))}
                    {faq.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Aucune question/réponse définie
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-gold text-white hover:bg-gold/90 font-semibold"
              >
                {isPending ? "Enregistrement…" : isEdit ? "Modifier" : "Ajouter"}
              </Button>
            </DialogFooter>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}

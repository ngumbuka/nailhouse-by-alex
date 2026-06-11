import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/service-categories";
import {
  isCurrentUserAdmin,
  adminListBookings,
  adminUpdateBookingStatus,
  adminListSubscribers,
  adminListGallery,
  adminAddGalleryByUrl,
  adminDeleteGalleryImage,
} from "@/lib/admin.functions";
import {
  adminListServiceGallery,
  adminRegisterServiceGalleryImage,
  adminUpdateServiceGalleryImage,
  adminDeleteServiceGalleryImage,
} from "@/lib/service-gallery.functions";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const listBookings = useServerFn(adminListBookings);
  const updateStatus = useServerFn(adminUpdateBookingStatus);
  const listSubs = useServerFn(adminListSubscribers);
  const listGallery = useServerFn(adminListGallery);
  const addGallery = useServerFn(adminAddGalleryByUrl);
  const delGallery = useServerFn(adminDeleteGalleryImage);

  const admin = useQuery({ queryKey: ["isAdmin"], queryFn: () => checkAdmin() });
  const bookings = useQuery({ queryKey: ["admin", "bookings"], queryFn: () => listBookings(), enabled: !!admin.data?.isAdmin });
  const subs = useQuery({ queryKey: ["admin", "subs"], queryFn: () => listSubs(), enabled: !!admin.data?.isAdmin });
  const gallery = useQuery({ queryKey: ["admin", "gallery"], queryFn: () => listGallery(), enabled: !!admin.data?.isAdmin });

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "confirmed" | "cancelled" | "completed" }) => updateStatus({ data: v }),
    onSuccess: () => { toast.success("Statut mis à jour"); qc.invalidateQueries({ queryKey: ["admin", "bookings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const addMut = useMutation({
    mutationFn: (v: { url: string; caption?: string }) => addGallery({ data: v }),
    onSuccess: () => { toast.success("Image ajoutée"); qc.invalidateQueries({ queryKey: ["admin", "gallery"] }); qc.invalidateQueries({ queryKey: ["gallery"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delGallery({ data: { id } }),
    onSuccess: () => { toast.success("Image supprimée"); qc.invalidateQueries({ queryKey: ["admin", "gallery"] }); qc.invalidateQueries({ queryKey: ["gallery"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [imgUrl, setImgUrl] = useState("");
  const [imgCaption, setImgCaption] = useState("");

  // ── Per-service gallery state & mutations ───────────────
  const listSvcGallery = useServerFn(adminListServiceGallery);
  const registerSvcImg = useServerFn(adminRegisterServiceGalleryImage);
  const updateSvcImg = useServerFn(adminUpdateServiceGalleryImage);
  const deleteSvcImg = useServerFn(adminDeleteServiceGalleryImage);

  const svcGallery = useQuery({
    queryKey: ["admin", "service-gallery"],
    queryFn: () => listSvcGallery(),
    enabled: !!admin.data?.isAdmin,
  });

  const invalidateSvcGallery = (slug?: string) => {
    qc.invalidateQueries({ queryKey: ["admin", "service-gallery"] });
    if (slug) qc.invalidateQueries({ queryKey: ["service-gallery", slug] });
    else qc.invalidateQueries({ queryKey: ["service-gallery"] });
  };

  const registerMut = useMutation({
    mutationFn: (v: { slug: string; storagePath: string; caption?: string }) =>
      registerSvcImg({ data: v }),
    onSuccess: (_d, v) => { toast.success("Image ajoutée"); invalidateSvcGallery(v.slug); },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateSvcMut = useMutation({
    mutationFn: (v: { id: string; sort?: number; caption?: string | null; slug?: string }) =>
      updateSvcImg({ data: { id: v.id, sort: v.sort, caption: v.caption } }),
    onSuccess: (_d, v) => { invalidateSvcGallery(v.slug); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteSvcMut = useMutation({
    mutationFn: (v: { id: string; slug: string }) => deleteSvcImg({ data: { id: v.id } }),
    onSuccess: (_d, v) => { toast.success("Image supprimée"); invalidateSvcGallery(v.slug); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [svcSlug, setSvcSlug] = useState<string>(CATEGORIES[0]?.slug ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleSvcUpload(files: FileList | null) {
    if (!files || files.length === 0 || !svcSlug) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${svcSlug}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("service-gallery")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        await registerMut.mutateAsync({ slug: svcSlug, storagePath: path });
      }
      toast.success("Téléversement terminé");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (admin.isLoading) return <SiteLayout><div className="p-10 text-sm text-muted-foreground">Chargement…</div></SiteLayout>;
  if (!admin.data?.isAdmin) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <h1 className="font-serif text-3xl text-primary">Accès refusé</h1>
          <p className="mt-3 text-muted-foreground">Votre compte n'a pas le rôle administrateur. Contactez le support pour activer cet accès.</p>
          <Button className="mt-6 rounded-full" onClick={signOut}>Se déconnecter</Button>
        </div>
      </SiteLayout>
    );
  }

  function exportCsv() {
    const rows = subs.data ?? [];
    const csv = "email,created_at\n" + rows.map((r) => `${r.email},${r.created_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "newsletter.csv";
    a.click();
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Administration</p>
            <h1 className="mt-2 font-serif text-4xl text-primary">Tableau de bord</h1>
          </div>
          <Button variant="outline" className="rounded-full" onClick={signOut}>Déconnexion</Button>
        </div>

        <Tabs defaultValue="bookings" className="mt-8">
          <TabsList>
            <TabsTrigger value="bookings">Réservations</TabsTrigger>
            <TabsTrigger value="gallery">Galerie</TabsTrigger>
            <TabsTrigger value="service-gallery">Galeries prestations</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Prestation</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(bookings.data ?? []).map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="whitespace-nowrap">{new Date(b.scheduled_at).toLocaleString("fr-FR")}</TableCell>
                      <TableCell>{b.name}</TableCell>
                      <TableCell className="text-xs"><div>{b.phone}</div><div className="text-muted-foreground">{b.email}</div></TableCell>
                      <TableCell>{b.service_name}</TableCell>
                      <TableCell>
                        <Select value={b.status} onValueChange={(s) => statusMut.mutate({ id: b.id, status: s as any })}>
                          <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="confirmed">Confirmé</SelectItem>
                            <SelectItem value="completed">Terminé</SelectItem>
                            <SelectItem value="cancelled">Annulé</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(bookings.data ?? []).length === 0 && (
                    <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Aucune réservation pour le moment.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6 space-y-6">
            <form
              className="grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-[2fr_2fr_auto] md:items-end"
              onSubmit={(e) => { e.preventDefault(); if (imgUrl) addMut.mutate({ url: imgUrl, caption: imgCaption || undefined }); setImgUrl(""); setImgCaption(""); }}
            >
              <div className="space-y-2"><Label>URL de l'image</Label><Input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://…" required /></div>
              <div className="space-y-2"><Label>Légende (optionnel)</Label><Input value={imgCaption} onChange={(e) => setImgCaption(e.target.value)} /></div>
              <Button type="submit" className="rounded-full" disabled={addMut.isPending}>Ajouter</Button>
            </form>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {(gallery.data ?? []).map((img) => (
                <div key={img.id} className="group relative overflow-hidden rounded-2xl border border-border">
                  <img src={img.url} alt={img.caption ?? ""} className="aspect-square w-full object-cover" />
                  <button
                    className="absolute right-2 top-2 rounded-full bg-destructive px-3 py-1 text-xs text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => delMut.mutate(img.id)}
                  >Supprimer</button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="newsletter" className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{subs.data?.length ?? 0} inscrits</p>
              <Button onClick={exportCsv} variant="outline" className="rounded-full">Exporter CSV</Button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <Table>
                <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Inscrit le</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(subs.data ?? []).map((s) => (
                    <TableRow key={s.id}><TableCell>{s.email}</TableCell><TableCell className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString("fr-FR")}</TableCell></TableRow>
                  ))}
                  {(subs.data ?? []).length === 0 && (
                    <TableRow><TableCell colSpan={2} className="py-10 text-center text-muted-foreground">Aucun inscrit pour le moment.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/service-categories";
import {
  isCurrentUserAdmin,
  adminListBookings,
  adminUpdateBookingStatus,
  adminCreateBooking,
  adminListClients,
  adminListServices,
  adminAddService,
  adminUpdateService,
  adminDeleteService,
  adminListGallery,
  adminAddGalleryByUrl,
  adminDeleteGalleryImage,
  adminListSubscribers,
  adminListAllMessages,
  adminSendMessage,
} from "@/lib/admin.functions";
import {
  Users,
  Calendar,
  Grid,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Plus,
  Trash2,
  Edit,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Server functions
  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const listBookings = useServerFn(adminListBookings);
  const updateStatus = useServerFn(adminUpdateBookingStatus);
  const createBookingFn = useServerFn(adminCreateBooking);
  const listClients = useServerFn(adminListClients);
  const listServicesFn = useServerFn(adminListServices);
  const addServiceFn = useServerFn(adminAddService);
  const updateServiceFn = useServerFn(adminUpdateService);
  const deleteServiceFn = useServerFn(adminDeleteService);
  const listGallery = useServerFn(adminListGallery);
  const addGallery = useServerFn(adminAddGalleryByUrl);
  const delGallery = useServerFn(adminDeleteGalleryImage);
  const listSubs = useServerFn(adminListSubscribers);
  const listAllMessagesFn = useServerFn(adminListAllMessages);
  const adminSendMsgFn = useServerFn(adminSendMessage);

  // Queries
  const admin = useQuery({ queryKey: ["isAdmin"], queryFn: () => checkAdmin() });
  const bookings = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => listBookings(),
    enabled: !!admin.data?.isAdmin,
  });
  const clients = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: () => listClients(),
    enabled: !!admin.data?.isAdmin,
  });
  const services = useQuery({
    queryKey: ["admin", "services"],
    queryFn: () => listServicesFn(),
    enabled: !!admin.data?.isAdmin,
  });
  const gallery = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: () => listGallery(),
    enabled: !!admin.data?.isAdmin,
  });
  const subs = useQuery({
    queryKey: ["admin", "subs"],
    queryFn: () => listSubs(),
    enabled: !!admin.data?.isAdmin,
  });
  const messages = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: () => listAllMessagesFn(),
    enabled: !!admin.data?.isAdmin,
    refetchInterval: 5000,
  });

  // Booking form state
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [newBName, setNewBName] = useState("");
  const [newBPhone, setNewBPhone] = useState("");
  const [newBEmail, setNewBEmail] = useState("");
  const [newBService, setNewBService] = useState("");
  const [newBDate, setNewBDate] = useState("");
  const [newBNotes, setNewBNotes] = useState("");

  // Services form state
  const [editingSvcId, setEditingSvcId] = useState<string | null>(null);
  const [svcName, setSvcName] = useState("");
  const [svcCategory, setSvcCategory] = useState("mains");
  const [svcPrice, setSvcPrice] = useState(15000);
  const [svcDuration, setSvcDuration] = useState(45);
  const [svcDesc, setSvcDesc] = useState("");
  const [svcSlug, setSvcSlug] = useState("");

  // Gallery form state
  const [imgUrl, setImgUrl] = useState("");
  const [imgCaption, setImgCaption] = useState("");

  // Chat/Inbox selection state
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedClientId) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedClientId, messages.data]);

  // Mutations
  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "confirmed" | "cancelled" | "completed" }) =>
      updateStatus({ data: v }),
    onSuccess: () => {
      toast.success("Statut mis à jour");
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addBookingMut = useMutation({
    mutationFn: (v: {
      name: string;
      phone: string;
      email: string;
      service_name: string;
      scheduled_at: string;
      notes: string | null;
    }) => createBookingFn({ data: v }),
    onSuccess: () => {
      toast.success("Réservation manuelle ajoutée");
      setShowAddBooking(false);
      setNewBName("");
      setNewBPhone("");
      setNewBEmail("");
      setNewBService("");
      setNewBDate("");
      setNewBNotes("");
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addSvcMut = useMutation({
    mutationFn: (v: {
      name: string;
      category: string;
      price_fcfa: number;
      duration_mins: number;
      description: string;
      slug: string;
    }) => addServiceFn({ data: v }),
    onSuccess: () => {
      toast.success("Prestation ajoutée");
      resetSvcForm();
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateSvcMut = useMutation({
    mutationFn: (v: {
      id: string;
      name: string;
      category: string;
      price_fcfa: number;
      duration_mins: number;
      description: string;
      slug: string;
    }) => updateServiceFn({ data: v }),
    onSuccess: () => {
      toast.success("Prestation modifiée");
      resetSvcForm();
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteSvcMut = useMutation({
    mutationFn: (id: string) => deleteServiceFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Prestation supprimée");
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addGalleryMut = useMutation({
    mutationFn: (v: { url: string; caption?: string }) => addGallery({ data: v }),
    onSuccess: () => {
      toast.success("Image ajoutée à la galerie");
      setImgUrl("");
      setImgCaption("");
      qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delGalleryMut = useMutation({
    mutationFn: (id: string) => delGallery({ data: { id } }),
    onSuccess: () => {
      toast.success("Image supprimée");
      qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const adminSendMsgMut = useMutation({
    mutationFn: (v: { receiverId: string; message: string }) => adminSendMsgFn({ data: v }),
    onSuccess: () => {
      setAdminReplyText("");
      qc.invalidateQueries({ queryKey: ["admin", "messages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetSvcForm() {
    setEditingSvcId(null);
    setSvcName("");
    setSvcCategory("mains");
    setSvcPrice(15000);
    setSvcDuration(45);
    setSvcDesc("");
    setSvcSlug("");
  }

  function editSvc(s: {
    id: string;
    name: string;
    category: string;
    price_fcfa: number;
    duration_mins: number;
    description: string;
    slug: string;
  }) {
    setEditingSvcId(s.id);
    setSvcName(s.name);
    setSvcCategory(s.category);
    setSvcPrice(s.price_fcfa);
    setSvcDuration(s.duration_mins);
    setSvcDesc(s.description);
    setSvcSlug(s.slug);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (admin.isLoading) {
    return (
      <SiteLayout>
        <div className="p-10 text-sm text-muted-foreground">Chargement…</div>
      </SiteLayout>
    );
  }

  if (!admin.data?.isAdmin) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <h1 className="font-serif text-3xl text-primary">Accès refusé</h1>
          <p className="mt-3 text-muted-foreground">Votre compte n'a pas le rôle administrateur.</p>
          <Button className="mt-6 rounded-full" onClick={signOut}>
            Se déconnecter
          </Button>
        </div>
      </SiteLayout>
    );
  }

  // Filter messages for active chat thread
  const activeClientMessages = (messages.data ?? []).filter(
    (m) => m.sender_id === selectedClientId || m.receiver_id === selectedClientId,
  );

  // Get active client object
  const activeClient = (clients.data ?? []).find((c) => c.id === selectedClientId);

  // Group messages by client to list active conversations
  const chatGroups = (clients.data ?? [])
    .filter((c) => c.role !== "admin")
    .map((c) => {
      const cMsgs = (messages.data ?? []).filter(
        (m) => m.sender_id === c.id || m.receiver_id === c.id,
      );
      const lastMsg = cMsgs[cMsgs.length - 1];
      return {
        client: c,
        lastMessage: lastMsg,
      };
    })
    .filter((g) => g.lastMessage) // Only show clients with chat history
    .sort(
      (a, b) =>
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime(),
    );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gold/15 pb-8 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
              Administration
            </p>
            <h1 className="mt-2 font-serif text-3xl text-primary md:text-4xl">Tableau de bord</h1>
          </div>
          <Button
            variant="outline"
            className="rounded-full font-semibold border-gold/30"
            onClick={signOut}
          >
            Déconnexion
          </Button>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto bg-transparent border-b border-border p-0 gap-6 rounded-none">
            <TabsTrigger
              value="bookings"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Calendar className="h-4.5 w-4.5" />
              Réservations
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Users className="h-4.5 w-4.5" />
              Clients
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Grid className="h-4.5 w-4.5" />
              Prestations
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <ImageIcon className="h-4.5 w-4.5" />
              Galerie
            </TabsTrigger>
            <TabsTrigger
              value="inbox"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <MessageSquare className="h-4.5 w-4.5" />
              Messagerie
            </TabsTrigger>
            <TabsTrigger
              value="newsletter"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Mail className="h-4.5 w-4.5" />
              Newsletter
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB: BOOKINGS ─────────────────────────────────────────────────── */}
          <TabsContent value="bookings" className="space-y-6 outline-none">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-xl text-primary font-semibold">
                Suivi des rendez-vous
              </h2>
              <Button
                onClick={() => setShowAddBooking(!showAddBooking)}
                className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 font-semibold"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Nouvelle réservation
              </Button>
            </div>

            {showAddBooking && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addBookingMut.mutate({
                    name: newBName,
                    phone: newBPhone,
                    email: newBEmail,
                    service_name: newBService,
                    scheduled_at: new Date(newBDate).toISOString(),
                    notes: newBNotes || null,
                  });
                }}
                className="grid gap-4 rounded-2xl border border-border bg-card p-6 max-w-2xl"
              >
                <h3 className="font-serif text-base text-primary font-bold">
                  Ajouter un rendez-vous manuel
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Nom client</Label>
                    <Input
                      value={newBName}
                      onChange={(e) => setNewBName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Téléphone</Label>
                    <Input
                      value={newBPhone}
                      onChange={(e) => setNewBPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newBEmail}
                      onChange={(e) => setNewBEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Soin</Label>
                    <Input
                      value={newBService}
                      onChange={(e) => setNewBService(e.target.value)}
                      placeholder="Ex: Manucure Classique"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Date & Heure</Label>
                    <Input
                      type="datetime-local"
                      value={newBDate}
                      onChange={(e) => setNewBDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newBNotes}
                      onChange={(e) => setNewBNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => setShowAddBooking(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 font-semibold"
                  >
                    Créer
                  </Button>
                </div>
              </form>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
                      <TableCell className="whitespace-nowrap font-medium">
                        {new Date(b.scheduled_at).toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell className="font-serif text-primary font-semibold">
                        {b.name}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{b.phone}</div>
                        <div className="text-muted-foreground">{b.email}</div>
                      </TableCell>
                      <TableCell>{b.service_name}</TableCell>
                      <TableCell>
                        <Select
                          value={b.status}
                          onValueChange={(s) =>
                            statusMut.mutate({
                              id: b.id,
                              status: s as "pending" | "confirmed" | "cancelled" | "completed",
                            })
                          }
                        >
                          <SelectTrigger className="h-8.5 w-36 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
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
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        Aucune réservation pour le moment.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ─── TAB: CLIENTS ──────────────────────────────────────────────────── */}
          <TabsContent value="clients" className="space-y-4 outline-none">
            <h2 className="font-serif text-xl text-primary font-semibold">Portefeuille Clients</h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Réservations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(clients.data ?? []).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-serif text-primary font-semibold">
                        {c.name}
                      </TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell className="font-medium">{c.phone || "—"}</TableCell>
                      <TableCell className="capitalize text-xs font-bold text-gold">
                        {c.role}
                      </TableCell>
                      <TableCell className="font-bold text-center sm:text-left">
                        {c.bookingsCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ─── TAB: SERVICES ─────────────────────────────────────────────────── */}
          <TabsContent value="services" className="space-y-6 outline-none">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-xl text-primary font-semibold">
                Gestion du Catalogue
              </h2>
              {editingSvcId && (
                <Button variant="ghost" className="rounded-full" onClick={resetSvcForm}>
                  Nouvelle prestation
                </Button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const payload = {
                  name: svcName,
                  category: svcCategory,
                  price_fcfa: Number(svcPrice),
                  duration_mins: Number(svcDuration),
                  description: svcDesc,
                  slug: svcSlug,
                };
                if (editingSvcId) {
                  updateSvcMut.mutate({ id: editingSvcId, ...payload });
                } else {
                  addSvcMut.mutate(payload);
                }
              }}
              className="grid gap-4 rounded-2xl border border-border bg-card p-6 max-w-3xl"
            >
              <h3 className="font-serif text-base text-primary font-bold">
                {editingSvcId ? "Modifier la prestation" : "Ajouter une prestation"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Nom du soin</Label>
                  <Input value={svcName} onChange={(e) => setSvcName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Catégorie (Universe)</Label>
                  <Select value={svcCategory} onValueChange={setSvcCategory}>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mains">Mains (Manucure)</SelectItem>
                      <SelectItem value="pieds">Pieds (Pédicure)</SelectItem>
                      <SelectItem value="extensions">Extensions</SelectItem>
                      <SelectItem value="nailart">Nail Art</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tarif (FCFA)</Label>
                  <Input
                    type="number"
                    value={svcPrice}
                    onChange={(e) => setSvcPrice(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Durée (minutes)</Label>
                  <Input
                    type="number"
                    value={svcDuration}
                    onChange={(e) => setSvcDuration(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Identifiant Slug (URL)</Label>
                  <Input
                    value={svcSlug}
                    onChange={(e) => setSvcSlug(e.target.value)}
                    placeholder="ex: manucure-signature"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={svcDesc}
                    onChange={(e) => setSvcDesc(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="submit"
                  className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 font-semibold px-6"
                >
                  {editingSvcId ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </form>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Tarif</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(services.data ?? []).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-serif text-primary font-semibold">
                        {s.name}
                      </TableCell>
                      <TableCell className="capitalize text-xs font-medium text-gold">
                        {s.category}
                      </TableCell>
                      <TableCell className="font-bold">
                        {s.price_fcfa.toLocaleString("fr-FR")} F
                      </TableCell>
                      <TableCell>{s.duration_mins} min</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full text-muted-foreground hover:text-gold"
                          onClick={() => editSvc(s)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full text-destructive hover:text-destructive/80"
                          onClick={() => {
                            if (confirm("Supprimer ce soin ?")) deleteSvcMut.mutate(s.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ─── TAB: GALLERY ──────────────────────────────────────────────────── */}
          <TabsContent value="gallery" className="space-y-6 outline-none">
            <h2 className="font-serif text-xl text-primary font-semibold">Galerie photos</h2>
            <form
              className="grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-[2fr_2fr_auto] md:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                if (imgUrl) addGalleryMut.mutate({ url: imgUrl, caption: imgCaption || undefined });
              }}
            >
              <div className="space-y-2">
                <Label>URL de l'image</Label>
                <Input
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  placeholder="https://…"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Légende (optionnel)</Label>
                <Input value={imgCaption} onChange={(e) => setImgCaption(e.target.value)} />
              </div>
              <Button
                type="submit"
                className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 font-semibold px-6"
              >
                Ajouter
              </Button>
            </form>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {(gallery.data ?? []).map((img) => (
                <div
                  key={img.id}
                  className="group relative overflow-hidden rounded-2xl border border-border shadow-sm"
                >
                  <img
                    src={img.url}
                    alt={img.caption ?? ""}
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    className="absolute right-2 top-2 rounded-full bg-destructive px-3 py-1 text-xs text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                    onClick={() => delGalleryMut.mutate(img.id)}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ─── TAB: MESSAGERIE ────────────────────────────────────────────────── */}
          <TabsContent value="inbox" className="outline-none">
            <h2 className="font-serif text-xl text-primary font-semibold mb-4">
              Support & Messagerie
            </h2>
            <div className="grid md:grid-cols-[260px_1fr] border border-border bg-card rounded-2xl overflow-hidden h-[520px] shadow-md">
              {/* Inbox sidebar */}
              <div className="border-r border-border bg-muted/10 flex flex-col">
                <div className="p-4 border-b border-border bg-muted/20">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                    Discussions
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-border">
                  {chatGroups.map((g) => {
                    const isSelected = selectedClientId === g.client.id;
                    return (
                      <button
                        key={g.client.id}
                        onClick={() => setSelectedClientId(g.client.id)}
                        className={`w-full text-left p-4.5 transition-colors flex flex-col cursor-pointer ${
                          isSelected ? "bg-gold/10 text-gold" : "hover:bg-muted/30"
                        }`}
                      >
                        <span className="font-serif text-sm font-semibold text-primary">
                          {g.client.name}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                          {g.lastMessage?.message}
                        </span>
                      </button>
                    );
                  })}
                  {chatGroups.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      Aucune discussion.
                    </div>
                  )}
                </div>
              </div>

              {/* Chat thread view */}
              <div className="flex flex-col h-full bg-background justify-between">
                {selectedClientId ? (
                  <>
                    <div className="p-4 border-b border-border bg-muted/15 flex justify-between items-center">
                      <span className="font-serif text-base font-bold text-primary">
                        {activeClient?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{activeClient?.email}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gold/20">
                      {activeClientMessages.map((m) => {
                        const isSenderAdmin = m.sender_id === "mock-admin-id-456";
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col max-w-[75%] rounded-2xl px-4.5 py-3 ${
                              isSenderAdmin
                                ? "bg-[#6D5337] text-white dark:bg-gold dark:text-ink self-end rounded-tr-none shadow-sm"
                                : "bg-muted text-foreground self-start rounded-tl-none border border-border"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {m.message}
                            </p>
                            <span className={`text-[8.5px] mt-1 self-end opacity-75`}>
                              {new Date(m.created_at).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-border bg-muted/10">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (adminReplyText.trim()) {
                            adminSendMsgMut.mutate({
                              receiverId: selectedClientId,
                              message: adminReplyText,
                            });
                          }
                        }}
                        className="flex gap-2"
                      >
                        <Input
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder="Écrivez votre réponse ici..."
                          className="rounded-full border-border focus-visible:ring-gold py-5 px-5 bg-background flex-1"
                        />
                        <Button
                          type="submit"
                          disabled={!adminReplyText.trim() || adminSendMsgMut.isPending}
                          className="rounded-full bg-gold h-10 w-10 p-0 text-white dark:text-ink hover:bg-gold/90 shrink-0 shadow-md shadow-gold/10"
                        >
                          <Send className="h-4.5 w-4.5" />
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                    Sélectionnez une discussion dans la colonne de gauche.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB: NEWSLETTER ────────────────────────────────────────────────── */}
          <TabsContent value="newsletter" className="outline-none space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-primary font-semibold">Abonnés Newsletter</h2>
              <p className="text-sm text-muted-foreground">{subs.data?.length ?? 0} inscrits</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Inscrit le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(subs.data ?? []).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(subs.data ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                        Aucun inscrit pour le moment.
                      </TableCell>
                    </TableRow>
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

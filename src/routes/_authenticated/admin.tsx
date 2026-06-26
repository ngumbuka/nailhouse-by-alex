import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, Fragment } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/site-layout";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale/fr";
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
import { resolveAssetUrl } from "@/lib/resolver";
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
  adminUpdateBookingDetails,
  adminListPromotions,
  adminCreatePromotion,
  adminDeletePromotion,
  adminGetSettings,
  adminUpdateSettings,
  adminListVideos,
  adminAddVideo,
  adminUpdateVideo,
  adminDeleteVideo,
} from "@/lib/admin.functions";
import {
  Users,
  Calendar,
  Grid,
  Image as ImageIcon,
  MessageSquare,
  Video,
  Mail,
  Plus,
  Trash2,
  Edit,
  Send,
  Clock,
  Sparkles,
  Tag,
  CalendarDays,
  BarChart,
  Settings as SettingsIcon,
} from "lucide-react";

const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
  const updateBookingDetailsFn = useServerFn(adminUpdateBookingDetails);
  const adminListPromotionsFn = useServerFn(adminListPromotions);
  const createPromoFn = useServerFn(adminCreatePromotion);
  const deletePromoFn = useServerFn(adminDeletePromotion);
  const getSettingsFn = useServerFn(adminGetSettings);
  const updateSettingsFn = useServerFn(adminUpdateSettings);

  const listVideosFn = useServerFn(adminListVideos);
  const addVideoFn = useServerFn(adminAddVideo);
  const updateVideoFn = useServerFn(adminUpdateVideo);
  const deleteVideoFn = useServerFn(adminDeleteVideo);

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

  const promotionsQuery = useQuery({
    queryKey: ["admin", "promotions"],
    queryFn: () => adminListPromotionsFn(),
    enabled: !!admin.data?.isAdmin,
  });

  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => getSettingsFn(),
    enabled: !!admin.data?.isAdmin,
  });

  const videosQuery = useQuery({
    queryKey: ["admin", "videos"],
    queryFn: () => listVideosFn(),
    enabled: !!admin.data?.isAdmin,
  });

  const updateSettingsMut = useMutation({
    mutationFn: (v: {
      opening_time: string;
      closing_time: string;
      closed_days: number[];
      blocked_dates: string[];
      buffer_time_mins: number;
    }) => updateSettingsFn({ data: v }),
    onSuccess: () => {
      toast.success("Paramètres mis à jour !");
      settingsQuery.refetch();
    },
    onError: (err: { message?: string }) => toast.error(err.message || "Erreur de mise à jour"),
  });

  const createPromoMut = useMutation({
    mutationFn: (v: {
      code: string;
      discount_percent: number;
      description: string;
      active: boolean;
      service_id: string | null;
      start_date: string | null;
      end_date: string | null;
    }) => createPromoFn({ data: v }),
    onSuccess: () => {
      toast.success("Promotion créée avec succès !");
      setPromoCodeState("");
      setPromoDesc("");
      setPromoStart("");
      setPromoEnd("");
      promotionsQuery.refetch();
    },
    onError: (err: { message?: string }) => toast.error(err.message || "Erreur de création"),
  });

  const deletePromoMut = useMutation({
    mutationFn: (id: string) => deletePromoFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Promotion supprimée !");
      promotionsQuery.refetch();
    },
    onError: (err: { message?: string }) => toast.error(err.message || "Erreur de suppression"),
  });

  const addVideoMut = useMutation({
    mutationFn: (v: {
      url: string;
      title: string;
      description: string;
      category: string;
      active: boolean;
      sort: number;
    }) => addVideoFn({ data: v }),
    onSuccess: () => {
      toast.success("Vidéo ajoutée !");
      setVidUrl("");
      setVidTitle("");
      setVidDesc("");
      videosQuery.refetch();
    },
    onError: (err: { message?: string }) => toast.error(err.message || "Erreur d'ajout"),
  });

  const updateVideoMut = useMutation({
    mutationFn: (v: {
      id: string;
      url?: string;
      title?: string;
      description?: string;
      category?: string;
      active?: boolean;
      sort?: number;
    }) => updateVideoFn({ data: v }),
    onSuccess: () => {
      toast.success("Vidéo mise à jour !");
      setEditingVidId(null);
      setVidUrl("");
      setVidTitle("");
      setVidDesc("");
      videosQuery.refetch();
    },
    onError: (err: { message?: string }) => toast.error(err.message || "Erreur de mise à jour"),
  });

  const deleteVideoMut = useMutation({
    mutationFn: (id: string) => deleteVideoFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Vidéo supprimée !");
      videosQuery.refetch();
    },
    onError: (err: { message?: string }) => toast.error(err.message || "Erreur de suppression"),
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
  const [svcSeasonalPrice, setSvcSeasonalPrice] = useState<number | "">("");
  const [svcSeasonalStart, setSvcSeasonalStart] = useState("");
  const [svcSeasonalEnd, setSvcSeasonalEnd] = useState("");
  const [svcIsActive, setSvcIsActive] = useState<boolean>(true);
  const [svcIsAddon, setSvcIsAddon] = useState<boolean>(false);
  const [svcSort, setSvcSort] = useState<string>("0");
  const [svcImageUrl, setSvcImageUrl] = useState<string>("");

  // Promotions form state
  const [promoCodeState, setPromoCodeState] = useState("");
  const [promoPercent, setPromoPercent] = useState<number>(10);
  const [promoDesc, setPromoDesc] = useState("");
  const [promoActive, setPromoActive] = useState(true);
  const [promoServiceId, setPromoServiceId] = useState<string>("all");
  const [promoStart, setPromoStart] = useState("");
  const [promoEnd, setPromoEnd] = useState("");

  // Configuration state
  const [cfgOpen, setCfgOpen] = useState("09:00");
  const [cfgClose, setCfgClose] = useState("19:00");
  const [cfgBuffer, setCfgBuffer] = useState(0);
  const [cfgClosedDays, setCfgClosedDays] = useState<number[]>([0]);
  const [cfgBlocked, setCfgBlocked] = useState<string[]>([]);
  const [cfgNewBlocked, setCfgNewBlocked] = useState("");

  // Videos form state
  const [editingVidId, setEditingVidId] = useState<string | null>(null);
  const [vidUrl, setVidUrl] = useState("");
  const [vidTitle, setVidTitle] = useState("");
  const [vidDesc, setVidDesc] = useState("");
  const [vidCat, setVidCat] = useState("mains");
  const [vidActive, setVidActive] = useState(true);
  const [vidSort, setVidSort] = useState<string>("0");

  useEffect(() => {
    if (settingsQuery.data) {
      setCfgOpen(settingsQuery.data.opening_time);
      setCfgClose(settingsQuery.data.closing_time);
      setCfgBuffer(settingsQuery.data.buffer_time_mins);
      setCfgClosedDays(settingsQuery.data.closed_days);
      setCfgBlocked(settingsQuery.data.blocked_dates);
    }
  }, [settingsQuery.data]);

  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

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

  const saveDetailsMut = useMutation({
    mutationFn: (v: {
      id: string;
      notes?: string | null;
      scheduled_at?: string | null;
      proposed_scheduled_at?: string | null;
      admin_comment?: string | null;
      status?: "pending" | "confirmed" | "cancelled" | "completed";
    }) => updateBookingDetailsFn({ data: v }),
    onSuccess: () => {
      toast.success("Détails mis à jour");
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
      seasonal_price_fcfa?: number | null;
      seasonal_price_start?: string | null;
      seasonal_price_end?: string | null;
      is_active?: boolean;
      sort?: number;
      image_url?: string | null;
      is_addon?: boolean;
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
      seasonal_price_fcfa?: number | null;
      seasonal_price_start?: string | null;
      seasonal_price_end?: string | null;
      is_active?: boolean;
      sort?: number;
      image_url?: string | null;
      is_addon?: boolean;
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
    setSvcSeasonalPrice("");
    setSvcSeasonalStart("");
    setSvcSeasonalEnd("");
    setSvcIsActive(true);
    setSvcIsAddon(false);
    setSvcSort("0");
    setSvcImageUrl("");
  }

  function editSvc(s: {
    id: string;
    name: string;
    category: string;
    price_fcfa: number;
    duration_mins: number;
    description: string;
    slug: string;
    seasonal_price_fcfa?: number | null;
    seasonal_price_start?: string | null;
    seasonal_price_end?: string | null;
    is_active?: boolean;
    sort?: number;
    image_url?: string | null;
    is_addon?: boolean;
  }) {
    setEditingSvcId(s.id);
    setSvcName(s.name);
    setSvcCategory(s.category);
    setSvcPrice(s.price_fcfa);
    setSvcDuration(s.duration_mins);
    setSvcDesc(s.description);
    setSvcSlug(s.slug);
    setSvcSeasonalPrice(
      s.seasonal_price_fcfa !== undefined && s.seasonal_price_fcfa !== null
        ? s.seasonal_price_fcfa
        : "",
    );
    setSvcSeasonalStart(
      s.seasonal_price_start ? new Date(s.seasonal_price_start).toISOString().slice(0, 16) : "",
    );
    setSvcSeasonalEnd(
      s.seasonal_price_end ? new Date(s.seasonal_price_end).toISOString().slice(0, 16) : "",
    );
    setSvcIsActive(s.is_active ?? true);
    setSvcIsAddon(s.is_addon ?? false);
    setSvcSort(s.sort?.toString() ?? "0");
    setSvcImageUrl(s.image_url ?? "");
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
            <TabsTrigger
              value="promotions"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Tag className="h-4.5 w-4.5" />
              Promotions
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <CalendarDays className="h-4.5 w-4.5" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <BarChart className="h-4.5 w-4.5" />
              Analytique
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Video className="h-4.5 w-4.5" />
              Vidéos
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB: CALENDAR ─────────────────────────────────────────────────── */}
          <TabsContent value="calendar" className="space-y-6 outline-none h-[700px] mt-6">
            <BigCalendar
              localizer={localizer}
              events={(bookings.data ?? []).map((b) => ({
                title: `${b.name} - ${b.service_name}`,
                start: new Date(b.scheduled_at),
                end: new Date(new Date(b.scheduled_at).getTime() + 60 * 60 * 1000),
                resource: b,
              }))}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              culture="fr"
              messages={{
                next: "Suivant",
                previous: "Précédent",
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                agenda: "Agenda",
              }}
              className="bg-card p-4 rounded-2xl border border-border shadow-sm font-sans"
            />
          </TabsContent>

          {/* ─── TAB: ANALYTICS ─────────────────────────────────────────────────── */}
          <TabsContent value="analytics" className="space-y-6 outline-none mt-6">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-xl text-primary font-semibold">
                Analytique & Exports
              </h2>
              <Button
                onClick={() => {
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    "Nom,Email,Téléphone,Role,Date de Création\n" +
                    (clients.data ?? [])
                      .map((c) => `${c.name},${c.email},${c.phone},${c.role},${c.created_at}`)
                      .join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "clients_nailhouse.csv");
                  document.body.appendChild(link);
                  link.click();
                }}
                className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 font-semibold"
              >
                Exporter Clients (CSV)
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <h3 className="font-serif text-3xl font-bold text-primary mt-2">
                  {(clients.data ?? []).length}
                </h3>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Total Réservations</p>
                <h3 className="font-serif text-3xl font-bold text-primary mt-2">
                  {(bookings.data ?? []).length}
                </h3>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Prestations Actives</p>
                <h3 className="font-serif text-3xl font-bold text-primary mt-2">
                  {(services.data ?? []).length}
                </h3>
              </div>
            </div>
          </TabsContent>

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
                  {(bookings.data ?? []).map((b) => {
                    const isExpanded = expandedBookingId === b.id;
                    return (
                      <Fragment key={b.id}>
                        <TableRow
                          className="hover:bg-muted/10 cursor-pointer transition-colors"
                          onClick={() => setExpandedBookingId(isExpanded ? null : b.id)}
                        >
                          <TableCell className="whitespace-nowrap font-medium">
                            {new Date(b.scheduled_at).toLocaleString("fr-FR")}
                            {b.proposed_scheduled_at && (
                              <div className="text-[10px] text-amber-500 font-medium mt-0.5">
                                Proposé: {new Date(b.proposed_scheduled_at).toLocaleString("fr-FR")}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-serif text-primary font-semibold">
                            {b.name}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div>{b.phone}</div>
                            <div className="text-muted-foreground">{b.email}</div>
                          </TableCell>
                          <TableCell>{b.service_name}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
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
                        {isExpanded && (
                          <TableRow className="bg-muted/5 hover:bg-muted/5 border-t-0">
                            <TableCell colSpan={5} className="p-4">
                              <div className="grid gap-6 md:grid-cols-2 bg-card border border-gold/15 p-5 rounded-xl animate-in slide-in-from-top-2 duration-200">
                                {/* Left column: Notes and Admin Comments */}
                                <div className="space-y-4">
                                  {(() => {
                                    const clientProf = (clients.data ?? []).find(
                                      (c) => c.email.toLowerCase() === b.email.toLowerCase(),
                                    );
                                    if (
                                      clientProf &&
                                      (clientProf.preferred_shape !== "none" ||
                                        clientProf.preferred_style !== "none" ||
                                        clientProf.preferred_length !== "none" ||
                                        clientProf.allergies_contraindications)
                                    ) {
                                      return (
                                        <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 shadow-sm">
                                          <h4 className="text-[10px] uppercase tracking-wider text-gold font-bold mb-2 flex items-center gap-1.5">
                                            <Sparkles className="h-3 w-3" /> Profil Beauté
                                          </h4>
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            {clientProf.preferred_length &&
                                              clientProf.preferred_length !== "none" && (
                                                <p>
                                                  <span className="text-muted-foreground">
                                                    Longueur:
                                                  </span>{" "}
                                                  <span className="font-semibold capitalize text-foreground">
                                                    {clientProf.preferred_length}
                                                  </span>
                                                </p>
                                              )}
                                            {clientProf.preferred_shape &&
                                              clientProf.preferred_shape !== "none" && (
                                                <p>
                                                  <span className="text-muted-foreground">
                                                    Forme:
                                                  </span>{" "}
                                                  <span className="font-semibold capitalize text-foreground">
                                                    {clientProf.preferred_shape}
                                                  </span>
                                                </p>
                                              )}
                                            {clientProf.preferred_style &&
                                              clientProf.preferred_style !== "none" && (
                                                <p>
                                                  <span className="text-muted-foreground">
                                                    Style:
                                                  </span>{" "}
                                                  <span className="font-semibold capitalize text-foreground">
                                                    {clientProf.preferred_style}
                                                  </span>
                                                </p>
                                              )}
                                            {clientProf.allergies_contraindications && (
                                              <p className="col-span-2 text-amber-500 font-medium mt-1">
                                                ⚠️ Allergies:{" "}
                                                {clientProf.allergies_contraindications}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                  <div>
                                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                                      Notes de la cliente
                                    </h4>
                                    <p className="text-xs text-foreground bg-muted/20 p-2.5 rounded-lg border border-border">
                                      {b.notes || "—"}
                                    </p>
                                  </div>

                                  <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                      Commentaire de l'Atelier (envoyé au client)
                                    </h4>
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Ajouter une note..."
                                        defaultValue={b.admin_comment || ""}
                                        id={`comment-${b.id}`}
                                        className="text-xs h-8.5 rounded-lg border-border focus-visible:ring-gold"
                                      />
                                      <Button
                                        size="sm"
                                        className="rounded-lg bg-gold text-white dark:text-ink font-semibold h-8.5 px-3 text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const val = (
                                            document.getElementById(
                                              `comment-${b.id}`,
                                            ) as HTMLInputElement
                                          )?.value;
                                          saveDetailsMut.mutate({ id: b.id, admin_comment: val });
                                        }}
                                      >
                                        Enregistrer
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Right column: Rescheduling */}
                                <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                                  <div className="space-y-1.5">
                                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                      Proposer un report de rendez-vous
                                    </h4>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                      <Input
                                        type="datetime-local"
                                        id={`resched-${b.id}`}
                                        defaultValue={
                                          b.proposed_scheduled_at
                                            ? new Date(b.proposed_scheduled_at)
                                                .toISOString()
                                                .slice(0, 16)
                                            : ""
                                        }
                                        className="text-xs h-8.5 rounded-lg border-border focus-visible:ring-gold flex-1"
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-lg border-gold/25 text-gold hover:bg-gold/5 font-semibold h-8.5 px-3 text-xs shrink-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const val = (
                                            document.getElementById(
                                              `resched-${b.id}`,
                                            ) as HTMLInputElement
                                          )?.value;
                                          if (!val) {
                                            toast.error("Veuillez choisir une date et heure");
                                            return;
                                          }
                                          saveDetailsMut.mutate({
                                            id: b.id,
                                            proposed_scheduled_at: new Date(val).toISOString(),
                                          });
                                        }}
                                      >
                                        Proposer
                                      </Button>
                                    </div>
                                    {b.proposed_scheduled_at && (
                                      <p className="text-[11px] text-amber-500 font-medium">
                                        ⚠️ Proposition envoyée :{" "}
                                        {new Date(b.proposed_scheduled_at).toLocaleString("fr-FR")}{" "}
                                        (En attente du client)
                                      </p>
                                    )}
                                  </div>

                                  <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">
                                      Créé le : {new Date(b.created_at).toLocaleString("fr-FR")}
                                    </span>
                                    <div className="flex gap-2">
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        className="text-destructive font-bold"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm("Annuler définitivement ce rendez-vous ?")) {
                                            saveDetailsMut.mutate({
                                              id: b.id,
                                              status: "cancelled",
                                              proposed_scheduled_at: null,
                                            });
                                          }
                                        }}
                                      >
                                        Annuler / Rejeter
                                      </Button>
                                      <Button
                                        size="xs"
                                        className="bg-gold text-white dark:text-ink font-bold"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          saveDetailsMut.mutate({ id: b.id, status: "confirmed" });
                                        }}
                                      >
                                        Confirmer / Valider
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
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
                  seasonal_price_fcfa: svcSeasonalPrice !== "" ? Number(svcSeasonalPrice) : null,
                  seasonal_price_start: svcSeasonalStart
                    ? new Date(svcSeasonalStart).toISOString()
                    : null,
                  seasonal_price_end: svcSeasonalEnd
                    ? new Date(svcSeasonalEnd).toISOString()
                    : null,
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
                <div className="border-t border-border/50 pt-4 sm:col-span-2 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-gold font-bold">
                    Tarification Saisonnière / Promotionnelle (Optionnel)
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="svcSeasonalPrice">Tarif Promotionnel (FCFA)</Label>
                      <Input
                        id="svcSeasonalPrice"
                        type="number"
                        value={svcSeasonalPrice}
                        onChange={(e) =>
                          setSvcSeasonalPrice(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Ex: 12000"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="svcSeasonalStart">Date de Début</Label>
                      <Input
                        id="svcSeasonalStart"
                        type="datetime-local"
                        value={svcSeasonalStart}
                        onChange={(e) => setSvcSeasonalStart(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="svcSeasonalEnd">Date de Fin</Label>
                      <Input
                        id="svcSeasonalEnd"
                        type="datetime-local"
                        value={svcSeasonalEnd}
                        onChange={(e) => setSvcSeasonalEnd(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-border/50 pt-4 sm:col-span-2 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-gold font-bold">
                    Options Avancées
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="svcImageUrl">Lien de l'image (URL)</Label>
                      <Input
                        id="svcImageUrl"
                        value={svcImageUrl}
                        onChange={(e) => setSvcImageUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="svcSort">Ordre d'affichage</Label>
                      <Input
                        id="svcSort"
                        type="number"
                        value={svcSort}
                        onChange={(e) => setSvcSort(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="svcIsActive"
                        checked={svcIsActive}
                        onChange={(e) => setSvcIsActive(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                      />
                      <Label htmlFor="svcIsActive" className="cursor-pointer">
                        Service Actif (Visible)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="svcIsAddon"
                        checked={svcIsAddon}
                        onChange={(e) => setSvcIsAddon(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                      />
                      <Label htmlFor="svcIsAddon" className="cursor-pointer">
                        Ceci est un Supplément (Add-on)
                      </Label>
                    </div>
                  </div>
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
                  {((services.data ?? []) as import("@/lib/mock-db").MockService[])
                    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                    .map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-serif text-primary font-semibold">
                          <div className="flex items-center gap-3">
                            {s.image_url ? (
                              <img
                                src={s.image_url}
                                alt=""
                                className="w-10 h-10 rounded-md object-cover border border-border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-muted/50 border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                                Img
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span>{s.name}</span>
                              <div className="flex gap-1 mt-0.5">
                                {s.is_active === false && (
                                  <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    Inactif
                                  </span>
                                )}
                                {s.is_addon && (
                                  <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    Supplément
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-xs font-medium text-gold">
                          {s.category}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold">{s.price_fcfa.toLocaleString("fr-FR")} F</div>
                          {s.seasonal_price_fcfa !== undefined &&
                            s.seasonal_price_fcfa !== null && (
                              <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                                Promo: {s.seasonal_price_fcfa.toLocaleString("fr-FR")} F
                              </div>
                            )}
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

          <TabsContent value="promotions" className="outline-none space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-primary font-semibold">
                Gestion des Codes Promos & Réductions
              </h2>
              <span className="text-sm text-muted-foreground">
                {promotionsQuery.data?.length ?? 0} codes créés
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
              {/* Table of promo codes */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Réduction</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Détails / Cible</TableHead>
                      <TableHead>Période d'activité</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(promotionsQuery.data ?? []).map((promo) => {
                      const svc = (services.data ?? []).find((s) => s.id === promo.service_id);
                      return (
                        <TableRow key={promo.id}>
                          <TableCell className="font-bold text-gold tracking-wider uppercase">
                            {promo.code}
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            -{promo.discount_percent}%
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                promo.active
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {promo.active ? "Actif" : "Inactif"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            <div className="font-medium text-foreground">{promo.description}</div>
                            {svc && (
                              <div className="text-[10px] text-gold uppercase tracking-wider font-semibold mt-0.5">
                                Cible: {svc.name}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {promo.start_date || promo.end_date ? (
                              <>
                                {promo.start_date
                                  ? new Date(promo.start_date).toLocaleDateString("fr-FR")
                                  : "Début"}
                                {" - "}
                                {promo.end_date
                                  ? new Date(promo.end_date).toLocaleDateString("fr-FR")
                                  : "Fin"}
                              </>
                            ) : (
                              "Permanent"
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Supprimer ce code promo ?")) {
                                  deletePromoMut.mutate(promo.id);
                                }
                              }}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(promotionsQuery.data ?? []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                          Aucun code promo pour le moment.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Form to create promo code */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createPromoMut.mutate({
                    code: promoCodeState.trim().toUpperCase(),
                    discount_percent: Number(promoPercent),
                    description: promoDesc.trim(),
                    active: promoActive,
                    service_id: promoServiceId === "all" ? null : promoServiceId,
                    start_date: promoStart ? new Date(promoStart).toISOString() : null,
                    end_date: promoEnd ? new Date(promoEnd).toISOString() : null,
                  });
                }}
                className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="font-serif text-base text-primary font-bold">Créer un code promo</h3>

                <div className="space-y-1.5">
                  <Label htmlFor="promoCode">Code de réduction</Label>
                  <Input
                    id="promoCode"
                    value={promoCodeState}
                    onChange={(e) => setPromoCodeState(e.target.value)}
                    placeholder="Ex: SUMMER20"
                    required
                    className="uppercase tracking-wider font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="promoPercent">Pourcentage de rabais (%)</Label>
                  <Input
                    id="promoPercent"
                    type="number"
                    min={0}
                    max={100}
                    value={promoPercent}
                    onChange={(e) => setPromoPercent(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="promoDesc">Description / Conditions</Label>
                  <Textarea
                    id="promoDesc"
                    value={promoDesc}
                    onChange={(e) => setPromoDesc(e.target.value)}
                    placeholder="Ex: 20% de rabais sur tout le site"
                    required
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Prestation ciblée (Optionnel)</Label>
                  <Select value={promoServiceId} onValueChange={setPromoServiceId}>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les prestations</SelectItem>
                      {(services.data ?? []).map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2 grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="promoStart">Début de validité</Label>
                    <Input
                      id="promoStart"
                      type="datetime-local"
                      value={promoStart}
                      onChange={(e) => setPromoStart(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="promoEnd">Fin de validité</Label>
                    <Input
                      id="promoEnd"
                      type="datetime-local"
                      value={promoEnd}
                      onChange={(e) => setPromoEnd(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="promoActive"
                    checked={promoActive}
                    onChange={(e) => setPromoActive(e.checked ?? e.target.checked)}
                    className="rounded text-gold focus:ring-gold/30 h-4 w-4 accent-gold cursor-pointer"
                  />
                  <Label htmlFor="promoActive" className="cursor-pointer">
                    Code actif immédiatement
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={createPromoMut.isPending}
                  className="w-full rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 font-semibold mt-2"
                >
                  {createPromoMut.isPending ? "Création..." : "Générer le code"}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* ── CONFIGURATION TAB ──────────────────────────────────────────────────────── */}
          <TabsContent value="configuration" className="animate-in fade-in duration-300">
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateSettingsMut.mutate({
                    opening_time: cfgOpen,
                    closing_time: cfgClose,
                    closed_days: cfgClosedDays,
                    blocked_dates: cfgBlocked,
                    buffer_time_mins: cfgBuffer,
                  });
                }}
                className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
              >
                <div>
                  <h3 className="font-serif text-xl text-primary font-bold">Paramètres Généraux</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configurez les horaires et les règles de votre salon.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cfgOpen">Heure d'ouverture</Label>
                    <Input
                      id="cfgOpen"
                      type="time"
                      value={cfgOpen}
                      onChange={(e) => setCfgOpen(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cfgClose">Heure de fermeture</Label>
                    <Input
                      id="cfgClose"
                      type="time"
                      value={cfgClose}
                      onChange={(e) => setCfgClose(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cfgBuffer">Temps de battement entre chaque RDV (minutes)</Label>
                  <Input
                    id="cfgBuffer"
                    type="number"
                    min={0}
                    step={5}
                    value={cfgBuffer}
                    onChange={(e) => setCfgBuffer(Number(e.target.value))}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Utile pour ranger et nettoyer le poste de travail.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Jours de fermeture hebdomadaire</Label>
                  <div className="flex flex-wrap gap-3">
                    {["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map(
                      (day, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 cursor-pointer bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50 hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            checked={cfgClosedDays.includes(i)}
                            onChange={(e) => {
                              if (e.target.checked) setCfgClosedDays([...cfgClosedDays, i]);
                              else setCfgClosedDays(cfgClosedDays.filter((d) => d !== i));
                            }}
                            className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                          />
                          <span className="text-sm font-medium">{day}</span>
                        </label>
                      ),
                    )}
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-6">
                  <Label>Jours fériés & Congés (Dates bloquées)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={cfgNewBlocked}
                      onChange={(e) => setCfgNewBlocked(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (cfgNewBlocked && !cfgBlocked.includes(cfgNewBlocked)) {
                          setCfgBlocked([...cfgBlocked, cfgNewBlocked]);
                          setCfgNewBlocked("");
                        }
                      }}
                    >
                      Ajouter
                    </Button>
                  </div>
                  {cfgBlocked.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {cfgBlocked.sort().map((d) => (
                        <div
                          key={d}
                          className="flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-red-100"
                        >
                          {new Date(d).toLocaleDateString("fr-FR")}
                          <button
                            type="button"
                            onClick={() => setCfgBlocked(cfgBlocked.filter((x) => x !== d))}
                            className="hover:bg-red-200 rounded-full p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={updateSettingsMut.isPending}
                  className="w-full mt-4 bg-gold hover:bg-gold/90 text-white rounded-full"
                >
                  {updateSettingsMut.isPending ? "Sauvegarde..." : "Enregistrer les paramètres"}
                </Button>
              </form>
            </div>
          </TabsContent>
          <TabsContent value="videos" className="mt-8 animate-in fade-in-50 duration-500">
            <div className="grid lg:grid-cols-12 gap-8">
              {/* VIDEO LIST */}
              <div className="lg:col-span-8 bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
                <h3 className="font-serif text-2xl text-primary mb-6">Vidéos Promotionnelles</h3>
                {videosQuery.isLoading ? (
                  <p>Chargement...</p>
                ) : !videosQuery.data?.length ? (
                  <p className="text-sm text-muted-foreground">Aucune vidéo.</p>
                ) : (
                  <div className="space-y-4">
                    {videosQuery.data.map((vid) => (
                      <div
                        key={vid.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-xl"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-24 h-16 bg-black rounded-md overflow-hidden relative border border-border">
                            {(() => {
                              const resolved = resolveAssetUrl(vid.url);
                              return resolved.endsWith(".html") ? (
                                <iframe
                                  src={resolved}
                                  className="w-full h-full border-0 object-cover"
                                  title={vid.title}
                                  sandbox="allow-scripts allow-same-origin"
                                />
                              ) : (
                                <video
                                  src={resolved}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                              );
                            })()}
                          </div>
                          <div>
                            <h4 className="font-medium">{vid.title}</h4>
                            <p className="text-xs text-muted-foreground truncate max-w-sm">
                              {vid.description}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-sm">
                                {vid.category}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${vid.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                              >
                                {vid.active ? "Actif" : "Inactif"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingVidId(vid.id);
                              setVidUrl(vid.url);
                              setVidTitle(vid.title);
                              setVidDesc(vid.description);
                              setVidCat(vid.category);
                              setVidActive(vid.active);
                              setVidSort(String(vid.sort));
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              if (confirm("Supprimer cette vidéo ?")) {
                                deleteVideoMut.mutate(vid.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VIDEO FORM */}
              <div className="lg:col-span-4 bg-muted/30 rounded-2xl border border-border/40 p-6">
                <h3 className="font-serif text-xl text-primary mb-4">
                  {editingVidId ? "Modifier la vidéo" : "Ajouter une vidéo"}
                </h3>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!vidUrl || !vidTitle) return;
                    if (editingVidId) {
                      updateVideoMut.mutate({
                        id: editingVidId,
                        url: vidUrl,
                        title: vidTitle,
                        description: vidDesc,
                        category: vidCat,
                        active: vidActive,
                        sort: parseInt(vidSort) || 0,
                      });
                    } else {
                      addVideoMut.mutate({
                        url: vidUrl,
                        title: vidTitle,
                        description: vidDesc,
                        category: vidCat,
                        active: vidActive,
                        sort: parseInt(vidSort) || 0,
                      });
                    }
                  }}
                >
                  <div className="space-y-2">
                    <Label>URL de la vidéo (MP4/WebM)</Label>
                    <Input
                      value={vidUrl}
                      onChange={(e) => setVidUrl(e.target.value)}
                      placeholder="https://...mp4"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input
                      value={vidTitle}
                      onChange={(e) => setVidTitle(e.target.value)}
                      placeholder="Nom de la réalisation"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Input
                      value={vidCat}
                      onChange={(e) => setVidCat(e.target.value)}
                      placeholder="e.g. mains, pieds"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={vidDesc}
                      onChange={(e) => setVidDesc(e.target.value)}
                      placeholder="Brève description..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ordre (Tri)</Label>
                      <Input
                        type="number"
                        value={vidSort}
                        onChange={(e) => setVidSort(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 flex flex-col justify-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vidActive}
                          onChange={(e) => setVidActive(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm font-medium">Visible</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button
                      type="submit"
                      disabled={addVideoMut.isPending || updateVideoMut.isPending}
                      className="flex-1 bg-gold hover:bg-gold/90 text-white"
                    >
                      {editingVidId ? "Mettre à jour" : "Ajouter"}
                    </Button>
                    {editingVidId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingVidId(null);
                          setVidUrl("");
                          setVidTitle("");
                          setVidDesc("");
                        }}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

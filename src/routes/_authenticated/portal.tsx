import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useI18n } from "@/hooks/use-i18n";
import {
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  cancelUserBooking,
  getUserFavorites,
  removeUserFavorite,
  getUserMessages,
  sendUserMessage,
  getUserNotifications,
  markUserNotificationsAsRead,
  updateUserBookingDetails,
} from "@/lib/portal.functions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  CalendarDays,
  CalendarIcon,
  Sparkles,
  User,
  Heart,
  MessageSquare,
  Bell,
  Trash2,
  Clock,
  ArrowRight,
  Send,
  MailCheck,
  Instagram,
  ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal")({
  component: ClientPortalPage,
});

const EDIT_TIME_SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 9; h < 19; h++)
    for (const m of [0, 30]) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  return out;
})();

function ClientPortalPage() {
  const { language, t } = useI18n();
  const qc = useQueryClient();

  // Server functions
  const getProfileFn = useServerFn(getUserProfile);
  const updateProfileFn = useServerFn(updateUserProfile);
  const getBookingsFn = useServerFn(getUserBookings);
  const cancelBookingFn = useServerFn(cancelUserBooking);
  const updateBookingDetailsFn = useServerFn(updateUserBookingDetails);
  const getFavsFn = useServerFn(getUserFavorites);
  const removeFavFn = useServerFn(removeUserFavorite);
  const getMsgsFn = useServerFn(getUserMessages);
  const sendMsgFn = useServerFn(sendUserMessage);
  const getNotifsFn = useServerFn(getUserNotifications);
  const markReadFn = useServerFn(markUserNotificationsAsRead);

  // React Query bindings
  const profileQuery = useQuery({ queryKey: ["portal", "profile"], queryFn: () => getProfileFn() });
  const bookingsQuery = useQuery({
    queryKey: ["portal", "bookings"],
    queryFn: () => getBookingsFn(),
  });
  const favsQuery = useQuery({ queryKey: ["portal", "favorites"], queryFn: () => getFavsFn() });
  const msgsQuery = useQuery({
    queryKey: ["portal", "messages"],
    queryFn: () => getMsgsFn(),
    refetchInterval: 5000,
  });
  const notifsQuery = useQuery({
    queryKey: ["portal", "notifications"],
    queryFn: () => getNotifsFn(),
  });

  // State
  const [activeTab, setActiveTab] = useState("bookings");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [newsletterSub, setNewsletterSub] = useState(true);
  const [birthday, setBirthday] = useState("");
  const [preferredStylist, setPreferredStylist] = useState("");
  const [instagram, setInstagram] = useState("");
  const [preferredLength, setPreferredLength] = useState<"short" | "medium" | "long" | "none">(
    "none",
  );
  const [preferredShape, setPreferredShape] = useState<
    "round" | "square" | "oval" | "almond" | "coffin" | "stiletto" | "none"
  >("none");
  const [preferredStyle, setPreferredStyle] = useState<
    "natural" | "classic" | "french" | "nail_art" | "biab" | "none"
  >("none");
  const [allergies, setAllergies] = useState("");

  // Booking edit states
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<Date>();
  const [editTime, setEditTime] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Sync profile details state
  useEffect(() => {
    if (profileQuery.data) {
      setProfileName(profileQuery.data.name || "");
      setProfilePhone(profileQuery.data.phone || "");
      setNewsletterSub(profileQuery.data.newsletter);
      setBirthday(profileQuery.data.birthday || "");
      setPreferredStylist(profileQuery.data.preferred_stylist || "");
      setInstagram(profileQuery.data.instagram || "");
      setPreferredLength(
        (profileQuery.data.preferred_length || "none") as "short" | "medium" | "long" | "none",
      );
      setPreferredShape(
        (profileQuery.data.preferred_shape || "none") as
          | "round"
          | "square"
          | "oval"
          | "almond"
          | "coffin"
          | "stiletto"
          | "none",
      );
      setPreferredStyle(
        (profileQuery.data.preferred_style || "none") as
          | "natural"
          | "classic"
          | "french"
          | "nail_art"
          | "biab"
          | "none",
      );
      setAllergies(profileQuery.data.allergies_contraindications || "");
    }
  }, [profileQuery.data]);

  // Mutations
  const updateProfileMut = useMutation({
    mutationFn: (data: {
      name: string;
      phone: string;
      birthday?: string;
      preferred_stylist?: string;
      instagram?: string;
      preferred_length?: "short" | "medium" | "long" | "none";
      preferred_shape?: "round" | "square" | "oval" | "almond" | "coffin" | "stiletto" | "none";
      preferred_style?: "natural" | "classic" | "french" | "nail_art" | "biab" | "none";
      allergies_contraindications?: string;
    }) => updateProfileFn({ data }),
    onSuccess: () => {
      toast.success(
        language === "en" ? "Profile updated successfully." : "Profil mis à jour avec succès.",
      );
      qc.invalidateQueries({ queryKey: ["portal", "profile"] });
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const cancelBookingMut = useMutation({
    mutationFn: (id: string) => cancelBookingFn({ data: { id } }),
    onSuccess: () => {
      toast.success(language === "en" ? "Appointment cancelled." : "Rendez-vous annulé.");
      qc.invalidateQueries({ queryKey: ["portal", "bookings"] });
      qc.invalidateQueries({ queryKey: ["portal", "notifications"] });
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const saveBookingEditMut = useMutation({
    mutationFn: ({
      id,
      notes,
      scheduled_at,
    }: {
      id: string;
      notes?: string | null;
      scheduled_at?: string | null;
    }) => updateBookingDetailsFn({ data: { id, notes, scheduled_at } }),
    onSuccess: () => {
      toast.success(
        language === "en" ? "Booking updated successfully." : "Rendez-vous mis à jour avec succès.",
      );
      setEditingBookingId(null);
      qc.invalidateQueries({ queryKey: ["portal", "bookings"] });
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const acceptRescheduleMut = useMutation({
    mutationFn: ({ id, scheduled_at }: { id: string; scheduled_at: string }) =>
      updateBookingDetailsFn({
        data: { id, scheduled_at, proposed_scheduled_at: null, status: "confirmed" },
      }),
    onSuccess: () => {
      toast.success(language === "en" ? "Reschedule accepted." : "Nouveau créneau accepté.");
      qc.invalidateQueries({ queryKey: ["portal", "bookings"] });
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const rejectRescheduleMut = useMutation({
    mutationFn: (id: string) =>
      updateBookingDetailsFn({ data: { id, proposed_scheduled_at: null } }),
    onSuccess: () => {
      toast.success(language === "en" ? "Reschedule declined." : "Nouveau créneau décliné.");
      qc.invalidateQueries({ queryKey: ["portal", "bookings"] });
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const startEdit = (b: { id: string; scheduled_at: string; notes?: string | null }) => {
    setEditingBookingId(b.id);
    setEditDate(new Date(b.scheduled_at));
    const d = new Date(b.scheduled_at);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    setEditTime(`${h}:${m}`);
    setEditNotes(b.notes || "");
  };

  const saveEdit = (id: string) => {
    if (!editDate || !editTime) {
      toast.error(
        language === "en"
          ? "Please select a date and time."
          : "Veuillez sélectionner une date et une heure.",
      );
      return;
    }
    const [hh, mm] = editTime.split(":").map(Number);
    const scheduled = new Date(editDate);
    scheduled.setHours(hh, mm, 0, 0);

    saveBookingEditMut.mutate({
      id,
      notes: editNotes || null,
      scheduled_at: scheduled.toISOString(),
    });
  };

  const removeFavMut = useMutation({
    mutationFn: (serviceId: string) => removeFavFn({ data: { serviceId } }),
    onSuccess: () => {
      toast.success(
        language === "en" ? "Service removed from favorites." : "Soin retiré de vos favoris.",
      );
      qc.invalidateQueries({ queryKey: ["portal", "favorites"] });
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const sendMsgMut = useMutation({
    mutationFn: (message: string) => sendMsgFn({ data: { message } }),
    onSuccess: () => {
      setChatMessage("");
      qc.invalidateQueries({ queryKey: ["portal", "messages"] });
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const markReadMut = useMutation({
    mutationFn: () => markReadFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal", "notifications"] });
    },
  });

  // Chat scroll anchor
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab, msgsQuery.data]);

  // Notifications read trigger
  useEffect(() => {
    if (activeTab === "notifications" && notifsQuery.data?.some((n) => !n.read)) {
      markReadMut.mutate();
    }
  }, [activeTab, notifsQuery.data, markReadMut]);

  const unreadNotifsCount = notifsQuery.data?.filter((n) => !n.read).length || 0;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-5 py-12">
        {/* Portal Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gold/15 pb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
              {t("portal_title")}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-primary md:text-4xl">
              {profileQuery.data?.name
                ? `${language === "en" ? "Welcome back," : "Ravi de vous revoir,"} ${profileQuery.data.name}`
                : t("portal_welcome")}
            </h1>
          </div>
          <Button
            asChild
            className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 font-semibold shadow-lg shadow-gold/10 shrink-0 self-start sm:self-auto"
          >
            <Link to="/booking">
              {language === "en" ? "Book an appointment" : "Prendre rendez-vous"}
            </Link>
          </Button>
        </div>

        {/* Portal Tab Structure */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto bg-transparent border-b border-border p-0 gap-6 rounded-none">
            <TabsTrigger
              value="bookings"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <CalendarDays className="h-4.5 w-4.5" />
              {t("portal_bookings_tab")}
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Heart className="h-4.5 w-4.5" />
              {t("portal_favorites_tab")}
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <MessageSquare className="h-4.5 w-4.5" />
              {t("portal_chat_tab")}
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <User className="h-4.5 w-4.5" />
              {t("portal_profile_tab")}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="relative flex items-center gap-2 px-1 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Bell className="h-4.5 w-4.5" />
              {t("portal_settings_tab")}
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-2 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-white dark:text-ink animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB: BOOKINGS ─────────────────────────────────────────────────── */}
          <TabsContent value="bookings" className="space-y-4 outline-none">
            {bookingsQuery.isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Chargement…</div>
            ) : !bookingsQuery.data || bookingsQuery.data.length === 0 ? (
              <Card className="border-dashed border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="h-10 w-10 text-gold/40 mb-4" />
                  <p className="text-muted-foreground text-sm font-medium">
                    {t("portal_no_bookings")}
                  </p>
                  <Button
                    asChild
                    className="mt-6 rounded-full bg-gold text-white dark:text-ink font-semibold"
                  >
                    <Link to="/booking">
                      {language === "en" ? "Discover our catalog" : "Découvrir la carte"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {bookingsQuery.data.map((b) => {
                  const dateStr = new Date(b.scheduled_at).toLocaleDateString(
                    language === "en" ? "en-US" : "fr-FR",
                    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
                  );
                  const timeStr = new Date(b.scheduled_at).toLocaleTimeString(
                    language === "en" ? "en-US" : "fr-FR",
                    { hour: "2-digit", minute: "2-digit" },
                  );

                  const isEditing = editingBookingId === b.id;

                  return (
                    <Card
                      key={b.id}
                      className="border border-border bg-card overflow-hidden hover:border-gold/30 transition-all duration-200 shadow-sm flex flex-col"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-semibold ${
                              b.status === "confirmed"
                                ? "bg-gold/15 text-gold border border-gold/35"
                                : b.status === "completed"
                                  ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                  : b.status === "cancelled"
                                    ? "bg-red-500/10 text-red-600 border border-red-500/25"
                                    : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {b.status === "pending"
                              ? language === "en"
                                ? "pending confirmation"
                                : "en attente"
                              : b.status}
                          </span>
                          {!isEditing && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {timeStr}
                            </span>
                          )}
                        </div>
                        <CardTitle className="font-serif text-lg text-primary mt-2">
                          {b.service_name}
                        </CardTitle>
                        {!isEditing && (
                          <CardDescription className="font-medium text-foreground/80 mt-1">
                            {dateStr}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-3 pb-4">
                        {isEditing ? (
                          <div className="space-y-3 pt-2">
                            {/* Date Picker inline */}
                            <div className="space-y-1">
                              <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                                {language === "en" ? "Date" : "Date"}
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal rounded-xl border-border focus:ring-gold text-xs h-9",
                                      !editDate && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-gold/60" />
                                    {editDate ? (
                                      format(editDate, "PPP", {
                                        locale: language === "en" ? enUS : fr,
                                      })
                                    ) : (
                                      <span>Choisir une date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0 rounded-2xl border-gold/15 shadow-xl bg-background"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={editDate}
                                    onSelect={setEditDate}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                    className="rounded-2xl border-none p-3"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Time Slot inline */}
                            <div className="space-y-1">
                              <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                                {language === "en" ? "Time Slot" : "Créneau Horaire"}
                              </Label>
                              <select
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs focus:border-gold focus:outline-none h-9 text-foreground"
                              >
                                {EDIT_TIME_SLOTS.map((tSlot) => (
                                  <option key={tSlot} value={tSlot}>
                                    {tSlot}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Notes inline */}
                            <div className="space-y-1">
                              <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                                Notes
                              </Label>
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                rows={2}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-gold focus:outline-none resize-none text-foreground"
                                placeholder="Instructions spéciales..."
                              />
                            </div>

                            {/* Save/Cancel Buttons */}
                            <div className="flex justify-end gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingBookingId(null)}
                                className="rounded-full h-8 px-4 text-xs font-semibold text-muted-foreground"
                              >
                                {language === "en" ? "Cancel" : "Annuler"}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => saveEdit(b.id)}
                                className="rounded-full h-8 px-4 text-xs bg-gold text-white dark:text-ink font-semibold"
                                disabled={saveBookingEditMut.isPending}
                              >
                                {saveBookingEditMut.isPending
                                  ? "..."
                                  : language === "en"
                                    ? "Save"
                                    : "Enregistrer"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              {b.notes && (
                                <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/50">
                                  <span className="font-semibold text-foreground/75 block mb-0.5">
                                    {language === "en" ? "Your notes:" : "Vos remarques :"}
                                  </span>
                                  {b.notes}
                                </p>
                              )}

                              {b.admin_comment && (
                                <div className="p-2.5 rounded-lg border border-gold/15 bg-gold/5 text-xs text-foreground/90 animate-in fade-in">
                                  <span className="font-bold text-gold flex items-center gap-1 mb-0.5">
                                    <Sparkles className="h-3 w-3" />
                                    {language === "en"
                                      ? "Atelier Comment:"
                                      : "Commentaire de l'Atelier :"}
                                  </span>
                                  {b.admin_comment}
                                </div>
                              )}

                              {b.proposed_scheduled_at && (
                                <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl space-y-2.5 animate-in fade-in duration-300">
                                  <div className="flex items-start gap-2">
                                    <Clock className="h-4.5 w-4.5 text-gold shrink-0 mt-0.5" />
                                    <div className="text-xs">
                                      <p className="font-semibold text-gold">
                                        {language === "en"
                                          ? "Reschedule Proposed"
                                          : "Proposition de report"}
                                      </p>
                                      <p className="text-muted-foreground mt-1">
                                        {language === "en"
                                          ? "New proposed date:"
                                          : "Nouvelle date proposée :"}
                                      </p>
                                      <p className="font-serif text-primary font-medium mt-0.5">
                                        {new Date(b.proposed_scheduled_at).toLocaleDateString(
                                          language === "en" ? "en-US" : "fr-FR",
                                          {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          },
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 text-xs pt-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-full border-red-500/30 text-destructive hover:bg-red-500/10 h-7.5 px-3 font-semibold"
                                      onClick={() => rejectRescheduleMut.mutate(b.id)}
                                      disabled={rejectRescheduleMut.isPending}
                                    >
                                      {language === "en" ? "Decline" : "Refuser"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 h-7.5 px-3 font-semibold"
                                      onClick={() =>
                                        acceptRescheduleMut.mutate({
                                          id: b.id,
                                          scheduled_at: b.proposed_scheduled_at!,
                                        })
                                      }
                                      disabled={acceptRescheduleMut.isPending}
                                    >
                                      {language === "en" ? "Accept" : "Accepter"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {["pending", "confirmed"].includes(b.status) &&
                              !b.proposed_scheduled_at && (
                                <div className="flex justify-end gap-2 mt-auto pt-2 border-t border-border/40">
                                  <Button
                                    onClick={() => startEdit(b)}
                                    variant="outline"
                                    className="text-xs border-gold/25 text-gold hover:bg-gold/5 rounded-full h-8 px-4 font-semibold"
                                  >
                                    {language === "en"
                                      ? "Modify / Reschedule"
                                      : "Modifier / Reporter"}
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      if (
                                        confirm(
                                          language === "en"
                                            ? "Cancel appointment?"
                                            : "Annuler le rendez-vous ?",
                                        )
                                      ) {
                                        cancelBookingMut.mutate(b.id);
                                      }
                                    }}
                                    variant="ghost"
                                    className="text-xs text-destructive hover:bg-destructive/10 rounded-full h-8 px-4 font-semibold"
                                  >
                                    {language === "en" ? "Cancel" : "Annuler"}
                                  </Button>
                                </div>
                              )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── TAB: FAVORITES ────────────────────────────────────────────────── */}
          <TabsContent value="favorites" className="space-y-4 outline-none">
            {favsQuery.isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Chargement…</div>
            ) : !favsQuery.data || favsQuery.data.length === 0 ? (
              <Card className="border-dashed border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Heart className="h-10 w-10 text-gold/40 mb-4" />
                  <p className="text-muted-foreground text-sm font-medium">
                    {t("portal_no_favorites")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {favsQuery.data.map((fav) => (
                  <Card
                    key={fav.id}
                    className="border border-border bg-card hover:border-gold/30 transition-all duration-200 shadow-sm flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold">
                            {fav.category}
                          </span>
                          <CardTitle className="font-serif text-lg text-primary mt-1">
                            {fav.name}
                          </CardTitle>
                        </div>
                        <button
                          onClick={() => removeFavMut.mutate(fav.id)}
                          className="text-muted-foreground hover:text-destructive transition p-1 hover:bg-muted rounded-full"
                          aria-label="Remove favorite"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                      <CardDescription className="text-xs leading-relaxed text-muted-foreground line-clamp-2 mt-1">
                        {fav.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 pt-0 mt-auto flex items-center justify-between border-t border-muted/60 pt-3">
                      <span className="font-serif text-base text-gold font-bold">
                        {fav.price_fcfa.toLocaleString("fr-FR")} FCFA
                      </span>
                      <Button
                        asChild
                        size="sm"
                        className="rounded-full bg-gold text-white dark:text-ink hover:bg-gold/90 text-xs font-semibold px-4"
                      >
                        <Link to="/booking" search={{ service: fav.id }}>
                          {language === "en" ? "Book" : "Réserver"}{" "}
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── TAB: MESSAGERIE ────────────────────────────────────────────────── */}
          <TabsContent value="chat" className="space-y-4 outline-none">
            <Card className="border border-border bg-card overflow-hidden flex flex-col h-[500px] shadow-md">
              <CardHeader className="border-b border-gold/15 bg-muted/20 py-4 px-6">
                <CardTitle className="font-serif text-lg text-primary flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gold" />
                  {t("portal_chat_with_admin")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gold/20">
                {msgsQuery.isLoading ? (
                  <div className="text-center text-sm text-muted-foreground py-10">Chargement…</div>
                ) : !msgsQuery.data || msgsQuery.data.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-12">
                    {language === "en"
                      ? "Send a message to start communicating with the team."
                      : "Envoyez un message pour entamer la communication avec l'équipe."}
                  </div>
                ) : (
                  msgsQuery.data.map((msg) => {
                    const isAdmin = msg.sender_id === "mock-admin-id-456";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[75%] rounded-2xl px-4.5 py-3 ${
                          isAdmin
                            ? "bg-muted text-foreground self-start rounded-tl-none border border-border"
                            : "bg-[#6D5337] text-white dark:bg-gold dark:text-ink self-end rounded-tr-none shadow-sm"
                        }`}
                      >
                        <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                        <span
                          className={`text-[8.5px] mt-1 self-end ${
                            isAdmin ? "text-muted-foreground" : "text-white/60 dark:text-ink/60"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString(
                            language === "en" ? "en-US" : "fr-FR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </CardContent>
              <div className="border-t border-border p-4 bg-muted/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (chatMessage.trim()) sendMsgMut.mutate(chatMessage);
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={t("portal_message_placeholder")}
                    className="rounded-full border-border focus-visible:ring-gold py-5 px-5 bg-background flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!chatMessage.trim() || sendMsgMut.isPending}
                    className="rounded-full bg-gold h-10 w-10 p-0 text-white dark:text-ink hover:bg-gold/90 shrink-0 shadow-md shadow-gold/10"
                    aria-label="Send message"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </Button>
                </form>
              </div>
            </Card>
          </TabsContent>

          {/* ─── TAB: PROFIL ───────────────────────────────────────────────────── */}
          <TabsContent value="profile" className="space-y-4 outline-none">
            <Card className="border border-gold/15 bg-card/45 backdrop-blur-md rounded-[2.2rem] shadow-xl overflow-hidden">
              <CardHeader className="border-b border-gold/10 pb-6">
                <CardTitle className="font-serif text-2xl text-primary font-medium tracking-wide">
                  {language === "en" ? "My Profile Settings" : "Mes informations personnelles"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {language === "en"
                    ? "Keep your details and beauty preferences updated so we can personalize your appointments."
                    : "Mettez à jour vos coordonnées et vos préférences beauté pour un rendez-vous personnalisé."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateProfileMut.mutate({
                      name: profileName,
                      phone: profilePhone,
                      birthday,
                      preferred_stylist: preferredStylist,
                      instagram,
                      preferred_length: preferredLength,
                      preferred_shape: preferredShape,
                      preferred_style: preferredStyle,
                      allergies_contraindications: allergies,
                    });
                  }}
                  className="space-y-8"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column: Personal info */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gold/80 border-b border-gold/10 pb-1.5 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-gold" />
                        {language === "en" ? "Contact Details" : "Coordonnées"}
                      </h3>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="prof-name"
                          className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                          {t("booking_field_name")} *
                        </Label>
                        <Input
                          id="prof-name"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          required
                          placeholder="Amina Bello"
                          className="rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/50 h-10.5"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="prof-phone"
                          className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                          {t("portal_phone_label")} *
                        </Label>
                        <Input
                          id="prof-phone"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          required
                          placeholder="6XX XXX XXX"
                          className="rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/50 h-10.5"
                        />
                      </div>

                      <div className="space-y-1.5 opacity-70">
                        <Label
                          htmlFor="prof-email"
                          className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                          {t("booking_field_email")}
                        </Label>
                        <Input
                          id="prof-email"
                          value={profileQuery.data?.email || ""}
                          disabled
                          className="rounded-xl border-border bg-muted cursor-not-allowed h-10.5"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="prof-instagram"
                          className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                          {language === "en" ? "Instagram Account" : "Compte Instagram"}
                        </Label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/85" />
                          <Input
                            id="prof-instagram"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="@votrecompte"
                            className="pl-9.5 rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/50 h-10.5"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="prof-birthday"
                          className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                          {language === "en" ? "Date of Birth" : "Date de naissance"}
                        </Label>
                        <Input
                          id="prof-birthday"
                          type="date"
                          value={birthday}
                          onChange={(e) => setBirthday(e.target.value)}
                          className="rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/50 h-10.5 cursor-pointer dark:[color-scheme:dark]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="prof-stylist"
                          className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                          {language === "en" ? "Preferred Stylist" : "Styliste Préférée"}
                        </Label>
                        <select
                          id="prof-stylist"
                          value={preferredStylist}
                          onChange={(e) => setPreferredStylist(e.target.value)}
                          className="w-full rounded-xl border border-border/80 focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-background/50 p-2.5 h-10.5 text-sm cursor-pointer outline-none transition-all"
                        >
                          <option value="">
                            {language === "en" ? "No preference" : "Aucune préférence"}
                          </option>
                          <option value="Alex">Alex</option>
                          <option value="Marie">Marie</option>
                          <option value="Sophie">Sophie</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column: Nail preferences */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gold/80 border-b border-gold/10 pb-1.5 flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-gold" />
                        {language === "en" ? "Nail Preferences" : "Préférences Ongles"}
                      </h3>

                      {/* Preference: Length */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          {language === "en" ? "Preferred Nail Length" : "Longueur d'ongles"}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: "short", label: language === "en" ? "Short" : "Court" },
                            { value: "medium", label: language === "en" ? "Medium" : "Moyen" },
                            { value: "long", label: language === "en" ? "Long" : "Long" },
                            {
                              value: "none",
                              label: language === "en" ? "No preference" : "Sans préférence",
                            },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setPreferredLength(
                                  opt.value as "short" | "medium" | "long" | "none",
                                )
                              }
                              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-300 cursor-pointer ${
                                preferredLength === opt.value
                                  ? "bg-gold border-gold text-ink font-semibold shadow-md"
                                  : "border-border hover:bg-gold/5 bg-background/25"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preference: Shape */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          {language === "en" ? "Preferred Nail Shape" : "Forme d'ongles"}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: "round", label: language === "en" ? "Round" : "Rond" },
                            { value: "square", label: language === "en" ? "Square" : "Carré" },
                            { value: "oval", label: language === "en" ? "Oval" : "Ovale" },
                            { value: "almond", label: language === "en" ? "Almond" : "Amande" },
                            { value: "coffin", label: language === "en" ? "Coffin" : "Coffin" },
                            {
                              value: "stiletto",
                              label: language === "en" ? "Stiletto" : "Stiletto",
                            },
                            {
                              value: "none",
                              label: language === "en" ? "None" : "Sans préférence",
                            },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setPreferredShape(
                                  opt.value as
                                    | "round"
                                    | "square"
                                    | "oval"
                                    | "almond"
                                    | "coffin"
                                    | "stiletto"
                                    | "none",
                                )
                              }
                              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-300 cursor-pointer ${
                                preferredShape === opt.value
                                  ? "bg-gold border-gold text-ink font-semibold shadow-md"
                                  : "border-border hover:bg-gold/5 bg-background/25"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preference: Style */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          {language === "en" ? "Preferred Style" : "Style préféré"}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: "natural", label: language === "en" ? "Natural" : "Naturel" },
                            {
                              value: "classic",
                              label: language === "en" ? "Classic" : "Classique",
                            },
                            { value: "french", label: language === "en" ? "French" : "French" },
                            {
                              value: "nail_art",
                              label: language === "en" ? "Nail Art" : "Nail Art",
                            },
                            { value: "biab", label: language === "en" ? "BIAB" : "BIAB" },
                            {
                              value: "none",
                              label: language === "en" ? "None" : "Sans préférence",
                            },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setPreferredStyle(
                                  opt.value as
                                    | "natural"
                                    | "classic"
                                    | "french"
                                    | "nail_art"
                                    | "biab"
                                    | "none",
                                )
                              }
                              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-300 cursor-pointer ${
                                preferredStyle === opt.value
                                  ? "bg-gold border-gold text-ink font-semibold shadow-md"
                                  : "border-border hover:bg-gold/5 bg-background/25"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Allergies & Sensitivities */}
                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <ShieldAlert className="h-4.5 w-4.5" />
                          <Label
                            htmlFor="prof-allergies"
                            className="text-xs font-semibold tracking-wider uppercase text-amber-500"
                          >
                            {language === "en"
                              ? "Allergies & Skin Sensitivities"
                              : "Allergies & Sensibilités"}
                          </Label>
                        </div>
                        <textarea
                          id="prof-allergies"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                          placeholder={
                            language === "en"
                              ? "E.g., sensitive to LED heat, allergy to specific gel products, thin nails..."
                              : "Ex: sensibilité à la chaleur des lampes LED, allergie à certains gels, ongles très fins..."
                          }
                          rows={3}
                          className="w-full rounded-xl border border-border/80 focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-background/50 p-3 text-xs outline-none transition-all duration-300"
                        />
                        <p className="text-[10px] text-muted-foreground/80 leading-normal italic">
                          {language === "en"
                            ? "* This information helps us select the safest builder products and techniques."
                            : "* Ces données nous aident à adapter nos produits pour assurer la santé de vos ongles."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gold/10">
                    <Button
                      type="submit"
                      disabled={updateProfileMut.isPending}
                      className="rounded-xl bg-gold hover:bg-gold/90 text-ink font-semibold tracking-wider transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 px-8 py-5 text-sm"
                    >
                      {updateProfileMut.isPending
                        ? language === "en"
                          ? "Saving..."
                          : "Enregistrement..."
                        : t("admin_btn_save")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB: NOTIFICATIONS / SETTINGS ──────────────────────────────────── */}
          <TabsContent value="notifications" className="space-y-6 outline-none">
            {/* Notification logs list */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="font-serif text-lg text-primary">
                  {language === "en" ? "Notifications Log" : "Journal des notifications"}
                </CardTitle>
                <Bell className="h-5 w-5 text-gold shrink-0" />
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {notifsQuery.isLoading ? (
                  <div className="text-center text-sm text-muted-foreground py-6">Chargement…</div>
                ) : !notifsQuery.data || notifsQuery.data.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">
                    {t("portal_no_notifications")}
                  </p>
                ) : (
                  notifsQuery.data.map((n) => (
                    <div
                      key={n.id}
                      className={`py-3.5 flex items-start gap-3.5 ${!n.read ? "bg-gold/5 px-2 rounded-lg -mx-2" : ""}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${!n.read ? "bg-gold animate-pulse" : "bg-muted-foreground/30"}`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-primary font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-muted-foreground mt-1 block">
                          {new Date(n.created_at).toLocaleDateString(
                            language === "en" ? "en" : "fr",
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Newsletter toggle checkbox */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-lg text-primary flex items-center gap-2">
                  <MailCheck className="h-5 w-5 text-gold shrink-0" />
                  {language === "en" ? "Newsletter Subscriptions" : "Newsletter & Offres"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="newsletter-sub"
                  checked={newsletterSub}
                  onChange={(e) => {
                    setNewsletterSub(e.target.checked);
                    toast.success(
                      language === "en" ? "Preferences updated." : "Préférences mises à jour.",
                    );
                  }}
                  className="h-4.5 w-4.5 accent-gold cursor-pointer"
                />
                <Label
                  htmlFor="newsletter-sub"
                  className="text-sm text-muted-foreground cursor-pointer font-medium select-none"
                >
                  {t("portal_newsletter_subscribe")}
                </Label>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

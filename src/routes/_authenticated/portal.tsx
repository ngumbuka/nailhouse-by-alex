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
} from "@/lib/portal.functions";
import {
  CalendarDays,
  User,
  Heart,
  MessageSquare,
  Bell,
  Trash2,
  Clock,
  ArrowRight,
  Send,
  MailCheck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal")({
  component: ClientPortalPage,
});

function ClientPortalPage() {
  const { language, t } = useI18n();
  const qc = useQueryClient();

  // Server functions
  const getProfileFn = useServerFn(getUserProfile);
  const updateProfileFn = useServerFn(updateUserProfile);
  const getBookingsFn = useServerFn(getUserBookings);
  const cancelBookingFn = useServerFn(cancelUserBooking);
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

  // Sync profile details state
  useEffect(() => {
    if (profileQuery.data) {
      setProfileName(profileQuery.data.name || "");
      setProfilePhone(profileQuery.data.phone || "");
      setNewsletterSub(profileQuery.data.newsletter);
    }
  }, [profileQuery.data]);

  // Mutations
  const updateProfileMut = useMutation({
    mutationFn: (data: { name: string; phone: string }) => updateProfileFn({ data }),
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

                  return (
                    <Card
                      key={b.id}
                      className="border border-border bg-card overflow-hidden hover:border-gold/30 transition-all duration-200 shadow-sm"
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
                            {b.status}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {timeStr}
                          </span>
                        </div>
                        <CardTitle className="font-serif text-lg text-primary mt-2">
                          {b.service_name}
                        </CardTitle>
                        <CardDescription className="font-medium text-foreground/80 mt-1">
                          {dateStr}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col justify-between h-[100px] pb-4">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {b.notes ? `Notes: ${b.notes}` : "—"}
                        </p>
                        {["pending", "confirmed"].includes(b.status) && (
                          <div className="flex justify-end gap-2 mt-auto">
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
            <Card className="border border-border bg-card shadow-sm max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="font-serif text-xl text-primary">
                  {language === "en" ? "My Profile Settings" : "Mes informations personnelles"}
                </CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Keep your details updated so we can reach you easily."
                    : "Mettez à jour vos coordonnées pour faciliter le suivi de vos rendez-vous."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateProfileMut.mutate({ name: profileName, phone: profilePhone });
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="prof-name">{t("booking_field_name")} *</Label>
                    <Input
                      id="prof-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      placeholder="Amina Bello"
                      className="rounded-xl border-border focus-visible:ring-gold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prof-phone">{t("portal_phone_label")} *</Label>
                    <Input
                      id="prof-phone"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      required
                      placeholder="6XX XXX XXX"
                      className="rounded-xl border-border focus-visible:ring-gold"
                    />
                  </div>
                  <div className="space-y-1.5 opacity-70">
                    <Label htmlFor="prof-email">{t("booking_field_email")}</Label>
                    <Input
                      id="prof-email"
                      value={profileQuery.data?.email || ""}
                      disabled
                      className="rounded-xl border-border bg-muted cursor-not-allowed"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={updateProfileMut.isPending}
                    className="rounded-full bg-gold px-8 text-white dark:text-ink hover:bg-gold/90 font-semibold mt-4 shadow-lg shadow-gold/10"
                  >
                    {t("admin_btn_save")}
                  </Button>
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

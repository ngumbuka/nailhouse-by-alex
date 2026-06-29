import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Lock, Sparkles, Loader2, Eye, EyeOff, User, Phone } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useServerFn } from "@tanstack/react-start";
import { isCurrentUserAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { ASSETS } from "@/lib/assets";
import { validateWhatsAppNumber } from "@/lib/phone-validation";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Connexion — NailHouse" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [followupPreference, setFollowupPreference] = useState<"call" | "messages" | "email">(
    "messages",
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkAdmin = useServerFn(isCurrentUserAdmin);

  useEffect(() => {
    async function checkSessionAndRedirect(
      session: import("@supabase/supabase-js").Session | null,
    ) {
      if (session) {
        try {
          const res = await checkAdmin();
          if (res?.isAdmin) {
            navigate({ to: "/admin" });
          } else {
            navigate({ to: "/portal" });
          }
        } catch (err) {
          navigate({ to: "/portal" });
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSessionAndRedirect(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSessionAndRedirect(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, checkAdmin]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Connexion réussie ! Bienvenue.");
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error("Le nom est requis.");
    }
    if (!phone.trim()) {
      return toast.error("Le numéro WhatsApp est requis.");
    }

    const validation = validateWhatsAppNumber(phone, false);
    if (!validation.isValid) {
      toast.warning(`Attention : ${validation.warning}`);
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          phone: phone.trim(),
          followup_preference: followupPreference,
        },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    // Auto-confirm is enabled — sign the user in immediately so they
    // never wait on an email link.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) return toast.error(signInError.message);
    toast.success("Compte créé. Bienvenue chez NailHouse.");
  }

  async function signInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
  }

  async function signInWithApple() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-5xl items-stretch gap-8 px-5 py-16 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl group min-h-[300px] md:min-h-full">
          <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent z-10" />
          <img
            src={ASSETS.burgundyManicure}
            alt="NailHouse Manicure"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] text-gold uppercase mb-1">
              <Sparkles className="h-3.5 w-3.5" /> L'élégance au bout des doigts
            </p>
            <h2 className="font-serif text-2xl tracking-wide leading-tight">
              Une expérience boutique unique à Yaoundé.
            </h2>
          </div>
        </div>

        <div className="relative rounded-[2rem] border border-gold/15 bg-card/45 p-8 md:p-10 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/80">
                Salon NailHouse
              </p>
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            </div>
            <h1 className="mt-2 font-serif text-3xl text-primary font-medium tracking-wide">
              Votre Espace
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Connectez-vous pour gérer vos réservations et personnaliser vos préférences.
            </p>

            <Tabs defaultValue="signin" className="mt-8">
              <TabsList className="grid w-full grid-cols-2 p-1.5 bg-ink/5 rounded-full border border-gold/10">
                <TabsTrigger
                  value="signin"
                  className="rounded-full text-xs font-medium tracking-wider uppercase py-2 cursor-pointer transition-all duration-300 data-[state=active]:bg-gold data-[state=active]:text-ink data-[state=active]:shadow-sm"
                >
                  Connexion
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-full text-xs font-medium tracking-wider uppercase py-2 cursor-pointer transition-all duration-300 data-[state=active]:bg-gold data-[state=active]:text-ink data-[state=active]:shadow-sm"
                >
                  S'inscrire
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6 outline-none">
                <form onSubmit={signIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Adresse Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="pl-10 h-11 rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/40 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Mot de passe
                      </Label>
                      <Link
                        to="/auth/reset-password"
                        className="text-[10px] text-gold hover:underline"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        disabled={loading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11 rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/40 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1 pb-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      className="rounded text-gold focus:ring-gold/30 h-3.5 w-3.5 accent-gold cursor-pointer"
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-[10px] cursor-pointer text-muted-foreground"
                    >
                      Se souvenir de moi
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 mt-2 rounded-xl bg-gold hover:bg-gold/90 text-ink font-semibold tracking-wider transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6 outline-none">
                <form onSubmit={signUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Nom complet
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        type="text"
                        required
                        disabled={loading}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Amina Bello"
                        className="pl-10 h-11 rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/40 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Numéro WhatsApp (ex: +237...)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        type="tel"
                        required
                        disabled={loading}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+237 6XX XXX XXX"
                        className={`pl-10 h-11 rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/40 transition-all duration-300 ${
                          phone.trim() !== "" && !validateWhatsAppNumber(phone, false).isValid
                            ? "border-amber-500/60 focus-visible:ring-amber-500/30"
                            : ""
                        }`}
                      />
                    </div>
                    {phone.trim() !== "" && !validateWhatsAppNumber(phone, false).isValid && (
                      <div className="mt-1.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] leading-relaxed space-y-1">
                        <p className="font-semibold">
                          ⚠️ {validateWhatsAppNumber(phone, false).warning}
                        </p>
                        <p className="text-[10px] text-amber-500/80">
                          💡 (FR) Nous vous encourageons à utiliser un numéro WhatsApp pour recevoir
                          vos confirmations et rappels instantanés.
                        </p>
                        <p className="text-[10px] text-amber-500/80">
                          💡 (EN) We encourage using a WhatsApp number to receive instant
                          confirmations and reminders.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Adresse Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        type="email"
                        required
                        disabled={loading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="pl-10 h-11 rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/40 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Suivi préféré / Preferred Follow-up
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFollowupPreference("messages")}
                        className={`py-2 px-1 text-[11px] rounded-lg border font-medium transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                          followupPreference === "messages"
                            ? "bg-gold/10 border-gold text-gold"
                            : "bg-background/40 border-border/80 text-muted-foreground hover:bg-background/60"
                        }`}
                      >
                        <span className="font-bold">WhatsApp</span>
                        <span className="text-[8px] opacity-75">Messages</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFollowupPreference("email")}
                        className={`py-2 px-1 text-[11px] rounded-lg border font-medium transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                          followupPreference === "email"
                            ? "bg-gold/10 border-gold text-gold"
                            : "bg-background/40 border-border/80 text-muted-foreground hover:bg-background/60"
                        }`}
                      >
                        <span className="font-bold">Email</span>
                        <span className="text-[8px] opacity-75">Reminders</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFollowupPreference("call")}
                        className={`py-2 px-1 text-[11px] rounded-lg border font-medium transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                          followupPreference === "call"
                            ? "bg-gold/10 border-gold text-gold"
                            : "bg-background/40 border-border/80 text-muted-foreground hover:bg-background/60"
                        }`}
                      >
                        <span className="font-bold">Appel / Call</span>
                        <span className="text-[8px] opacity-75">Direct Phone</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Créer un mot de passe
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        disabled={loading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="•••••••• (6 caractères min)"
                        className="pl-10 pr-10 h-11 rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/40 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 mt-2 rounded-xl bg-gold hover:bg-gold/90 text-ink font-semibold tracking-wider transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...
                      </>
                    ) : (
                      "Créer mon compte"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gold/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-background px-4 text-muted-foreground">
                  Ou se connecter avec
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={signInWithGoogle}
                className="h-11 rounded-xl border-gold/25 text-foreground hover:bg-gold/10 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer text-xs font-semibold"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={signInWithApple}
                className="h-11 rounded-xl border-gold/25 text-foreground hover:bg-gold/10 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer text-xs font-semibold"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.51 12.09 1.01 1.454 2.208 3.083 3.783 3.024 1.52-.06 2.09-.98 3.928-.98 1.83 0 2.35.98 3.93.947 1.62-.027 2.66-1.473 3.64-2.9 1.12-1.64 1.59-3.23 1.62-3.32-.03-.02-3.11-1.19-3.14-4.75-.03-2.98 2.45-4.41 2.56-4.48-1.4-2.06-3.58-2.29-4.36-2.33-2-.17-3.41 1.04-3.94 1.04zM15.97 3.518c.84-1.02 1.4-2.44 1.24-3.518-.93.04-2.05.62-2.72 1.4-1.18 1.36-1.15 2.82-1.06 3.86.99.08 2.03-.49 2.54-1.742z" />
                </svg>
                Apple
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

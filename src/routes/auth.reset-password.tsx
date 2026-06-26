import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Un email de réinitialisation vous a été envoyé.");
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-md items-center justify-center px-5 py-20 md:py-32">
        <div className="relative rounded-[2rem] border border-gold/15 bg-card/45 p-8 shadow-xl backdrop-blur-md w-full">
          <div className="mb-6">
            <Link
              to="/auth"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-1 h-3 w-3" /> Retour à la connexion
            </Link>
          </div>

          <h1 className="font-serif text-3xl text-primary font-medium tracking-wide">
            Mot de passe oublié
          </h1>
          <p className="text-xs text-muted-foreground mt-2 mb-8 leading-relaxed">
            Entrez l'adresse email associée à votre compte. Nous vous enverrons un lien sécurisé
            pour réinitialiser votre mot de passe.
          </p>

          {sent ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Consultez votre boîte mail (et vos spams) pour trouver le lien de réinitialisation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
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

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full h-11 mt-2 rounded-xl bg-gold hover:bg-gold/90 text-ink font-semibold tracking-wider transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

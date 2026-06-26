import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/auth/update-password")({
  component: UpdatePasswordPage,
});

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is actually authenticated (they should be via the magic link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Lien expiré ou invalide. Veuillez réessayer.");
        navigate({ to: "/auth/reset-password", replace: true });
      }
    });
  }, [navigate]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Mot de passe mis à jour avec succès !");
      navigate({ to: "/portal", replace: true });
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-md items-center justify-center px-5 py-20 md:py-32">
        <div className="relative rounded-[2rem] border border-gold/15 bg-card/45 p-8 shadow-xl backdrop-blur-md w-full">
          <h1 className="font-serif text-3xl text-primary font-medium tracking-wide">
            Nouveau mot de passe
          </h1>
          <p className="text-xs text-muted-foreground mt-2 mb-8 leading-relaxed">
            Veuillez saisir votre nouveau mot de passe pour sécuriser votre compte.
          </p>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11 rounded-xl border-border/80 focus-visible:ring-gold/30 bg-background/40 transition-all duration-300"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full h-11 mt-2 rounded-xl bg-gold hover:bg-gold/90 text-ink font-semibold tracking-wider transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "Mise à jour..." : "Enregistrer le mot de passe"}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

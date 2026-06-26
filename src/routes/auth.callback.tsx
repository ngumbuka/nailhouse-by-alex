import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { isCurrentUserAdmin } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const checkAdmin = useServerFn(isCurrentUserAdmin);

  useEffect(() => {
    async function handleCallback() {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Aucune session trouvée. Veuillez vous reconnecter.");
        }

        const res = await checkAdmin();
        if (res?.isAdmin) {
          navigate({ to: "/admin", replace: true });
        } else {
          navigate({ to: "/portal", replace: true });
        }
      } catch (err) {
        console.error("Callback error:", err);
        const msg = err instanceof Error ? err.message : "Erreur lors de l'authentification";
        setError(msg);
        toast.error("Erreur lors de la connexion");
        setTimeout(() => navigate({ to: "/auth", replace: true }), 3000);
      }
    }

    handleCallback();
  }, [navigate, checkAdmin]);

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center p-5 text-center">
        <h1 className="font-serif text-2xl text-destructive mb-2">Erreur</h1>
        <p className="text-muted-foreground">{error}</p>
        <p className="text-xs text-muted-foreground mt-4">Redirection vers l'accueil...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-gold" />
      <h1 className="font-serif text-2xl text-primary animate-pulse">
        Authentification en cours...
      </h1>
      <p className="text-sm text-muted-foreground">
        Veuillez patienter pendant que nous sécurisons votre session.
      </p>
    </div>
  );
}

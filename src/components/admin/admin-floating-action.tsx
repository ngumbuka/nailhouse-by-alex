// @ts-nocheck
import { useState, useEffect } from "react";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { isCurrentUserAdmin, adminListServices, adminCreateBooking } from "@/lib/admin.functions";
import { BookingModal } from "./booking-modal";
import { toast } from "sonner";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function AdminFloatingAction() {
  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const listServicesFn = useServerFn(adminListServices);
  const createBookingFn = useServerFn(adminCreateBooking);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setHasSession(!!s));
    return () => subscription.unsubscribe();
  }, []);

  const { data: adminData } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => checkAdmin(),
    enabled: hasSession,
    staleTime: 1000 * 60 * 5,
  });

  const { data: services } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: () => listServicesFn(),
    enabled: !!adminData?.isAdmin && isModalOpen,
  });

  const addBookingMut = useMutation({
    mutationFn: (v: Record<string, unknown>) =>
      createBookingFn({ data: v as Record<string, unknown> }),
    onSuccess: () => {
      toast.success("Réservation manuelle ajoutée");
      setIsModalOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      // If we are not on admin page, we can redirect or just let them stay
      if (!location.pathname.includes("/admin")) {
        navigate({ to: "/admin" });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!adminData?.isAdmin) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-14 w-14 rounded-full bg-gold hover:bg-gold/90 text-white shadow-lg shadow-gold/20 flex items-center justify-center p-0"
          title="Ajout rapide de RDV"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <BookingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services ?? []}
        isPending={addBookingMut.isPending}
        onSubmit={(data) => addBookingMut.mutate(data)}
      />
    </>
  );
}

// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

interface Service {
  id: string;
  name: string;
  price_fcfa: number;
  duration_mins: number;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  services: Service[];
  isPending: boolean;
  onSubmit: (data: {
    name: string;
    phone: string;
    email: string;
    service_name: string;
    scheduled_at: string;
    notes: string | null;
  }) => void;
}

export function BookingModal({ open, onClose, services, isPending, onSubmit }: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setPhone("");
      setEmail("");
      setService("");
      setDate("");
      setNotes("");
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !service || !date) return;
    onSubmit({
      name,
      phone,
      email,
      service_name: service,
      scheduled_at: new Date(date).toISOString(),
      notes: notes || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-primary flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-gold" />
            Nouveau rendez-vous
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bm-name">Nom client *</Label>
              <Input id="bm-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bm-phone">Téléphone *</Label>
              <Input
                id="bm-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bm-email">Email</Label>
              <Input
                id="bm-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Prestation *</Label>
              <Select value={service} onValueChange={setService} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir…" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bm-date">Date &amp; Heure *</Label>
              <Input
                id="bm-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bm-notes">Notes</Label>
              <Textarea
                id="bm-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Instructions particulières…"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-gold text-white hover:bg-gold/90 font-semibold"
            >
              {isPending ? "Création…" : "Créer le rendez-vous"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

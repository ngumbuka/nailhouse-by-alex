// @ts-nocheck
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, DollarSign, Tag, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ["#b8901a", "#d4a843", "#8b6914", "#f0c060", "#6d4f10", "#e8b84b"];

interface Booking {
  id: string;
  status: string;
  service_name: string;
  scheduled_at: string;
  email: string;
}
interface Service {
  id: string;
  name: string;
  price_fcfa: number;
  category: string;
}
interface Promotion {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  service_id: string | null;
}
interface Client {
  id: string;
}

interface AnalyticsSectionProps {
  bookings: Booking[];
  services: Service[];
  promotions: Promotion[];
  clients: Client[];
}

export function AnalyticsSection({
  bookings,
  services,
  promotions,
  clients,
}: AnalyticsSectionProps) {
  const completed = bookings.filter((b) => b.status === "completed");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const pending = bookings.filter((b) => b.status === "pending");

  // Match bookings to prices
  const withPrice = completed.map((b) => {
    const svc = services.find((s) => s.name.toLowerCase() === b.service_name?.toLowerCase());
    return { ...b, price: svc?.price_fcfa ?? 0, category: svc?.category ?? "autre" };
  });

  const grossRevenue = withPrice.reduce((sum, b) => sum + b.price, 0);

  // Estimate promo discount applied to completed bookings
  const activePromos = promotions.filter((p) => p.active);
  const estimatedDiscount = activePromos.reduce((total, p) => {
    const affected = p.service_id
      ? withPrice.filter((b) => {
          const svc = services.find((s) => s.id === p.service_id);
          return svc && b.service_name?.toLowerCase() === svc.name.toLowerCase();
        })
      : withPrice;
    const discountAmount = affected.reduce((s, b) => s + b.price * (p.discount_percent / 100), 0);
    return total + discountAmount;
  }, 0);

  const netRevenue = grossRevenue - estimatedDiscount;

  // Last 6 months revenue
  const now = new Date();
  const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
  const revenueByMonth = months.map((m) => {
    const label = format(m, "MMM", { locale: fr });
    const monthBookings = withPrice.filter((b) => {
      const d = new Date(b.scheduled_at);
      return d >= startOfMonth(m) && d <= endOfMonth(m);
    });
    return {
      month: label,
      revenus: monthBookings.reduce((s, b) => s + b.price, 0),
      réservations: monthBookings.length,
    };
  });

  // Revenue by category
  const catMap: Record<string, number> = {};
  withPrice.forEach((b) => {
    catMap[b.category] = (catMap[b.category] ?? 0) + b.price;
  });
  const revenueByCategory = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Top services
  const svcMap: Record<string, { count: number; revenue: number }> = {};
  withPrice.forEach((b) => {
    if (!svcMap[b.service_name]) svcMap[b.service_name] = { count: 0, revenue: 0 };
    svcMap[b.service_name].count++;
    svcMap[b.service_name].revenue += b.price;
  });
  const topServices = Object.entries(svcMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Booking status distribution
  const statusData = [
    { name: "Terminé", value: completed.length, color: "#22c55e" },
    { name: "Confirmé", value: confirmed.length, color: "#b8901a" },
    { name: "En attente", value: pending.length, color: "#f59e0b" },
    {
      name: "Annulé",
      value: bookings.filter((b) => b.status === "cancelled").length,
      color: "#ef4444",
    },
  ].filter((d) => d.value > 0);

  function exportCSV() {
    const rows = [
      ["Nom", "Email", "Prestation", "Statut", "Date", "Prix estimé (FCFA)"],
      ...withPrice.map((b) => [
        b.name ?? "",
        b.email ?? "",
        b.service_name ?? "",
        b.status,
        new Date(b.scheduled_at).toLocaleDateString("fr-FR"),
        b.price,
      ]),
    ];
    const csv = "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = "analytique_nailhouse.csv";
    a.click();
  }

  const fmt = (n: number) => n.toLocaleString("fr-FR") + " F";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-sans tracking-tight text-2xl text-primary font-bold">
          Analytique &amp; Finance
        </h2>
        <Button
          onClick={exportCSV}
          className="rounded-full bg-gold text-white hover:bg-gold/90 text-sm font-semibold"
        >
          Exporter CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Chiffre d'affaires brut",
            value: fmt(grossRevenue),
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Remises promotions (est.)",
            value: fmt(estimatedDiscount),
            icon: Tag,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Revenu net estimé",
            value: fmt(netRevenue),
            icon: TrendingUp,
            color: "text-gold",
            bg: "bg-gold/10",
          },
          {
            label: "Total clients",
            value: clients.length,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className={`inline-flex rounded-xl p-2.5 ${card.bg} mb-3`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
            <p className={`font-sans tracking-tight text-3xl font-extrabold mt-1 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue trend line chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-sans tracking-tight text-lg text-primary font-bold mb-6">
          Revenus sur 6 mois
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => (v > 0 ? `${(v / 1000).toFixed(0)}k` : "0")}
            />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Line
              type="monotone"
              dataKey="revenus"
              stroke="#b8901a"
              strokeWidth={2.5}
              dot={{ fill: "#b8901a", r: 4 }}
              name="Revenus (FCFA)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top services bar chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-sans tracking-tight text-lg text-primary font-bold mb-4">
            Meilleures prestations
          </h3>
          {topServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topServices} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="revenue" fill="#b8901a" radius={[0, 6, 6, 0]} name="Revenu" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              Aucune réservation terminée pour le moment.
            </p>
          )}
        </div>

        {/* Status pie chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-sans tracking-tight text-lg text-primary font-bold mb-4">
            Statuts des réservations
          </h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Aucune réservation.</p>
          )}
        </div>
      </div>

      {/* Revenue by category */}
      {revenueByCategory.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-sans tracking-tight text-lg text-primary font-bold mb-4">
            Revenus par catégorie
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Revenu">
                {revenueByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Promotions impact table */}
      {promotions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-sans tracking-tight text-lg text-primary font-bold">
              Impact des promotions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {["Code", "Réduction", "Statut", "Remise estimée", "Prestations ciblées"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promotions.map((p) => {
                  const svc = services.find((s) => s.id === p.service_id);
                  const affected = p.service_id
                    ? withPrice.filter(
                        (b) => svc && b.service_name?.toLowerCase() === svc.name.toLowerCase(),
                      )
                    : withPrice;
                  const discountAmt = affected.reduce(
                    (s, b) => s + b.price * (p.discount_percent / 100),
                    0,
                  );
                  return (
                    <tr key={p.id} className="hover:bg-muted/10">
                      <td className="px-4 py-3 font-bold tracking-wider text-gold uppercase">
                        {p.code}
                      </td>
                      <td className="px-4 py-3 font-semibold">-{p.discount_percent}%</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${p.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                        >
                          {p.active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-amber-600">{fmt(discountAmt)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {svc ? svc.name : "Toutes"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

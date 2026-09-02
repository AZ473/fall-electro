import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { formatCFA } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/orders/")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Commandes · Admin" }] }),
});

const STATUS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

function OrdersPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const filtered = filter === "all" ? orders : orders.filter((o: any) => o.status === filter);

  return (
    <AdminShell title="Commandes">
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-full text-sm font-medium ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
          Toutes ({orders.length})
        </button>
        {STATUS.map((s) => {
          const c = orders.filter((o: any) => o.status === s).length;
          return (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${filter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
              {s} ({c})
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">N° Commande</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chargement...</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucune commande.</td></tr>}
              {filtered.map((o: any) => (
                <tr key={o.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => window.location.assign(`/admin/orders/${o.id}`)}>
                  <td className="px-4 py-3 font-medium">
                    <Link to="/admin/orders/$id" params={{ id: o.id }} className="hover:text-primary">{o.order_number}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{o.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCFA(o.total_amount)}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{o.payment_method ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColor[o.status] ?? ""}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
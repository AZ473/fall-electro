import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Package, ShoppingBag, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { formatCFA } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin · ElectroMaison" }] }),
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, customers, recent, lowStock] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount,status,created_at"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("id,order_number,customer_name,total_amount,status,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("products").select("id,name,stock,low_stock_threshold").order("stock", { ascending: true }).limit(20),
      ]);
      const allOrders = orders.data ?? [];
      const revenue = allOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total_amount), 0);
      const pending = allOrders.filter(o => o.status === "pending").length;
      return {
        productCount: products.count ?? 0,
        orderCount: allOrders.length,
        customerCount: customers.count ?? 0,
        revenue, pending,
        recent: recent.data ?? [],
        lowStock: (lowStock.data ?? []).filter(p => p.stock <= p.low_stock_threshold).slice(0, 5),
      };
    },
  });

  const cards = [
    { label: "Revenu total", value: formatCFA(stats?.revenue), icon: TrendingUp, accent: "bg-primary-soft text-primary" },
    { label: "Commandes", value: stats?.orderCount ?? "—", sub: `${stats?.pending ?? 0} en attente`, icon: ShoppingBag, accent: "bg-orange-100 text-orange-600" },
    { label: "Produits", value: stats?.productCount ?? "—", icon: Package, accent: "bg-blue-100 text-blue-600" },
    { label: "Clients", value: stats?.customerCount ?? "—", icon: Users, accent: "bg-green-100 text-green-600" },
  ];

  return (
    <AdminShell title="Tableau de bord">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <div className="text-2xl font-bold mt-1">{c.value}</div>
                {c.sub && <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>}
              </div>
              <div className={`h-10 w-10 rounded-xl grid place-items-center ${c.accent}`}><c.icon className="h-5 w-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Commandes récentes</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline">Voir tout</Link>
          </div>
          <div className="divide-y divide-border">
            {(stats?.recent ?? []).map((o: any) => (
              <Link to="/admin/orders/$id" params={{ id: o.id }} key={o.id} className="flex items-center justify-between py-3 hover:bg-muted/40 rounded-lg px-2 -mx-2">
                <div>
                  <div className="font-medium text-sm">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{formatCFA(o.total_amount)}</div>
                  <div className="text-xs text-muted-foreground capitalize">{o.status}</div>
                </div>
              </Link>
            ))}
            {(!stats?.recent || stats.recent.length === 0) && <p className="text-sm text-muted-foreground py-6 text-center">Aucune commande pour le moment.</p>}
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <h2 className="font-semibold">Stock faible</h2>
          </div>
          <div className="space-y-3">
            {(stats?.lowStock ?? []).map((p: any) => (
              <Link to="/admin/products/$id" params={{ id: p.id }} key={p.id} className="flex items-center justify-between text-sm hover:bg-muted/40 rounded-lg px-2 py-2 -mx-2">
                <span className="truncate">{p.name}</span>
                <span className="font-bold text-orange-600">{p.stock}</span>
              </Link>
            ))}
            {(!stats?.lowStock || stats.lowStock.length === 0) && <p className="text-sm text-muted-foreground">Tout est en stock ✓</p>}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

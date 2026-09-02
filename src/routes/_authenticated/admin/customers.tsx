import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { formatCFA } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: CustomersPage,
  head: () => ({ meta: [{ title: "Clients · Admin" }] }),
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [{ data: profiles }, { data: orders }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id,total_amount,status"),
      ]);
      const stats = new Map<string, { count: number; total: number }>();
      (orders ?? []).forEach((o: any) => {
        if (!o.user_id) return;
        const s = stats.get(o.user_id) ?? { count: 0, total: 0 };
        s.count += 1;
        if (o.status !== "cancelled") s.total += Number(o.total_amount);
        stats.set(o.user_id, s);
      });
      return (profiles ?? []).map((p: any) => ({ ...p, _stats: stats.get(p.id) ?? { count: 0, total: 0 } }));
    },
  });
  const filtered = customers.filter((c: any) =>
    [c.full_name, c.email, c.phone].some((v: string) => v?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <AdminShell title="Clients">
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." className="pl-9" />
          </div>
          <div className="text-sm text-muted-foreground self-center ml-auto">{filtered.length} client(s)</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3 text-right">Commandes</th>
                <th className="px-4 py-3 text-right">Total dépensé</th>
                <th className="px-4 py-3">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chargement...</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun client.</td></tr>}
              {filtered.map((c: any) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary-soft text-primary grid place-items-center text-sm font-bold">
                        {(c.full_name || c.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium">{c.full_name || "Sans nom"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs space-y-1">
                    {c.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-muted-foreground" />{c.email}</div>}
                    {c.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" />{c.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.city ? <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.city}</span> : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{c._stats.count}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCFA(c._stats.total)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

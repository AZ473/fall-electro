import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatCFA } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({
  component: OrderDetail,
  head: () => ({ meta: [{ title: "Commande · Admin" }] }),
});

const STATUS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;

function OrderDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: order } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*,order_items(*)").eq("id", id).maybeSingle();
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: typeof STATUS[number]) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Statut mis à jour"); qc.invalidateQueries({ queryKey: ["admin-order", id] }); qc.invalidateQueries({ queryKey: ["admin-orders"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (!order) return <AdminShell title="Commande"><p className="text-muted-foreground">Chargement...</p></AdminShell>;

  return (
    <AdminShell
      title={`Commande ${order.order_number}`}
      actions={<Button asChild variant="outline"><Link to="/admin/orders"><ArrowLeft className="h-4 w-4" />Retour</Link></Button>}
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-semibold mb-4">Articles</h2>
            <div className="divide-y divide-border">
              {order.order_items?.map((it: any) => (
                <div key={it.id} className="flex items-center gap-4 py-3">
                  <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                    {it.product_image && <img src={it.product_image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{it.product_name}</div>
                    <div className="text-sm text-muted-foreground">{it.quantity} × {formatCFA(it.unit_price)}</div>
                  </div>
                  <div className="font-semibold">{formatCFA(it.total_price)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{formatCFA(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Livraison</span><span>{formatCFA(order.shipping_fee)}</span></div>
              <div className="flex justify-between text-lg font-bold pt-2"><span>Total</span><span>{formatCFA(order.total_amount)}</span></div>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-semibold mb-2">Notes</h2>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-semibold mb-4">Statut</h2>
            <select
              value={order.status}
              onChange={(e) => updateStatus.mutate(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm capitalize"
            >
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <p className="text-xs text-muted-foreground mt-2">Créée le {new Date(order.created_at).toLocaleString("fr-FR")}</p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 space-y-3 text-sm">
            <h2 className="font-semibold">Client</h2>
            <div>
              <div className="text-xs text-muted-foreground">Nom</div>
              <div className="font-medium">{order.customer_name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Téléphone</div>
              <div className="font-medium">{order.customer_phone}</div>
            </div>
            {order.customer_email && (
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="font-medium">{order.customer_email}</div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 space-y-3 text-sm">
            <h2 className="font-semibold">Livraison</h2>
            <div>{order.shipping_address}</div>
            <div className="text-muted-foreground">{order.shipping_city}</div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 text-sm">
            <h2 className="font-semibold mb-2">Paiement</h2>
            <div className="capitalize">{order.payment_method ?? "Non défini"}</div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

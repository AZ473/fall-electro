import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatCFA } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Produits · Admin" }] }),
});

function ProductsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,slug,price,stock,is_active,is_featured,category_id,categories(name),product_images(image_url,is_primary)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produit supprimé");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = products.filter((p: any) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminShell
      title="Produits"
      actions={
        <Button asChild>
          <Link to="/admin/products/new"><Plus className="h-4 w-4" />Nouveau produit</Link>
        </Button>
      }
    >
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." className="pl-9" />
          </div>
          <div className="text-sm text-muted-foreground self-center ml-auto">{filtered.length} produit(s)</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3 text-right">Prix</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chargement...</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun produit. Créez-en un.</td></tr>}
              {filtered.map((p: any) => {
                const primary = p.product_images?.find((i: any) => i.is_primary) ?? p.product_images?.[0];
                return (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-lg bg-muted overflow-hidden shrink-0">
                          {primary && <img src={primary.image_url} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.categories?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCFA(p.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.stock === 0 ? "text-destructive font-semibold" : p.stock < 5 ? "text-orange-600 font-semibold" : ""}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.is_active ? "bg-green-500" : "bg-muted-foreground"}`} />
                        {p.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="icon" variant="ghost"><Link to="/admin/products/$id" params={{ id: p.id }}><Pencil className="h-4 w-4" /></Link></Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Supprimer \"${p.name}\" ?`)) del.mutate(p.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
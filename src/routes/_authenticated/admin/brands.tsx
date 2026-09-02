import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/brands")({
  component: BrandsPage,
  head: () => ({ meta: [{ title: "Marques · Admin" }] }),
});

function BrandsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => (await supabase.from("brands").select("*").order("name")).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      let logo_url: string | null = null;
      if (file) {
        const path = `${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("brand-logos").upload(path, file);
        if (error) throw error;
        logo_url = supabase.storage.from("brand-logos").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("brands").insert({ name, slug: slugify(name), logo_url });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Marque créée"); setName(""); setFile(null); qc.invalidateQueries({ queryKey: ["admin-brands"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Supprimée"); qc.invalidateQueries({ queryKey: ["admin-brands"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AdminShell title="Marques">
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="rounded-2xl bg-card border border-border p-6 space-y-4 h-fit">
          <h2 className="font-semibold">Nouvelle marque</h2>
          <div>
            <Label>Nom *</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Samsung" />
          </div>
          <div>
            <Label>Logo</Label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary text-sm">
              <Upload className="h-4 w-4" />
              {file ? file.name : "Choisir un logo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={add.isPending}>
            <Plus className="h-4 w-4" />Créer
          </Button>
        </form>

        <div className="lg:col-span-2 rounded-2xl bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Marque</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brands.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Aucune marque.</td></tr>}
              {brands.map((b: any) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 rounded-lg bg-muted overflow-hidden grid place-items-center">
                        {b.logo_url ? <img src={b.logo_url} alt="" className="h-full w-full object-contain" /> : <span className="text-xs font-bold text-muted-foreground">{b.name[0]}</span>}
                      </div>
                      <span className="font-medium">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">/{b.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Supprimer "${b.name}" ?`)) del.mutate(b.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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

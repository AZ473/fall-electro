import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Upload, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { slugify } from "@/lib/format";
import { useServerFn } from "@tanstack/react-start";
import { generateCategoryImage } from "@/lib/ai-category.functions";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: "Catégories · Admin" }] }),
});

const dataUrlToFile = async (dataUrl: string, filename: string) => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
};

function CategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPopular, setIsPopular] = useState(true);
  const [generating, setGenerating] = useState(false);
  const generateAi = useServerFn(generateCategoryImage);

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const pickFile = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const runAi = async () => {
    if (!name.trim()) return toast.error("Entrez d'abord le nom de la catégorie");
    setGenerating(true);
    try {
      const { dataUrl } = await generateAi({ data: { name: name.trim() } });
      const f = await dataUrlToFile(dataUrl, `${slugify(name)}.png`);
      setFile(f);
      setPreview(dataUrl);
      toast.success("Image générée par l'IA");
    } catch (e: any) {
      toast.error(e?.message ?? "Échec de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const add = useMutation({
    mutationFn: async () => {
      let image_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop();
        const base = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        const safeName = `${slugify(base)}.${ext}`;
        const path = `${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from("category-images").upload(path, file);
        if (error) throw error;
        const { data: signed, error: sErr } = await supabase.storage.from("category-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (sErr) throw sErr;
        image_url = signed.signedUrl;
      }
      const { error } = await supabase.from("categories").insert({
        name, slug: slugify(name), image_url, is_popular: isPopular,
        sort_order: (categories[categories.length - 1] as any)?.sort_order + 1 || 1,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Catégorie créée"); setName(""); setFile(null); setPreview(null); qc.invalidateQueries({ queryKey: ["admin-categories"] }); qc.invalidateQueries({ queryKey: ["home-categories"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await supabase.from("categories").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); qc.invalidateQueries({ queryKey: ["home-categories"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Supprimée"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); qc.invalidateQueries({ queryKey: ["home-categories"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AdminShell title="Catégories">
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="rounded-2xl bg-card border border-border p-6 space-y-4 h-fit">
          <h2 className="font-semibold">Nouvelle catégorie</h2>
          <div>
            <Label>Nom *</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Réfrigérateurs" />
          </div>

          <div>
            <Label>Image</Label>
            {preview ? (
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border bg-muted">
                <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => pickFile(null)}
                  className="absolute top-1 right-1 h-7 w-7 grid place-items-center rounded-full bg-destructive text-destructive-foreground"
                  aria-label="Retirer l'image"
                >×</button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary text-sm">
                <Upload className="h-4 w-4" />
                Choisir une image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
              </label>
            )}
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={runAi} disabled={generating || !name.trim()}>
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Génération...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Générer l'image par IA</span>
              </span>
            )}
          </Button>

          <div className="flex items-center justify-between">
            <Label>Afficher dans "Catégories populaires"</Label>
            <Switch checked={isPopular} onCheckedChange={setIsPopular} />
          </div>
          <Button type="submit" className="w-full" disabled={add.isPending}>
            <Plus className="h-4 w-4" />Créer
          </Button>
        </form>

        <div className="lg:col-span-2 rounded-2xl bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Ordre</th>
                  <th className="px-4 py-3">Populaire</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Aucune catégorie.</td></tr>}
                {categories.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden">
                          {c.image_url && <img src={c.image_url} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">/{c.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        defaultValue={c.sort_order}
                        className="w-20 h-8"
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v !== c.sort_order) update.mutate({ id: c.id, patch: { sort_order: v } });
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Switch checked={c.is_popular} onCheckedChange={(v) => update.mutate({ id: c.id, patch: { is_popular: v } })} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Supprimer "${c.name}" ?`)) del.mutate(c.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

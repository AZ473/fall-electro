import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, Sparkles, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { slugify } from "@/lib/format";
import { useServerFn } from "@tanstack/react-start";
import { generateBrandLogo } from "@/lib/ai-brand.functions";

export const Route = createFileRoute("/_authenticated/admin/brands")({
  component: BrandsPage,
  head: () => ({ meta: [{ title: "Marques · Admin" }] }),
});

const dataUrlToFile = async (dataUrl: string, filename: string) => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
};

function BrandsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const generateAi = useServerFn(generateBrandLogo);

  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => (await supabase.from("brands").select("*").order("name")).data ?? [],
  });

  const pickFile = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const runAi = async () => {
    if (!name.trim()) return toast.error("Entrez d'abord le nom de la marque");
    setGenerating(true);
    try {
      const { dataUrl } = await generateAi({ data: { name: name.trim() } });
      const f = await dataUrlToFile(dataUrl, `${slugify(name)}.png`);
      setFile(f);
      setPreview(dataUrl);
      toast.success("Logo généré par l'IA");
    } catch (e: any) {
      toast.error(e?.message ?? "Échec de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const add = useMutation({
    mutationFn: async () => {
      let logo_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop();
        const base = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        const safeName = `${slugify(base)}.${ext}`;
        const path = `${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from("brand-logos").upload(path, file);
        if (error) throw error;
        const { data: signed, error: sErr } = await supabase.storage.from("brand-logos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (sErr) throw sErr;
        logo_url = signed.signedUrl;
      }
      const { error } = await supabase.from("brands").insert({ name, slug: slugify(name), logo_url });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marque créée");
      setName("");
      setFile(null);
      setPreview(null);
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
      qc.invalidateQueries({ queryKey: ["home-brands"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Supprimée");
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
      qc.invalidateQueries({ queryKey: ["home-brands"] });
    },
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
            {preview ? (
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border bg-white flex items-center justify-center p-3">
                <img src={preview} alt="Aperçu" className="max-h-full max-w-full object-contain" />
                <button
                  type="button"
                  onClick={() => pickFile(null)}
                  className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-destructive text-destructive-foreground hover:opacity-90 transition"
                  aria-label="Retirer le logo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary text-sm transition bg-muted/20 hover:bg-muted/40">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Choisir un logo</span>
                <span className="text-xs text-muted-foreground">PNG, JPG, SVG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={runAi}
            disabled={generating || !name.trim()}
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Génération du logo...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Générer le logo par IA</span>
              </span>
            )}
          </Button>

          <Button type="submit" className="w-full" disabled={add.isPending}>
            <Plus className="h-4 w-4" />
            <span>Créer la marque</span>
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
                      <div className="h-10 w-16 rounded-lg bg-white border border-border overflow-hidden grid place-items-center p-1">
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

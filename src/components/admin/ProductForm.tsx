import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Star, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/format";
import { useServerFn } from "@tanstack/react-start";
import { generateProductDetails } from "@/lib/ai-product.functions";

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

type Img = { id?: string; image_url: string; is_primary: boolean; sort_order: number; _new?: File };

export function ProductForm({ productId }: { productId?: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isEdit = !!productId;

  const [form, setForm] = useState({
    name: "", slug: "", description: "", sku: "",
    price: "0", compare_price: "", stock: "0", low_stock_threshold: "5",
    category_id: "" as string | null, brand_id: "" as string | null,
    is_active: true, is_featured: false,
    is_flash_sale: false, flash_sale_ends_at: "",
    rating: "0", sold_count: "0",
  });
  const [images, setImages] = useState<Img[]>([]);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const generateAi = useServerFn(generateProductDetails);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => (await supabase.from("categories").select("id,name").order("name")).data ?? [],
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["brands-all"],
    queryFn: async () => (await supabase.from("brands").select("id,name").order("name")).data ?? [],
  });

  const { data: existing } = useQuery({
    queryKey: ["admin-product", productId],
    enabled: isEdit,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products").select("*,product_images(id,image_url,is_primary,sort_order)")
        .eq("id", productId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name ?? "",
        slug: existing.slug ?? "",
        description: existing.description ?? "",
        sku: existing.sku ?? "",
        price: String(existing.price ?? "0"),
        compare_price: existing.compare_price != null ? String(existing.compare_price) : "",
        stock: String(existing.stock ?? "0"),
        low_stock_threshold: String(existing.low_stock_threshold ?? "5"),
        category_id: existing.category_id,
        brand_id: existing.brand_id,
        is_active: existing.is_active,
        is_featured: existing.is_featured,
        is_flash_sale: existing.is_flash_sale ?? false,
        flash_sale_ends_at: existing.flash_sale_ends_at ? new Date(existing.flash_sale_ends_at).toISOString().slice(0, 16) : "",
        rating: String(existing.rating ?? "0"),
        sold_count: String(existing.sold_count ?? "0"),
      });
      const imgs = (existing.product_images ?? []).map((i: any) => ({ id: i.id, image_url: i.image_url, is_primary: i.is_primary, sort_order: i.sort_order }));
      setImages(imgs.sort((a: Img, b: Img) => a.sort_order - b.sort_order));
    }
  }, [existing]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImgs: Img[] = Array.from(files).map((f, i) => ({
      image_url: URL.createObjectURL(f),
      is_primary: images.length === 0 && i === 0,
      sort_order: images.length + i,
      _new: f,
    }));
    setImages((prev) => [...prev, ...newImgs]);
  };

  const setPrimary = (idx: number) => setImages(images.map((im, i) => ({ ...im, is_primary: i === idx })));
  const removeImg = (idx: number) => {
    const removed = images[idx];
    const next = images.filter((_, i) => i !== idx);
    if (removed.is_primary && next.length) next[0].is_primary = true;
    setImages(next);
  };

  const runAi = async () => {
    const files = images.filter((im) => im._new).map((im) => im._new!) as File[];
    if (!files.length) return toast.error("Ajoutez d'abord au moins une photo du produit");
    if (!Number(form.price)) return toast.error("Indiquez d'abord le prix");
    setAiLoading(true);
    try {
      const payload = await Promise.all(files.slice(0, 4).map(fileToDataUrl));
      const res = await generateAi({
        data: {
          images: payload,
          price: Number(form.price),
          categories: (categories as { id: string; name: string }[]).map((c) => ({ id: c.id, name: c.name })),
          brands: (brands as { id: string; name: string }[]).map((b) => ({ id: b.id, name: b.name })),
        },
      });
      setForm((f) => ({
        ...f,
        name: res.name,
        slug: slugify(res.name),
        description: res.description,
        sku: f.sku || res.sku,
        category_id: res.category_id ?? f.category_id,
        brand_id: res.brand_id ?? f.brand_id,
      }));
      setGenerated(true);
      toast.success("Fiche générée par l'IA — vérifiez et enregistrez");
    } catch (e: any) {
      toast.error(e?.message ?? "Échec de la génération IA");
    } finally {
      setAiLoading(false);
    }
  };


  const save = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description || null,
        sku: form.sku || null,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        stock: Number(form.stock),
        low_stock_threshold: Number(form.low_stock_threshold),
        category_id: form.category_id || null,
        brand_id: form.brand_id || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_flash_sale: form.is_flash_sale,
        flash_sale_ends_at: form.is_flash_sale && form.flash_sale_ends_at ? new Date(form.flash_sale_ends_at).toISOString() : null,
        rating: Number(form.rating) || 0,
        sold_count: Number(form.sold_count) || 0,
      };
      let id = productId;
      if (isEdit) {
        const { error } = await supabase.from("products").update(payload).eq("id", id!);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        id = data.id;
      }
      // Upload new images
      const finalImages: { product_id: string; image_url: string; is_primary: boolean; sort_order: number; id?: string }[] = [];
      for (let i = 0; i < images.length; i++) {
        const im = images[i];
        let url = im.image_url;
        if (im._new) {
          const ext = im._new.name.split(".").pop();
          const path = `${id}/${Date.now()}-${i}.${ext}`;
          const { error: upErr } = await supabase.storage.from("product-images").upload(path, im._new, { upsert: true });
          if (upErr) throw upErr;
          const { data: signed, error: sErr } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
          if (sErr) throw sErr;
          url = signed.signedUrl;
        }
        finalImages.push({ product_id: id!, image_url: url, is_primary: im.is_primary, sort_order: i, id: im.id });
      }
      // Delete removed images (those in existing not in finalImages by id)
      if (isEdit && existing?.product_images) {
        const keptIds = new Set(finalImages.map(f => f.id).filter(Boolean));
        const toDelete = existing.product_images.filter((e: any) => !keptIds.has(e.id)).map((e: any) => e.id);
        if (toDelete.length) await supabase.from("product_images").delete().in("id", toDelete);
      }
      // Upsert images
      for (const im of finalImages) {
        if (im.id) {
          await supabase.from("product_images").update({ is_primary: im.is_primary, sort_order: im.sort_order }).eq("id", im.id);
        } else {
          await supabase.from("product_images").insert({ product_id: im.product_id, image_url: im.image_url, is_primary: im.is_primary, sort_order: im.sort_order });
        }
      }
      return id;
    },
    onSuccess: () => {
      toast.success(isEdit ? "Produit mis à jour" : "Produit créé");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["home-flash-sales"] });
      navigate({ to: "/admin/products" });
    },
    onError: (e: any) => { setUploading(false); toast.error(e.message); },
  });

  const showAll = isEdit || generated;

  const imagesBlock = (
    <div className="space-y-3">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary hover:bg-primary-soft/50 transition bg-card">
        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
        <span className="text-sm font-medium">Glisser ou cliquer pour téléverser</span>
        <span className="text-xs text-muted-foreground">PNG, JPG, WEBP — plusieurs fichiers acceptés</span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </label>
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((im, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted">
              <img src={im.image_url} alt="" className="h-full w-full object-cover" />
              {im.is_primary && <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Principale</span>}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                {!im.is_primary && <button type="button" onClick={() => setPrimary(idx)} className="h-8 w-8 grid place-items-center rounded-full bg-white text-foreground hover:scale-110 transition"><Star className="h-4 w-4" /></button>}
                <button type="button" onClick={() => removeImg(idx)} className="h-8 w-8 grid place-items-center rounded-full bg-destructive text-destructive-foreground hover:scale-110 transition"><X className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const flashBlock = (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <h2 className="font-semibold">Offre du jour ⚡</h2>
      <div className="flex items-center justify-between">
        <Label>Activer la vente flash</Label>
        <Switch checked={form.is_flash_sale} onCheckedChange={(v) => setForm({ ...form, is_flash_sale: v })} />
      </div>
      {form.is_flash_sale && (
        <div>
          <Label>Fin de l'offre</Label>
          <Input type="datetime-local" value={form.flash_sale_ends_at} onChange={(e) => setForm({ ...form, flash_sale_ends_at: e.target.value })} />
        </div>
      )}
      <p className="text-xs text-muted-foreground">Le taux de réduction est calculé automatiquement à partir du prix barré.</p>
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className={showAll ? "grid lg:grid-cols-3 gap-6" : "max-w-3xl mx-auto"}>
      {!isEdit && (
        <div className={showAll ? "lg:col-span-3" : ""}>
          <div className="rounded-2xl border border-primary/30 bg-primary-soft/40 p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 grid place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Ajout rapide avec l'IA</h2>
                <p className="text-sm text-muted-foreground">
                  Renseignez le prix, le prix barré, le stock et les photos. L'IA rédige ensuite le nom, la description,
                  le SKU, la catégorie et la marque.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label>Prix (CFA) *</Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label>Prix barré (CFA)</Label>
                <Input type="number" min={0} value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Photos du produit *</Label>
              {imagesBlock}
              <p className="text-xs text-muted-foreground mt-2">Jusqu'à 4 photos analysées (angles, couleurs).</p>
            </div>

            <div className="rounded-xl bg-card border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Activer la vente flash (offre du jour)</Label>
                <Switch checked={form.is_flash_sale} onCheckedChange={(v) => setForm({ ...form, is_flash_sale: v })} />
              </div>
              {form.is_flash_sale && (
                <div>
                  <Label>Fin de l'offre</Label>
                  <Input type="datetime-local" value={form.flash_sale_ends_at} onChange={(e) => setForm({ ...form, flash_sale_ends_at: e.target.value })} />
                </div>
              )}
            </div>

            <Button type="button" onClick={runAi} disabled={aiLoading} size="lg" className="w-full">
              {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Génération...</> : <><Sparkles className="h-4 w-4" />Générer la fiche</>}
            </Button>
          </div>
        </div>
      )}

      {showAll && (
        <>
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h2 className="font-semibold">Informations</h2>
              <div>
                <Label>Nom *</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Slug (URL)</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            {isEdit && (
              <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                <h2 className="font-semibold">Images</h2>
                {imagesBlock}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h2 className="font-semibold">Prix & stock</h2>
              <div>
                <Label>Prix (CFA) *</Label>
                <Input type="number" required min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label>Prix barré (CFA)</Label>
                <Input type="number" min={0} value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div>
                <Label>Seuil stock faible</Label>
                <Input type="number" min={0} value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} />
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h2 className="font-semibold">Organisation</h2>
              <div>
                <Label>Catégorie</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}>
                  <option value="">— Aucune —</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Marque</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.brand_id ?? ""} onChange={(e) => setForm({ ...form, brand_id: e.target.value || null })}>
                  <option value="">— Aucune —</option>
                  {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h2 className="font-semibold">Visibilité</h2>
              <div className="flex items-center justify-between">
                <Label>Actif (visible en boutique)</Label>
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mis en avant</Label>
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
              </div>
            </div>

            {flashBlock}

            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h2 className="font-semibold">Réputation</h2>
              <div>
                <Label>Note (0 – 5)</Label>
                <Input type="number" step="0.1" min={0} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </div>
              <div>
                <Label>Nombre de ventes affichées</Label>
                <Input type="number" min={0} value={form.sold_count} onChange={(e) => setForm({ ...form, sold_count: e.target.value })} />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={save.isPending || uploading}>
              {save.isPending || uploading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le produit"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}


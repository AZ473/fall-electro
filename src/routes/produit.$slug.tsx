import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, ShieldCheck, Truck, Minus, Plus, ChevronRight, Loader2, ShoppingCart, MessageCircle, Share2, Facebook, Instagram, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCFA } from "@/lib/format";
import { openWhatsApp, buildOrderMessage } from "@/lib/whatsapp";
import { useCart } from "@/hooks/use-cart";
import { SiteLayout } from "@/components/shop/SiteLayout";
import { ProductCard } from "@/components/shop/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/produit/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("products")
      .select("name,description,price,product_images(image_url,is_primary)")
      .eq("slug", params.slug)
      .eq("is_active", true)
      .maybeSingle();
    return { product: data };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.product as any;
    const title = p ? `${p.name} — FALL ELECTRO.SN` : `Produit ${params.slug} — FALL ELECTRO.SN`;
    const desc = p?.description
      ? String(p.description).slice(0, 150)
      : "Détails du produit, prix, disponibilité et commande rapide avec livraison partout au Sénégal.";
    const rawImg = p?.product_images?.find((i: any) => i.is_primary)?.image_url ?? p?.product_images?.[0]?.image_url;
    const siteUrl = "https://fall-electronic.lovable.app";
    // WhatsApp/Facebook exigent une URL absolue pour l'aperçu d'image
    const img = rawImg ? (rawImg.startsWith("http") ? rawImg : `${siteUrl}${rawImg}`) : null;
    const pageUrl = `${siteUrl}/produit/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: pageUrl },
        ...(img
          ? [
              { property: "og:image", content: img },
              { property: "og:image:secure_url", content: img },
              { property: "og:image:width", content: "1200" },
              { property: "og:image:height", content: "1200" },
              { name: "twitter:image", content: img },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
    };
  },
  component: ProductPage,
});

const paymentMethods = [
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "free_money", label: "Free Money" },
  { value: "cash_on_delivery", label: "Paiement à la livraison" },
  { value: "card", label: "Carte bancaire" },
  { value: "whatsapp", label: "Commande WhatsApp" },
] as const;

function ProductPage() {
  const { slug } = Route.useParams();
  const { addItem, setOpen: setCartOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_city: "Dakar",
    shipping_address: "",
    notes: "",
    payment_method: "wave" as (typeof paymentMethods)[number]["value"],
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*,product_images(image_url,is_primary),categories(name,slug),brands(name)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: related = [] } = useQuery({
    enabled: !!product,
    queryKey: ["product-related", product?.category_id, product?.id],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id,name,slug,price,compare_price,rating,sold_count,product_images(image_url,is_primary)")
        .eq("is_active", true)
        .neq("id", product!.id)
        .limit(5);
      if (product!.category_id) q = q.eq("category_id", product!.category_id);
      const { data } = await q;
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-24 grid place-items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Produit introuvable</h1>
          <p className="mt-2 text-muted-foreground">Ce produit n'existe plus ou n'est pas disponible.</p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Retour à l'accueil</Link>
        </div>
      </SiteLayout>
    );
  }

  const images: string[] = (product.product_images ?? [])
    .slice()
    .sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary))
    .map((i: any) => i.image_url);
  const discount = product.compare_price && Number(product.compare_price) > Number(product.price)
    ? Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)
    : null;
  const inStock = product.stock > 0;
  const shippingFee = 0;
  const subtotal = Number(product.price) * qty;

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.shipping_address.trim()) {
      toast.error("Merci de renseigner nom, téléphone et adresse.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: orderNumber, error } = await supabase.rpc("place_order", {
        p_customer_name: form.customer_name,
        p_customer_phone: form.customer_phone,
        p_customer_email: form.customer_email || undefined,
        p_shipping_city: form.shipping_city,
        p_shipping_address: form.shipping_address,
        p_notes: form.notes || undefined,
        p_payment_method: form.payment_method,
        p_items: [{ product_id: product!.id, quantity: qty }],
      });
      if (error) throw error;

      setDone(orderNumber as string);
      toast.success("Commande enregistrée ! Nous vous appelons rapidement.");
    } catch (err: any) {
      toast.error(err?.message ?? "Impossible d'enregistrer la commande.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-5">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          {product.categories?.slug ? (
            <Link to="/categorie/$slug" params={{ slug: product.categories.slug }} className="hover:text-primary">
              {product.categories.name}
            </Link>
          ) : <span>Catalogue</span>}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-10">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl border border-border bg-card overflow-hidden grid place-items-center">
              {images[active] ? (
                <img src={images[active]} alt={product.name} className="h-full w-full object-contain p-6" />
              ) : (
                <span className="text-muted-foreground text-sm">Aucune image</span>
              )}
              {discount && (
                <span className="absolute top-3 left-3 rounded-full bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1">-{discount}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActive(i)}
                    className={`h-16 w-16 shrink-0 rounded-xl border bg-card overflow-hidden ${i === active ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.brands?.name && (
              <div className="text-xs font-medium uppercase tracking-wide text-primary">{product.brands.name}</div>
            )}
            <h1 className="mt-1 text-2xl md:text-3xl font-bold">{product.name}</h1>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-semibold">{Number(product.rating ?? 0).toFixed(1)}</span>
              <span className="text-muted-foreground">• {product.sold_count ?? 0} vendus</span>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <div className="text-3xl md:text-4xl font-bold text-primary">{formatCFA(product.price)}</div>
              {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <div className="text-lg text-muted-foreground line-through">{formatCFA(product.compare_price)}</div>
              )}
            </div>

            <div className="mt-3 text-sm">
              {inStock ? (
                <span className="text-success font-medium">En stock ({product.stock} disponibles)</span>
              ) : (
                <span className="text-destructive font-medium">Rupture de stock</span>
              )}
            </div>

            {product.description && (
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
            )}

            <div className="mt-5 grid sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
                <Truck className="h-4 w-4 text-primary" /> Livraison rapide partout au Sénégal
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Garantie officielle & SAV
              </div>
            </div>

            {/* Quantity + order form */}
            <div className="mt-6 rounded-2xl border border-border bg-card p-4 md:p-5">
              {done ? (
                <div className="text-center py-4">
                  <h2 className="text-lg font-bold">Merci pour votre commande !</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Numéro de commande : <span className="font-semibold text-foreground">{done}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Notre équipe vous contacte pour confirmer la livraison.</p>
                  <Link to="/" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
                    Continuer mes achats
                  </Link>
                </div>
              ) : (
                <form onSubmit={submitOrder} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Quantité</span>
                    <div className="flex items-center rounded-xl border border-border overflow-hidden">
                      <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-9 w-9 grid place-items-center hover:bg-muted">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</span>
                      <button type="button" onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} className="h-9 w-9 grid place-items-center hover:bg-muted">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="ml-auto text-sm">
                      Total : <span className="font-bold text-primary">{formatCFA(subtotal)}</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input id="name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Awa Diop" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input id="phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="77 123 45 67" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email (optionnel)</Label>
                      <Input id="email" type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input id="city" value={form.shipping_city} onChange={(e) => setForm({ ...form, shipping_city: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Adresse de livraison *</Label>
                    <Input id="address" value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} placeholder="Quartier, rue, repère..." />
                  </div>

                  <div>
                    <Label>Moyen de paiement</Label>
                    <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Note (optionnel)</Label>
                    <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      disabled={!inStock}
                      onClick={() => {
                        addItem({ id: product!.id, name: product!.name, slug: product!.slug, price: Number(product!.price), image: images[0] ?? null }, qty);
                        toast.success("Ajouté au panier");
                        setCartOpen(true);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" /> Ajouter au panier
                    </Button>
                    <Button type="submit" size="lg" disabled={!inStock || submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : inStock ? "Commander maintenant" : "Indisponible"}
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openWhatsApp(
                        buildOrderMessage([{ name: product!.name, quantity: qty, price: Number(product!.price) }]) +
                          `\nLien : ${typeof window !== "undefined" ? window.location.href : ""}`,
                      )
                    }
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-elevated transition hover:brightness-95"
                  >
                    <MessageCircle className="h-4 w-4" /> Commander sur WhatsApp
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Partage */}
        <ProductShare product={product} image={images[0]} />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl md:text-2xl font-bold mb-5">Produits similaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {related.map((p: any) => <ProductCard key={p.id} p={p} />)}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}

function ProductShare({ product, image }: { product: any; image?: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `${product.name} — ${formatCFA(product.price)} chez FALL ELECTRO.SN`;

  function shareWhatsApp() {
    openWhatsApp(`${text}\n\nVoir le produit 👇\n${url}`);
  }
  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer,width=600,height=540");
  }
  async function shareInstagram() {
    // Instagram n'a pas de lien de partage direct : on copie le lien + texte
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      toast.success("Lien copié ! Collez-le dans votre story ou message Instagram.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  }
  async function shareNative() {
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text, url }); } catch {}
    } else {
      shareInstagram();
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Share2 className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold">Partager ce produit</span>
        <div className="flex flex-wrap gap-2 ml-auto">
          <button onClick={shareWhatsApp} aria-label="Partager sur WhatsApp" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white hover:brightness-95 transition">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
          <button onClick={shareFacebook} aria-label="Partager sur Facebook" className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-xs font-semibold text-white hover:brightness-95 transition">
            <Facebook className="h-4 w-4" /> Facebook
          </button>
          <button onClick={shareInstagram} aria-label="Partager sur Instagram" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] px-4 py-2.5 text-xs font-semibold text-white hover:brightness-95 transition">
            {copied ? <Link2 className="h-4 w-4" /> : <Instagram className="h-4 w-4" />} Instagram
          </button>
          <button onClick={shareNative} aria-label="Autres options de partage" className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold hover:bg-muted transition">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

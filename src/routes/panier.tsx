import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Minus, Plus, Trash2, ShoppingCart, MessageCircle } from "lucide-react";
import { openWhatsApp, buildOrderMessage } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { formatCFA } from "@/lib/format";
import { SiteLayout } from "@/components/shop/SiteLayout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Mon panier — ElectroMaison" },
      { name: "description", content: "Vérifiez vos articles et finalisez votre commande avec livraison rapide partout au Sénégal." },
      { property: "og:title", content: "Mon panier — ElectroMaison" },
      { property: "og:description", content: "Vérifiez vos articles et finalisez votre commande avec livraison rapide partout au Sénégal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

const paymentMethods = [
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "free_money", label: "Free Money" },
  { value: "cash_on_delivery", label: "Paiement à la livraison" },
  { value: "card", label: "Carte bancaire" },
  { value: "whatsapp", label: "Commande WhatsApp" },
] as const;

function CartPage() {
  const { items, total, setQuantity, removeItem, clear } = useCart();
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
        p_items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      });
      if (error) throw error;
      setDone(orderNumber as string);
      clear();
      toast.success("Commande enregistrée ! Nous vous appelons rapidement.");
    } catch (err: any) {
      toast.error(err?.message ?? "Impossible d'enregistrer la commande.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Merci pour votre commande !</h1>
          <p className="mt-2 text-muted-foreground">
            Numéro de commande : <span className="font-semibold text-foreground">{done}</span>
          </p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            Continuer mes achats
          </Link>
        </div>
      </SiteLayout>
    );
  }

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          <ShoppingCart className="mx-auto h-10 w-10 mb-3 opacity-50" />
          <h1 className="text-2xl font-bold text-foreground">Votre panier est vide</h1>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            Découvrir les produits
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-3 sm:px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold">Mon panier</h1>

        <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="h-20 w-20 shrink-0 rounded-xl bg-muted overflow-hidden grid place-items-center">
                  {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-contain p-1.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link to="/produit/$slug" params={{ slug: i.slug }} className="text-sm font-medium line-clamp-2 hover:text-primary">
                    {i.name}
                  </Link>
                  <div className="mt-1 text-sm font-bold text-primary">{formatCFA(i.price * i.quantity)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-border overflow-hidden">
                      <button type="button" aria-label="Diminuer" onClick={() => setQuantity(i.id, i.quantity - 1)} className="h-8 w-8 grid place-items-center hover:bg-muted">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-xs font-semibold tabular-nums">{i.quantity}</span>
                      <button type="button" aria-label="Augmenter" onClick={() => setQuantity(i.id, i.quantity + 1)} className="h-8 w-8 grid place-items-center hover:bg-muted">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button type="button" aria-label="Retirer" onClick={() => removeItem(i.id)} className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={submitOrder} className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-4 h-fit">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">{formatCFA(total)}</span>
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

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider la commande"}
            </Button>

            <button
              type="button"
              onClick={() => openWhatsApp(buildOrderMessage(items.map((i) => ({ name: i.name, quantity: i.quantity, price: Number(i.price) })), total))}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-elevated transition hover:brightness-95"
            >
              <MessageCircle className="h-4 w-4" /> Commander sur WhatsApp
            </button>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
}

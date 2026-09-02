import { Star, Heart, ShoppingCart, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { formatCFA } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";

export function ProductGrid({ products, empty }: { products: any[]; empty?: string }) {
  if (!products.length) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-16 text-center text-muted-foreground">
        {empty ?? "Aucun produit pour le moment."}
      </div>
    );
  }
  return (
    <div className="container mx-auto px-3 sm:px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
        {products.map((p: any) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}

export function ProductCard({ p }: { p: any }) {
  const { addItem, setOpen } = useCart();
  const [added, setAdded] = useState(false);
  const img = p.product_images?.find((i: any) => i.is_primary)?.image_url ?? p.product_images?.[0]?.image_url;
  const discount = p.compare_price && p.compare_price > p.price
    ? Math.round((1 - Number(p.price) / Number(p.compare_price)) * 100)
    : null;

  function handleAdd() {
    addItem({ id: p.id, name: p.name, slug: p.slug, price: Number(p.price), image: img ?? null });
    toast.success("Ajouté au panier");
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
    setOpen(true);
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-elevated hover:border-primary/30">
      <Link to="/produit/$slug" params={{ slug: p.slug }} className="block">
        <div className="relative aspect-square bg-muted/50 overflow-hidden">
          {img && (
            <img
              src={img}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.06]"
            />
          )}
          {discount && (
            <span className="absolute top-2.5 left-2.5 rounded-full bg-destructive text-destructive-foreground text-[10px] md:text-xs font-bold px-2 py-0.5">
              -{discount}%
            </span>
          )}
          <button
            type="button"
            aria-label="Ajouter aux favoris"
            onClick={(e) => { e.preventDefault(); toast.success("Ajouté aux favoris"); }}
            className="absolute top-2.5 right-2.5 grid place-items-center h-8 w-8 rounded-full bg-card/90 backdrop-blur border border-border text-muted-foreground hover:text-primary transition"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <Link to="/produit/$slug" params={{ slug: p.slug }}>
          <h3 className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 min-h-9 md:min-h-10 hover:text-primary transition">
            {p.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-warning text-warning shrink-0" />
          <span className="font-semibold text-foreground">{Number(p.rating ?? 0).toFixed(1)}</span>
          <span className="truncate">• {p.sold_count ?? 0} vendus</span>
        </div>

        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-sm md:text-lg font-bold text-primary">{formatCFA(p.price)}</span>
          {p.compare_price && (
            <span className="text-[11px] text-muted-foreground line-through">{formatCFA(p.compare_price)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="mt-3 flex h-9 md:h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary-soft text-primary text-xs md:text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          <span>{added ? "Ajouté" : "Ajouter"}</span>
        </button>
      </div>
    </article>
  );
}

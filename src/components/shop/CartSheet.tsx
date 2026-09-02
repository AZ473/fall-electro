import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatCFA } from "@/lib/format";

export function CartSheet() {
  const { items, total, count, setQuantity, removeItem, open, setOpen } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Mon panier ({count})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center text-center text-muted-foreground px-6">
            <div>
              <ShoppingCart className="mx-auto h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">Votre panier est vide.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 space-y-3">
            {items.map((i) => (
              <div key={i.id} className="flex gap-3 rounded-xl border border-border bg-card p-2.5">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden grid place-items-center">
                  {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-contain p-1" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/produit/$slug"
                    params={{ slug: i.slug }}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium line-clamp-2 hover:text-primary"
                  >
                    {i.name}
                  </Link>
                  <div className="mt-1 text-sm font-bold text-primary">{formatCFA(i.price * i.quantity)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-border overflow-hidden">
                      <button aria-label="Diminuer" onClick={() => setQuantity(i.id, i.quantity - 1)} className="h-7 w-7 grid place-items-center hover:bg-muted">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold tabular-nums">{i.quantity}</span>
                      <button aria-label="Augmenter" onClick={() => setQuantity(i.id, i.quantity + 1)} className="h-7 w-7 grid place-items-center hover:bg-muted">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button aria-label="Retirer" onClick={() => removeItem(i.id)} className="h-7 w-7 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <SheetFooter className="border-t border-border">
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-primary">{formatCFA(total)}</span>
            </div>
            <Button asChild size="lg" className="w-full" disabled={items.length === 0}>
              <Link to="/panier" onClick={() => setOpen(false)}>Commander</Link>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

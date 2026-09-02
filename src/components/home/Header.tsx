import { Search, User, ShoppingCart, Heart } from "lucide-react";
import logoFull from "@/assets/logo-fall-electro.png";
import logoMark from "@/assets/logo-mark.png";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCart } from "@/hooks/use-cart";
import { formatCFA } from "@/lib/format";

export function Header() {
  const { user } = useAuth();
  const { count, total, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-3 md:gap-6 py-3 md:py-4">
          <SidebarTrigger className="shrink-0" />
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-2.5 shrink-0 min-w-0" aria-label="Fall Electro.sn — accueil">
            <img src={logoMark} alt="Fall Electro.sn" width={400} height={400} className="h-9 w-9 md:h-10 md:w-10 shrink-0 sm:hidden" />
            <img src={logoFull} alt="Fall Electro.sn" width={1536} height={512} className="hidden sm:block h-8 md:h-9 w-auto" />
          </Link>

          {/* Search */}
          <div className="flex-1 min-w-0 max-w-2xl">
            <div className="relative flex h-10 md:h-12 items-center rounded-2xl border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition">
              <input
                type="text"
                placeholder="Rechercher..."
                className="flex-1 min-w-0 h-full bg-transparent px-3 md:px-5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button aria-label="Rechercher" className="h-8 md:h-10 mr-1 px-3 md:px-5 rounded-xl bg-primary-gradient text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-95 transition shrink-0">
                <Search className="h-4 w-4" /> <span className="hidden md:inline">Rechercher</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            <Link to={user ? "/account" : "/auth"} className="hidden sm:flex items-center gap-2 group">
              <User className="h-5 w-5" />
              <div className="leading-tight hidden md:block">
                <div className="text-xs text-muted-foreground">{user ? "Bonjour" : "Se connecter"}</div>
                <div className="text-sm font-medium group-hover:text-primary">Mon compte</div>
              </div>
            </Link>
            <a href="#" className="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted transition">
              <Heart className="h-5 w-5" />
            </a>
            <button type="button" onClick={() => setOpen(true)} aria-label="Ouvrir le panier" className="flex items-center gap-2.5 group">
              <div className="relative grid h-9 w-9 md:h-10 md:w-10 place-items-center rounded-xl bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{count}</span>
                )}
              </div>
              <div className="hidden md:block leading-tight text-left">
                <div className="text-xs text-muted-foreground">Panier</div>
                <div className="text-sm font-bold">{formatCFA(total)}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

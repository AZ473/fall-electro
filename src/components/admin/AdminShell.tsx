import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, ArrowLeft, Zap, Award, Menu } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Produits", icon: Package },
  { to: "/admin/orders", label: "Commandes", icon: ShoppingBag },
  { to: "/admin/customers", label: "Clients", icon: Users },
  { to: "/admin/categories", label: "Catégories", icon: Tag },
  { to: "/admin/brands", label: "Marques", icon: Award },
];

function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex flex-col h-full bg-card">
      <Link to="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-border shrink-0">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-gradient text-primary-foreground">
          <Zap className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold">ElectroMaison</div>
          <div className="text-[10px] text-muted-foreground">Espace admin</div>
        </div>
      </Link>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted hover:text-foreground"
            )}>
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <Link to="/" className="m-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground rounded-xl px-3 py-2 hover:bg-muted shrink-0">
        <ArrowLeft className="h-4 w-4" /> Retour à la boutique
      </Link>
    </div>
  );
}

export function AdminShell({ children, title, actions }: { children: ReactNode; title: string; actions?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border flex-col sticky top-0 h-screen">
        <AdminSidebar />
      </aside>
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-card border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2 mr-1">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64" onClick={(e) => {
                if ((e.target as HTMLElement).closest('a')) setOpen(false);
              }}>
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <AdminSidebar />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <div className="p-4 md:p-8 flex-1 w-full max-w-full overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}

import { Truck, Phone } from "lucide-react";

export function TopBar() {
  return (
    <div className="hidden md:block border-b border-border bg-muted/40 text-xs">
      <div className="container mx-auto flex h-9 items-center justify-between px-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Truck className="h-3.5 w-3.5" /> Livraison rapide partout au Sénégal
        </span>
        <a href="https://wa.me/221765779574" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
          <Phone className="h-3.5 w-3.5" /> WhatsApp : 76 577 95 74
        </a>
      </div>
    </div>
  );
}

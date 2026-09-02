import { Truck, ShieldCheck, CreditCard } from "lucide-react";

const items = [
  { icon: Truck, title: "Livraison rapide", sub: "Partout au Sénégal" },
  { icon: ShieldCheck, title: "Produits garantis", sub: "Jusqu'à 24 mois" },
  { icon: CreditCard, title: "Paiement sécurisé", sub: "Wave, OM, carte" },
];

export function TrustBar() {
  return (
    <section className="container mx-auto px-4 pb-8">
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 rounded-2xl border border-border bg-card/50 py-5 px-6 shadow-card-soft">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-full bg-primary-soft text-primary shrink-0">
              <it.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

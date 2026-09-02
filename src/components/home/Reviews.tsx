import { Star, Quote } from "lucide-react";

const reviews = [
  { name: "Aminata D.", city: "Dakar", text: "Livraison ultra rapide et produit conforme. Mon nouveau frigo fonctionne parfaitement. Je recommande vivement ElectroMaison !", rating: 5 },
  { name: "Moussa S.", city: "Thiès", text: "Excellent service client. J'ai pu commander via WhatsApp et payer avec Wave en quelques minutes. Top !", rating: 5 },
  { name: "Fatou N.", city: "Saint-Louis", text: "Les prix sont vraiment imbattables. La cuisinière est de très bonne qualité, je suis ravie de mon achat.", rating: 4 },
];

export function Reviews() {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-8 md:py-10">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Ce que disent nos clients</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Plus de 25 000 clients satisfaits au Sénégal</p>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {reviews.map((r) => (
          <div key={r.name} className="relative rounded-2xl border border-border bg-card p-5 md:p-6 shadow-card-soft hover:shadow-elevated transition">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-primary-soft" />
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
              ))}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">"{r.text}"</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-full bg-primary-gradient text-primary-foreground text-sm font-bold">
                {r.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

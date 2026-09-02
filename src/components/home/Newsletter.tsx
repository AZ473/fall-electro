import { Mail, Sparkles } from "lucide-react";

export function Newsletter() {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-8 md:py-10">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-hero-gradient p-6 sm:p-8 md:p-12 text-navy-foreground">
        <div className="absolute -top-16 -right-16 h-60 w-60 rounded-full bg-primary/40 blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-warning/20 text-warning px-3 py-1.5 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Avantage exclusif
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold">Recevez nos meilleures offres en avant-première</h2>
            <p className="mt-3 text-sm md:text-base text-navy-foreground/70">Inscrivez-vous à notre newsletter et obtenez <span className="font-semibold text-primary">5 000 CFA</span> de réduction sur votre première commande.</p>
          </div>
          <form className="flex flex-col sm:flex-row gap-2 sm:gap-3 bg-card/10 backdrop-blur rounded-2xl border border-white/10 p-2">
            <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 min-w-0">
              <Mail className="h-4 w-4 text-navy-foreground/60 shrink-0" />
              <input type="email" placeholder="Votre adresse email" className="flex-1 min-w-0 h-11 sm:h-12 bg-transparent text-sm outline-none placeholder:text-navy-foreground/50" />
            </div>
            <button className="rounded-xl bg-primary-gradient px-5 sm:px-6 py-3 text-sm font-semibold shadow-elevated hover:scale-[1.02] transition shrink-0">
              S'inscrire
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

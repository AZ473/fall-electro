import heroImg from "@/assets/hero-appliances.jpg";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-4 md:py-6">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-hero-gradient shadow-elevated">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/40 blur-3xl animate-glow" />
        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-primary/30 blur-3xl animate-glow" />

        <div className="relative grid lg:grid-cols-2 gap-6 items-center min-h-[360px] md:min-h-[440px] p-5 sm:p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-navy-foreground"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-warning/20 text-warning px-3 py-1.5 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Offre spéciale
            </span>
            <h1 className="mt-4 md:mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05]">
              Équipez votre maison<br />
              <span className="bg-gradient-to-r from-primary to-[oklch(0.7_0.2_264)] bg-clip-text text-transparent">avec les meilleurs appareils</span>
            </h1>
            <p className="mt-4 md:mt-5 max-w-md text-sm sm:text-base md:text-lg text-navy-foreground/70">
              Découvrez nos produits de qualité supérieure aux meilleurs prix du marché.
            </p>
            <div className="mt-6 md:mt-8 flex flex-wrap gap-3">
              <button className="group inline-flex items-center gap-2 rounded-2xl bg-primary-gradient text-primary-foreground px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-semibold shadow-elevated hover:scale-[1.02] transition">
                Découvrir maintenant
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 backdrop-blur text-navy-foreground px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-semibold hover:bg-white/10 transition">
                Voir les promos
              </button>
            </div>
          </motion.div>

          <div className="relative">
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              src={heroImg}
              alt="Sélection d'appareils électroménagers premium"
              width={1600}
              height={900}
              className="w-full h-auto rounded-2xl"
            />
            <motion.div
              initial={{ opacity: 0, rotate: -20, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
              className="absolute top-3 right-3 md:top-8 md:right-8 grid place-items-center h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36 rounded-full bg-navy/70 backdrop-blur border-2 border-primary/40 text-navy-foreground text-center shadow-glow"
            >
              <div>
                <div className="text-[9px] md:text-[10px] tracking-widest opacity-80">JUSQU'À</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-[oklch(0.75_0.18_264)] bg-clip-text text-transparent">-30%</div>
                <div className="text-[8px] md:text-[9px] tracking-widest opacity-80">DE RÉDUCTION</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

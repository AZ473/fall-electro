import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";
import logoMark from "@/assets/logo-mark.png";

const cols = [
  { title: "Boutique", links: ["Toutes les catégories", "Promotions", "Nouveautés", "Meilleures ventes", "Bons plans"] },
  { title: "Aide", links: ["Suivre ma commande", "Livraison & retours", "Garantie", "FAQ", "Nous contacter"] },
  { title: "À propos", links: ["Notre histoire", "Magasins", "Carrières", "Presse", "Blog"] },
];

export function Footer() {
  return (
    <footer className="mt-10 bg-navy text-navy-foreground">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          <div className="col-span-2 lg:col-span-2">
            <a href="/" className="inline-flex items-center gap-2.5" aria-label="Fall Electro.sn — accueil">
              <img src={logoMark} alt="Fall Electro.sn" width={400} height={400} loading="lazy" className="h-10 w-10" />
              <div className="leading-tight">
                <div className="text-lg font-bold tracking-tight">
                  FALL ELECTRO<span className="text-primary">.SN</span>
                </div>
                <div className="text-[10px] text-navy-foreground/60 -mt-0.5">Électroménager & maison — Dakar</div>
              </div>
            </a>
            <p className="mt-4 text-sm text-navy-foreground/70 max-w-md">
              Votre destination premium pour l'électroménager, le mobilier et l'équipement de la maison au Sénégal. Qualité, prix justes, et service exceptionnel.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-navy-foreground/70">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary shrink-0" /> Showroom Dakar — Avenue Lamine Gueye</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary shrink-0" /> <a href="https://wa.me/221765779574" target="_blank" rel="noopener noreferrer" className="hover:text-primary">76 577 95 74 (WhatsApp)</a></li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary shrink-0" /> <a href="tel:+221772350414" className="hover:text-primary">77 235 04 14</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary shrink-0" /> contact@fallelectro.sn</li>
            </ul>
            <div className="mt-5 flex gap-3">
              {[Facebook, Twitter, Instagram].map((I, i) => (
                <a key={i} href="#" className="grid place-items-center h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:border-primary transition">
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="text-sm font-semibold mb-4">{c.title}</h3>
              <ul className="space-y-2.5 text-sm text-navy-foreground/70">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="hover:text-primary transition">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-navy-foreground/60">
          <div className="text-center md:text-left">© 2026 Fall Electro.sn. Tous droits réservés.</div>
          <div className="flex flex-wrap justify-center gap-2 items-center">
            <span>Paiements :</span>
            {["Wave", "Orange Money", "Free Money", "Visa", "Mastercard"].map((p) => (
              <span key={p} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-medium text-navy-foreground/80">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

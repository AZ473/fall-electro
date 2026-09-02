import { createFileRoute } from "@tanstack/react-router";
import { Truck, ShieldCheck, Headphones, Award } from "lucide-react";
import { PageShell, PageHeader } from "@/components/shop/PageShell";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — ElectroMaison" },
      { name: "description", content: "ElectroMaison, votre spécialiste électroménager et mobilier au Sénégal." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Award, title: "Qualité premium", desc: "Des marques reconnues et des produits soigneusement sélectionnés." },
  { icon: Truck, title: "Livraison rapide", desc: "Livraison partout au Sénégal, avec installation possible à Dakar." },
  { icon: ShieldCheck, title: "Paiement sécurisé", desc: "Wave, Orange Money, Visa — toutes les transactions sont chiffrées." },
  { icon: Headphones, title: "Service client", desc: "Une équipe à votre écoute du lundi au samedi." },
];

function AboutPage() {
  return (
    <PageShell>
      <PageHeader title="À propos d'ElectroMaison" subtitle="Le meilleur pour votre maison, au juste prix." />
      <section className="container mx-auto px-3 sm:px-4 py-8 md:py-10 space-y-10">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            <p>ElectroMaison est une plateforme sénégalaise dédiée à l'électroménager et au mobilier de qualité. Notre mission est simple : rendre accessible aux foyers sénégalais les meilleurs produits, avec un service à la hauteur.</p>
            <p>Nous travaillons directement avec les plus grandes marques pour vous garantir des produits authentiques, garantis, et livrés rapidement partout au Sénégal.</p>
            <p>Que ce soit pour équiper une nouvelle maison ou remplacer un appareil, notre équipe vous accompagne du choix jusqu'à l'installation.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4">Nos engagements</h2>
            <ul className="space-y-3 text-sm">
              <li>✅ Produits authentiques et garantis</li>
              <li>✅ Livraison rapide partout au Sénégal</li>
              <li>✅ Prix justes et transparents</li>
              <li>✅ Service après-vente disponible</li>
              <li>✅ Paiement sécurisé Wave / OM / Visa</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-semibold text-sm md:text-base">{v.title}</h3>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

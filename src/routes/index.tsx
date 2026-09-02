import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/shop/SiteLayout";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { Categories } from "@/components/home/Categories";
import { FlashSales } from "@/components/home/FlashSales";
import { NewArrivals } from "@/components/home/NewArrivals";
import { Brands } from "@/components/home/Brands";
import { Reviews } from "@/components/home/Reviews";
import { Newsletter } from "@/components/home/Newsletter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ElectroMaison — Électroménager & mobilier premium au Sénégal" },
      { name: "description", content: "Achetez en ligne TV, réfrigérateurs, climatiseurs, cuisinières, mobilier et plus. Livraison rapide partout au Sénégal, paiement sécurisé Wave, Orange Money, Visa." },
      { property: "og:title", content: "ElectroMaison — Électroménager & mobilier premium au Sénégal" },
      { property: "og:description", content: "Achetez en ligne TV, réfrigérateurs, climatiseurs, cuisinières, mobilier et plus. Livraison rapide partout au Sénégal, paiement sécurisé Wave, Orange Money, Visa." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <TrustBar />
      <Categories />
      <FlashSales />
      <NewArrivals />

      <Brands />
      <Reviews />
      <Newsletter />
    </SiteLayout>
  );
}

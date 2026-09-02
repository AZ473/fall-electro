import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/shop/PageShell";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const Route = createFileRoute("/meilleures-ventes")({
  head: () => ({
    meta: [
      { title: "Meilleures ventes — ElectroMaison" },
      { name: "description", content: "Les produits préférés de nos clients au Sénégal." },
    ],
  }),
  component: BestSellersPage,
});

function BestSellersPage() {
  const { data = [] } = useQuery({
    queryKey: ["page-bestsellers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,price,compare_price,rating,sold_count,product_images(image_url,is_primary)")
        .eq("is_active", true)
        .order("sold_count", { ascending: false })
        .limit(40);
      return data ?? [];
    },
  });
  return (
    <PageShell>
      <PageHeader title="Meilleures ventes" subtitle="Les produits les plus achetés par nos clients." />
      <ProductGrid products={data} />
    </PageShell>
  );
}

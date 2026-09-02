import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/shop/PageShell";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const Route = createFileRoute("/nouveautes")({
  head: () => ({
    meta: [
      { title: "Nouveautés — ElectroMaison" },
      { name: "description", content: "Découvrez les dernières nouveautés en électroménager et mobilier." },
    ],
  }),
  component: NouveautesPage,
});

function NouveautesPage() {
  const { data = [] } = useQuery({
    queryKey: ["page-nouveautes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,price,compare_price,rating,sold_count,product_images(image_url,is_primary)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(40);
      return data ?? [];
    },
  });
  return (
    <PageShell>
      <PageHeader title="Nouveautés" subtitle="Les derniers produits ajoutés à notre catalogue." />
      <ProductGrid products={data} />
    </PageShell>
  );
}

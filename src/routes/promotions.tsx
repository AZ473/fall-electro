import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/shop/PageShell";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions — ElectroMaison" },
      { name: "description", content: "Toutes les promotions et réductions sur l'électroménager et le mobilier au Sénégal." },
    ],
  }),
  component: PromotionsPage,
});

function PromotionsPage() {
  const { data = [] } = useQuery({
    queryKey: ["page-promotions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,price,compare_price,rating,sold_count,product_images(image_url,is_primary)")
        .eq("is_active", true)
        .not("compare_price", "is", null)
        .order("created_at", { ascending: false })
        .limit(60);
      return (data ?? []).filter((p: any) => p.compare_price && Number(p.compare_price) > Number(p.price));
    },
  });
  return (
    <PageShell>
      <PageHeader title="Promotions" subtitle="Les meilleures réductions du moment, à saisir tant qu'il y en a." />
      <ProductGrid products={data} empty="Aucune promotion en cours." />
    </PageShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/shop/PageShell";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const Route = createFileRoute("/categorie/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Catégorie ${params.slug} — ElectroMaison` },
      { name: "description", content: "Découvrez notre sélection par catégorie : électroménager, mobilier et high-tech livrés partout au Sénégal." },
      { property: "og:title", content: "Catégorie — ElectroMaison" },
      { property: "og:description", content: "Découvrez notre sélection par catégorie : électroménager, mobilier et high-tech livrés partout au Sénégal." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();

  const { data } = useQuery({
    queryKey: ["category-page", slug],
    queryFn: async () => {
      const { data: cat } = await supabase
        .from("categories")
        .select("id,name,description")
        .eq("slug", slug)
        .maybeSingle();
      if (!cat) return { cat: null, products: [] as any[] };
      const { data: products } = await supabase
        .from("products")
        .select("id,name,slug,price,compare_price,rating,sold_count,product_images(image_url,is_primary)")
        .eq("is_active", true)
        .eq("category_id", cat.id)
        .order("created_at", { ascending: false })
        .limit(60);
      return { cat, products: products ?? [] };
    },
  });

  return (
    <PageShell>
      <PageHeader
        title={data?.cat?.name ?? "Catégorie"}
        subtitle={data?.cat?.description ?? "Notre sélection dans cette catégorie."}
      />
      <ProductGrid products={data?.products ?? []} empty="Aucun produit dans cette catégorie." />
    </PageShell>
  );
}

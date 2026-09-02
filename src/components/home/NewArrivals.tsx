import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductGrid";
import { supabase } from "@/integrations/supabase/client";

export function NewArrivals() {
  const { data: products = [] } = useQuery({
    queryKey: ["home-new-arrivals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,price,compare_price,rating,sold_count,product_images(image_url,is_primary)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  if (!products.length) return null;

  return (
    <section className="container mx-auto px-3 sm:px-4 py-8 md:py-12">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 grid place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="text-lg md:text-2xl font-bold tracking-tight">Nouveautés</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Les derniers produits ajoutés à la boutique</p>
          </div>
        </div>
        <Link to="/nouveautes" className="shrink-0 text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
          Tout voir <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
        {products.map((p: any) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

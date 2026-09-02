import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function Categories() {
  const { data: cats = [] } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,name,slug,image_url")
        .eq("is_popular", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  if (cats.length === 0) return null;

  return (
    <section className="container mx-auto px-3 sm:px-4 py-8 md:py-10">
      <div className="flex items-end justify-between gap-3 mb-5 md:mb-6">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Catégories populaires</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Trouvez tout ce dont votre maison a besoin</p>
        </div>
        <a href="#" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0">
          Voir toutes les catégories <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
        {cats.map((c) => (
          <Link
            key={c.id}
            to="/categorie/$slug"
            params={{ slug: c.slug }}
            className="group rounded-2xl border border-border bg-card p-3 hover:border-primary hover:shadow-elevated transition flex flex-col items-center text-center"
          >
            <div className="aspect-square w-full rounded-xl bg-muted overflow-hidden grid place-items-center p-2">
              {c.image_url && (
                <img src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-contain group-hover:scale-105 transition" />
              )}
            </div>
            <div className="mt-3 text-xs sm:text-sm font-medium group-hover:text-primary line-clamp-1">{c.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

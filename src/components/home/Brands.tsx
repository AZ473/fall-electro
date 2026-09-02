import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function Brands() {
  const { data: brands = [] } = useQuery({
    queryKey: ["home-brands"],
    queryFn: async () => (await supabase.from("brands").select("id,name,logo_url").order("name")).data ?? [],
  });

  if (brands.length === 0) return null;

  return (
    <section className="container mx-auto px-3 sm:px-4 py-8 md:py-10">
      <div className="rounded-2xl md:rounded-3xl bg-muted/50 border border-border p-5 md:p-8">
        <div className="text-center mb-5 md:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Marques de confiance</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Les plus grandes marques mondiales à portée de main</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
          {brands.map((b: any) => (
            <div key={b.id} className="h-14 md:h-16 grid place-items-center rounded-xl bg-card border border-border text-xs md:text-sm font-bold text-muted-foreground hover:text-primary hover:border-primary transition px-2">
              {b.logo_url ? <img src={b.logo_url} alt={b.name} className="max-h-8 md:max-h-10 object-contain" /> : b.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductGrid";
import { supabase } from "@/integrations/supabase/client";

function useCountdown(target?: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  if (!target) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return {
    expired: diff <= 0,
    days: Math.floor(diff / 86_400_000),
    hh: pad(Math.floor((diff % 86_400_000) / 3_600_000)),
    mm: pad(Math.floor((diff % 3_600_000) / 60_000)),
    ss: pad(Math.floor((diff % 60_000) / 1000)),
  };
}

export function FlashSales() {
  const { data: products = [], refetch } = useQuery({
    queryKey: ["home-flash-sales"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,price,compare_price,rating,sold_count,flash_sale_ends_at,product_images(image_url,is_primary)")
        .eq("is_active", true)
        .eq("is_flash_sale", true)
        .or(`flash_sale_ends_at.is.null,flash_sale_ends_at.gt.${nowIso}`)
        .order("flash_sale_ends_at", { ascending: true, nullsFirst: false })
        .limit(10);
      return data ?? [];
    },
  });

  const earliestEnd = products.reduce<string | null>((min, p: any) => {
    if (!p.flash_sale_ends_at) return min;
    if (!min || new Date(p.flash_sale_ends_at) < new Date(min)) return p.flash_sale_ends_at;
    return min;
  }, null);
  const countdown = useCountdown(earliestEnd);

  // Quand le minuteur atteint zéro, on recharge pour retirer les offres expirées
  useEffect(() => {
    if (countdown?.expired) refetch();
  }, [countdown?.expired, refetch]);

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-3 sm:px-4 py-8 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-5 md:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 md:h-7 md:w-7 fill-warning text-warning" /> Offres du jour
        </h2>
        {countdown && !countdown.expired && (
          <div className="flex items-center gap-2" suppressHydrationWarning>
            <span className="text-xs sm:text-sm text-muted-foreground">Se termine dans</span>
            <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm font-bold">
              {countdown.days > 0 && (
                <span className="grid place-items-center min-w-8 md:min-w-10 h-8 md:h-10 rounded-lg bg-navy text-navy-foreground px-1.5 md:px-2 tabular-nums">
                  {countdown.days}j
                </span>
              )}
              {[countdown.hh, countdown.mm, countdown.ss].map((v, i) => (
                <span key={i} className="flex items-center gap-1 md:gap-1.5">
                  <span className="grid place-items-center min-w-8 md:min-w-10 h-8 md:h-10 rounded-lg bg-navy text-navy-foreground px-1.5 md:px-2 tabular-nums">{v}</span>
                  {i < 2 && <span className="text-primary">:</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
        {products.map((p: any) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}

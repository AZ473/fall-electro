import type { ReactNode } from "react";
import { SiteLayout } from "@/components/shop/SiteLayout";

export function PageShell({ children }: { children: ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="container mx-auto px-3 sm:px-4 pt-8 md:pt-10">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{title}</h1>
      {subtitle && <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>}
    </div>
  );
}

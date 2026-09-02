import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, Tag, Sparkles, TrendingUp, Info, Phone, Zap, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logoFull from "@/assets/logo-fall-electro.png";
import logoMark from "@/assets/logo-mark.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const links = [
  { label: "Accueil", to: "/", icon: Home },
  { label: "Promotions", to: "/promotions", icon: Tag },
  { label: "Nouveautés", to: "/nouveautes", icon: Sparkles },
  { label: "Meilleures ventes", to: "/meilleures-ventes", icon: TrendingUp },
];

const secondary = [
  { label: "À propos", to: "/a-propos", icon: Info },
  { label: "Contact", to: "/contact", icon: Phone },
];

export function SiteSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useAuth();

  const { data: cats = [] } = useQuery({
    queryKey: ["sidebar-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,name,slug,image_url")
        .order("sort_order");
      return data ?? [];
    },
  });

  const itemClass =
    "relative flex items-center gap-3 rounded-xl font-medium transition data-[active=true]:bg-primary-soft data-[active=true]:text-primary";

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="h-16 justify-center border-b border-border px-3">
        <Link to="/" className="flex items-center gap-2.5 min-w-0" aria-label="Fall Electro.sn — accueil">
          {collapsed ? (
            <img src={logoMark} alt="Fall Electro.sn" width={400} height={400} className="h-9 w-9 shrink-0" />
          ) : (
            <img src={logoFull} alt="Fall Electro.sn" width={1536} height={512} className="h-8 w-auto" />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider">Boutique</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {links.map((l) => (
                <SidebarMenuItem key={l.to}>
                  <SidebarMenuButton asChild isActive={pathname === l.to} tooltip={l.label} className={itemClass}>
                    <Link to={l.to}>
                      <l.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{l.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider">Mon compte</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === (user ? "/account" : "/auth")} tooltip={user ? "Mon compte" : "Se connecter"} className={itemClass}>
                  <Link to={user ? "/account" : "/auth"}>
                    <User className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{user ? "Mon profil" : "Se connecter"}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {cats.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider">Catégories</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {cats.map((c) => {
                  const active = pathname === `/categorie/${c.slug}`;
                  return (
                    <SidebarMenuItem key={c.id}>
                      <SidebarMenuButton asChild isActive={active} tooltip={c.name} className={itemClass} size="lg">
                        <Link to="/categorie/$slug" params={{ slug: c.slug }}>
                          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
                            {c.image_url ? (
                              <img src={c.image_url} alt="" loading="lazy" className="h-full w-full object-contain p-0.5" />
                            ) : (
                              <Tag className="h-5 w-5 text-muted-foreground group-data-[collapsible=icon]:h-3 group-data-[collapsible=icon]:w-3" />
                            )}
                          </span>
                          {!collapsed && <span className="truncate text-base">{c.name}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider">Informations</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {secondary.map((l) => (
                <SidebarMenuItem key={l.to}>
                  <SidebarMenuButton asChild isActive={pathname === l.to} tooltip={l.label} className={itemClass}>
                    <Link to={l.to}>
                      <l.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{l.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="border-t border-border p-3">
          <div className="rounded-xl bg-primary-soft p-3">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold">Besoin d'aide ?</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Conseils & suivi de commande</p>
            <a href="tel:+221765779574" className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary">
              <Phone className="h-3.5 w-3.5" /> 76 577 95 74
            </a>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

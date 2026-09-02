import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Package, LogOut, Shield } from "lucide-react";
import { SiteLayout } from "@/components/shop/SiteLayout";

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Mon compte · ElectroMaison" }] }),
});

function AccountPage() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Mon compte</h1>
        <p className="text-muted-foreground mb-8 break-all">{user?.email}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link to="/account" className="flex items-center sm:block rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-primary hover:shadow-elevated transition">
            <div className="bg-primary/10 p-3 rounded-full sm:p-0 sm:bg-transparent sm:rounded-none mr-4 sm:mr-0 shrink-0">
              <User className="h-6 w-6 text-primary sm:mb-3" />
            </div>
            <div>
              <div className="font-semibold text-base sm:text-lg">Profil</div>
              <div className="text-sm text-muted-foreground">Mes informations</div>
            </div>
          </Link>
          
          <Link to="/account" className="flex items-center sm:block rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-primary hover:shadow-elevated transition">
            <div className="bg-primary/10 p-3 rounded-full sm:p-0 sm:bg-transparent sm:rounded-none mr-4 sm:mr-0 shrink-0">
              <Package className="h-6 w-6 text-primary sm:mb-3" />
            </div>
            <div>
              <div className="font-semibold text-base sm:text-lg">Mes commandes</div>
              <div className="text-sm text-muted-foreground">Historique & suivi</div>
            </div>
          </Link>

          {isAdmin && (
            <Link to="/admin" className="flex items-center sm:block rounded-2xl border border-primary bg-primary-soft p-4 sm:p-5 hover:shadow-elevated transition">
              <div className="bg-primary/20 p-3 rounded-full sm:p-0 sm:bg-transparent sm:rounded-none mr-4 sm:mr-0 shrink-0">
                <Shield className="h-6 w-6 text-primary sm:mb-3" />
              </div>
              <div>
                <div className="font-semibold text-base sm:text-lg">Admin</div>
                <div className="text-sm text-muted-foreground">Dashboard</div>
              </div>
            </Link>
          )}
          
          <button onClick={signOut} className="flex items-center sm:block w-full text-left rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-destructive hover:text-destructive transition group">
            <div className="bg-muted group-hover:bg-destructive/10 p-3 rounded-full sm:p-0 sm:bg-transparent sm:rounded-none mr-4 sm:mr-0 shrink-0 transition-colors">
              <LogOut className="h-6 w-6 text-muted-foreground group-hover:text-destructive sm:mb-3 transition-colors" />
            </div>
            <div>
              <div className="font-semibold text-base sm:text-lg group-hover:text-destructive transition-colors">Déconnexion</div>
              <div className="text-sm text-muted-foreground group-hover:text-destructive/80 transition-colors">Se déconnecter</div>
            </div>
          </button>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="font-semibold mb-4">Bienvenue !</h2>
          <p className="text-sm text-muted-foreground">Votre espace client est prêt. Vous pourrez bientôt suivre vos commandes, gérer vos adresses et consulter votre historique d'achats.</p>
          <Button asChild className="mt-4"><Link to="/">Continuer mes achats</Link></Button>
        </div>
      </div>
    </SiteLayout>
  );
}

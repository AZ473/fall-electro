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
        <p className="text-muted-foreground mb-8">{user?.email}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/account" className="rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-elevated transition">
            <User className="h-6 w-6 text-primary mb-3" />
            <div className="font-semibold">Profil</div>
            <div className="text-sm text-muted-foreground">Mes informations</div>
          </Link>
          <Link to="/account" className="rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-elevated transition">
            <Package className="h-6 w-6 text-primary mb-3" />
            <div className="font-semibold">Mes commandes</div>
            <div className="text-sm text-muted-foreground">Historique & suivi</div>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="rounded-2xl border border-primary bg-primary-soft p-5 hover:shadow-elevated transition">
              <Shield className="h-6 w-6 text-primary mb-3" />
              <div className="font-semibold">Admin</div>
              <div className="text-sm text-muted-foreground">Dashboard</div>
            </Link>
          )}
          <button onClick={signOut} className="text-left rounded-2xl border border-border bg-card p-5 hover:border-destructive hover:text-destructive transition">
            <LogOut className="h-6 w-6 mb-3" />
            <div className="font-semibold">Déconnexion</div>
            <div className="text-sm text-muted-foreground">Se déconnecter</div>
          </button>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Bienvenue !</h2>
          <p className="text-sm text-muted-foreground">Votre espace client est prêt. Vous pourrez bientôt suivre vos commandes, gérer vos adresses et consulter votre historique d'achats.</p>
          <Button asChild className="mt-4"><Link to="/">Continuer mes achats</Link></Button>
        </div>
      </div>
    </SiteLayout>
  );
}

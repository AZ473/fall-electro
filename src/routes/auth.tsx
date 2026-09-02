import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Zap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
  head: () => ({ meta: [{ title: "Connexion · ElectroMaison" }] }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Connecté");
    navigate({ to: "/" });
  };

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fd.get("full_name") as string },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Compte créé ! Vérifiez votre email.");
  };

  const onGoogle = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { setLoading(false); toast.error("Erreur Google"); return; }
    if (res.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary/5 via-background to-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-6">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-gradient text-primary-foreground shadow-elevated">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="leading-tight text-center">
            <div className="text-lg font-bold">ElectroMaison</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">Le meilleur pour votre maison</div>
          </div>
        </Link>

        <div className="rounded-3xl border border-border bg-card shadow-elevated p-6 md:p-8">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={onSignIn} className="space-y-4">
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required /></div>
                <div className="space-y-2"><Label>Mot de passe</Label><Input name="password" type="password" required minLength={6} /></div>
                <div className="text-right text-sm"><Link to="/reset-password" className="text-primary hover:underline">Mot de passe oublié ?</Link></div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={onSignUp} className="space-y-4">
                <div className="space-y-2"><Label>Nom complet</Label><Input name="full_name" required /></div>
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required /></div>
                <div className="space-y-2"><Label>Mot de passe</Label><Input name="password" type="password" required minLength={6} /></div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer mon compte"}</Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OU<div className="h-px flex-1 bg-border" /></div>

          <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={loading}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continuer avec Google
          </Button>
        </div>
      </div>
    </div>
  );
}

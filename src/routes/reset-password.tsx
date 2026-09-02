import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Réinitialiser le mot de passe · ElectroMaison" }] }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isRecovery, setIsRecovery] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);

  const onRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(fd.get("email") as string, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Email envoyé. Vérifiez votre boîte de réception.");
  };

  const onUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: fd.get("password") as string });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Mot de passe mis à jour");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-6">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-gradient text-primary-foreground shadow-elevated">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="text-lg font-bold">ElectroMaison</div>
        </Link>

        <div className="rounded-3xl border border-border bg-card shadow-elevated p-6 md:p-8">
          <h1 className="text-xl font-bold mb-2">{isRecovery ? "Nouveau mot de passe" : "Mot de passe oublié"}</h1>
          <p className="text-sm text-muted-foreground mb-6">{isRecovery ? "Choisissez un nouveau mot de passe." : "Entrez votre email pour recevoir un lien de réinitialisation."}</p>

          {isRecovery ? (
            <form onSubmit={onUpdate} className="space-y-4">
              <div className="space-y-2"><Label>Nouveau mot de passe</Label><Input name="password" type="password" required minLength={6} /></div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mettre à jour"}</Button>
            </form>
          ) : (
            <form onSubmit={onRequest} className="space-y-4">
              <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required /></div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le lien"}</Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm"><Link to="/auth" className="text-primary hover:underline">Retour à la connexion</Link></div>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/products/new")({
  component: () => (
    <AdminShell title="Nouveau produit" actions={<Button asChild variant="outline"><Link to="/admin/products"><ArrowLeft className="h-4 w-4" />Retour</Link></Button>}>
      <ProductForm />
    </AdminShell>
  ),
  head: () => ({ meta: [{ title: "Nouveau produit · Admin" }] }),
});

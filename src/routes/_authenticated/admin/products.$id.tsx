import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: EditProduct,
  head: () => ({ meta: [{ title: "Modifier produit · Admin" }] }),
});

function EditProduct() {
  const { id } = Route.useParams();
  return (
    <AdminShell title="Modifier le produit" actions={<Button asChild variant="outline"><Link to="/admin/products"><ArrowLeft className="h-4 w-4" />Retour</Link></Button>}>
      <ProductForm productId={id} />
    </AdminShell>
  );
}

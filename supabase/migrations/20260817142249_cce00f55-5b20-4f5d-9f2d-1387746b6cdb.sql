-- Split public product read policy so anon never needs is_admin()
DROP POLICY IF EXISTS "Anyone reads active products" ON public.products;

CREATE POLICY "Anon reads active products"
ON public.products FOR SELECT TO anon
USING (is_active);

CREATE POLICY "Users read active products"
ON public.products FOR SELECT TO authenticated
USING (is_active OR public.is_admin());

-- Remove direct RPC access to role-check helpers
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;
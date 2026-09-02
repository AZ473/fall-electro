-- Lock down SECURITY DEFINER trigger functions: they must never be callable via the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.deduct_stock() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Keep only what the app actually needs
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

REVOKE ALL ON FUNCTION public.place_order(text, text, text, text, jsonb, text, text, public.payment_method) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, jsonb, text, text, public.payment_method) TO anon, authenticated;
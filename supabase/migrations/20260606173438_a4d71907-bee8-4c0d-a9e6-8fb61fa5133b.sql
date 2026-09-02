
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id IN ('product-images','brand-logos','category-images'));
CREATE POLICY "Admins upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('product-images','brand-logos','category-images') AND public.is_admin());
CREATE POLICY "Admins update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('product-images','brand-logos','category-images') AND public.is_admin());
CREATE POLICY "Admins delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('product-images','brand-logos','category-images') AND public.is_admin());


-- Allow admins to upload/manage images in product-images, brand-logos, category-images
DO $$ BEGIN
  CREATE POLICY "Admins manage product-images" ON storage.objects FOR ALL TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin())
    WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage brand-logos" ON storage.objects FOR ALL TO authenticated
    USING (bucket_id = 'brand-logos' AND public.is_admin())
    WITH CHECK (bucket_id = 'brand-logos' AND public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage category-images" ON storage.objects FOR ALL TO authenticated
    USING (bucket_id = 'category-images' AND public.is_admin())
    WITH CHECK (bucket_id = 'category-images' AND public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

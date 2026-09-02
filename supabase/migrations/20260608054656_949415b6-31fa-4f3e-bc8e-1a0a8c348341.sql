
DROP POLICY IF EXISTS "Public read images" ON storage.objects;
CREATE POLICY "Public read images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('product-images','brand-logos','category-images'));

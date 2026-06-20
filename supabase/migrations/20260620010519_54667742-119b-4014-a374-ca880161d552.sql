
CREATE POLICY "app-assets read" ON storage.objects FOR SELECT
  USING (bucket_id = 'app-assets');
CREATE POLICY "app-assets insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-assets');
CREATE POLICY "app-assets update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'app-assets');
CREATE POLICY "app-assets delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'app-assets');

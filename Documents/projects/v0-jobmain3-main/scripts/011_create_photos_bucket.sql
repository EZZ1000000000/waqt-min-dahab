-- Create photos bucket for hero slider images
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for photos bucket
CREATE POLICY "Anyone can view photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "Admins can upload photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'photos' AND
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can delete photos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'photos' AND
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can update photos" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'photos' AND
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

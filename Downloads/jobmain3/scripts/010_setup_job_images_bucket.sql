-- Create job-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-images', 'job-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for job-images bucket
CREATE POLICY "Employers can upload job images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'job-images' AND
    auth.uid() IN (
      SELECT profile_id FROM employers
    )
  );

CREATE POLICY "Anyone can view job images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'job-images');

CREATE POLICY "Employers can delete their own job images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'job-images' AND
    auth.uid() IN (
      SELECT profile_id FROM employers
    )
  );

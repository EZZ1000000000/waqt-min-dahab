-- Add image_url column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_jobs_image_url ON jobs(image_url);

-- Update RLS policies to allow employers to upload images
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy for employers to update their own jobs with images
CREATE POLICY "employers_can_update_own_jobs_with_images" ON jobs
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT profile_id FROM employers WHERE id = jobs.employer_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT profile_id FROM employers WHERE id = jobs.employer_id
    )
  );

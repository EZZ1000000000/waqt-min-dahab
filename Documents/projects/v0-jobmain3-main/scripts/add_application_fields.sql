-- Add experience_years, skills, and phone_number columns to job_applications table
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Enable RLS on job_applications table
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "job_seekers_view_own_applications" ON job_applications;
DROP POLICY IF EXISTS "employers_view_job_applications" ON job_applications;
DROP POLICY IF EXISTS "admins_view_all_applications" ON job_applications;

-- Allow job seekers to view their own applications
CREATE POLICY "job_seekers_view_own_applications" ON job_applications
FOR SELECT USING (
  job_seeker_id IN (
    SELECT id FROM job_seekers WHERE profile_id = auth.uid()
  )
);

-- Allow employers to view applications for their jobs
CREATE POLICY "employers_view_job_applications" ON job_applications
FOR SELECT USING (
  job_id IN (
    SELECT id FROM jobs WHERE employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  )
);

-- Allow admins to view all applications
CREATE POLICY "admins_view_all_applications" ON job_applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

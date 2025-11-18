-- Add cv_url column to job_applications table
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- Drop existing RLS policies for job_applications
DROP POLICY IF EXISTS "applications_select_own" ON public.job_applications;
DROP POLICY IF EXISTS "applications_insert_own" ON public.job_applications;
DROP POLICY IF EXISTS "applications_update_own" ON public.job_applications;

-- Create corrected RLS Policies for job_applications
-- Job seekers can select their own applications and employers can see applications for their jobs
CREATE POLICY "applications_select_own" ON public.job_applications 
FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM public.job_seekers WHERE id = job_applications.job_seeker_id)
  OR 
  auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_applications.job_id)
);

-- Job seekers can insert applications
CREATE POLICY "applications_insert_own" ON public.job_applications 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (SELECT id FROM public.job_seekers WHERE id = job_applications.job_seeker_id)
);

-- Employers can update applications for their jobs
CREATE POLICY "applications_update_own" ON public.job_applications 
FOR UPDATE 
USING (
  auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_applications.job_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_job_seeker_id ON public.job_applications(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);

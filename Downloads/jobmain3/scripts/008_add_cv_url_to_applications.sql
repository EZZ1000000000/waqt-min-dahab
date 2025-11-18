-- Add cv_url column to job_applications if it doesn't exist
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- Fix RLS policies for job_applications
DROP POLICY IF EXISTS "applications_insert_own" ON public.job_applications;

-- Create corrected RLS policy that uses auth.uid() directly
CREATE POLICY "applications_insert_own" ON public.job_applications 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.job_seekers WHERE id = job_seeker_id));

-- Ensure SELECT policy works correctly
DROP POLICY IF EXISTS "applications_select_own" ON public.job_applications;
CREATE POLICY "applications_select_own" ON public.job_applications 
FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM public.job_seekers WHERE id = job_seeker_id) 
  OR auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_applications.job_id)
);

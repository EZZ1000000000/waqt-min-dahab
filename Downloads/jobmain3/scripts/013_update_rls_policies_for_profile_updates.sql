-- Comprehensive RLS policies for employers and job_seekers tables
-- This script ensures users can update their own profile data

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "employers_select_own" ON public.employers;
DROP POLICY IF EXISTS "employers_insert_own" ON public.employers;
DROP POLICY IF EXISTS "employers_update_own" ON public.employers;
DROP POLICY IF EXISTS "employers_delete_own" ON public.employers;
DROP POLICY IF EXISTS "employers_select_public" ON public.employers;

DROP POLICY IF EXISTS "job_seekers_select_own" ON public.job_seekers;
DROP POLICY IF EXISTS "job_seekers_insert_own" ON public.job_seekers;
DROP POLICY IF EXISTS "job_seekers_update_own" ON public.job_seekers;
DROP POLICY IF EXISTS "job_seekers_delete_own" ON public.job_seekers;

-- Employers RLS Policies
-- Allow employers to select their own data
CREATE POLICY "employers_select_own" ON public.employers 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow employers to insert their own data
CREATE POLICY "employers_insert_own" ON public.employers 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow employers to update their own data (company info, logo, description, etc.)
CREATE POLICY "employers_update_own" ON public.employers 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow employers to delete their own data
CREATE POLICY "employers_delete_own" ON public.employers 
  FOR DELETE 
  USING (auth.uid() = id);

-- Allow anyone to view public employer profiles
CREATE POLICY "employers_select_public" ON public.employers 
  FOR SELECT 
  USING (true);

-- Job Seekers RLS Policies
-- Allow job seekers to select their own data
CREATE POLICY "job_seekers_select_own" ON public.job_seekers 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow job seekers to insert their own data
CREATE POLICY "job_seekers_insert_own" ON public.job_seekers 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow job seekers to update their own data (skills, experience, location, etc.)
CREATE POLICY "job_seekers_update_own" ON public.job_seekers 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow job seekers to delete their own data
CREATE POLICY "job_seekers_delete_own" ON public.job_seekers 
  FOR DELETE 
  USING (auth.uid() = id);

-- Allow employers to view job seeker profiles (for applications)
CREATE POLICY "job_seekers_select_for_employers" ON public.job_seekers 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT employer_id FROM public.jobs 
      WHERE id IN (
        SELECT job_id FROM public.job_applications 
        WHERE job_seeker_id = job_seekers.id
      )
    )
  );

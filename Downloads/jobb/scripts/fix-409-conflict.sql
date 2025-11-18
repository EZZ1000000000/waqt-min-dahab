-- Fix 409 Conflict: Ensure jobs table has all required columns with proper constraints
-- This script ensures complete alignment between form inputs and database schema

-- 1. Verify jobs table structure
ALTER TABLE jobs 
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN description SET NOT NULL,
  ALTER COLUMN location SET NOT NULL,
  ALTER COLUMN job_type SET NOT NULL,
  ALTER COLUMN employer_id SET NOT NULL;

-- 2. Ensure category_id is properly set up (nullable is OK)
ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES job_categories(id) ON DELETE SET NULL;

-- 3. Ensure all timestamp columns have proper defaults
ALTER TABLE jobs 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN posted_at SET DEFAULT CURRENT_TIMESTAMP;

-- 4. Ensure status column has proper default
ALTER TABLE jobs 
  ALTER COLUMN status SET DEFAULT 'active';

-- 5. Ensure salary columns can be NULL
ALTER TABLE jobs 
  ALTER COLUMN salary_min DROP NOT NULL,
  ALTER COLUMN salary_max DROP NOT NULL;

-- 6. Ensure currency has proper default
ALTER TABLE jobs 
  ALTER COLUMN currency SET DEFAULT 'EGP';

-- 7. Ensure remote_type can be NULL or has proper default
ALTER TABLE jobs 
  ALTER COLUMN remote_type DROP NOT NULL;

-- 8. Ensure deadline can be NULL
ALTER TABLE jobs 
  ALTER COLUMN deadline DROP NOT NULL;

-- 9. Ensure requirements array has proper default
ALTER TABLE jobs 
  ALTER COLUMN requirements SET DEFAULT '{}';

-- 10. Fix RLS policies for jobs table to allow proper inserts
DROP POLICY IF EXISTS "jobs_insert_own" ON public.jobs;
DROP POLICY IF EXISTS "jobs_update_own" ON public.jobs;
DROP POLICY IF EXISTS "jobs_delete_own" ON public.jobs;

-- Create proper RLS policies
CREATE POLICY "jobs_insert_own" ON public.jobs 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.employers WHERE id = auth.uid())
  );

CREATE POLICY "jobs_update_own" ON public.jobs 
  FOR UPDATE 
  USING (
    auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = jobs.id)
  );

CREATE POLICY "jobs_delete_own" ON public.jobs 
  FOR DELETE 
  USING (
    auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = jobs.id)
  );

-- 11. Ensure employers table is properly set up
ALTER TABLE employers 
  ALTER COLUMN company_name SET NOT NULL;

-- 12. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "job_seekers_select_own" ON public.job_seekers;
DROP POLICY IF EXISTS "job_seekers_select_public" ON public.job_seekers;
DROP POLICY IF EXISTS "employers_select_own" ON public.employers;
DROP POLICY IF EXISTS "employers_select_public" ON public.employers;

-- Add new policies that allow selecting by ID with proper filtering
CREATE POLICY "job_seekers_select_own" ON public.job_seekers 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "job_seekers_select_public" ON public.job_seekers 
  FOR SELECT 
  USING (true);

CREATE POLICY "employers_select_own" ON public.employers 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "employers_select_public" ON public.employers 
  FOR SELECT 
  USING (true);

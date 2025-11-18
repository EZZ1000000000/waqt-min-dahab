-- Enable RLS for job_categories and site_content tables
ALTER TABLE IF EXISTS public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_content ENABLE ROW LEVEL SECURITY;

-- Job Categories RLS Policies
-- Allow everyone to read categories
DROP POLICY IF EXISTS "job_categories_select_all" ON public.job_categories;
CREATE POLICY "job_categories_select_all" ON public.job_categories FOR SELECT USING (true);

-- Allow only admins to insert categories
DROP POLICY IF EXISTS "job_categories_insert_admin" ON public.job_categories;
CREATE POLICY "job_categories_insert_admin" ON public.job_categories FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE user_type = 'admin'
  )
);

-- Allow only admins to update categories
DROP POLICY IF EXISTS "job_categories_update_admin" ON public.job_categories;
CREATE POLICY "job_categories_update_admin" ON public.job_categories FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE user_type = 'admin'
  )
);

-- Allow only admins to delete categories
DROP POLICY IF EXISTS "job_categories_delete_admin" ON public.job_categories;
CREATE POLICY "job_categories_delete_admin" ON public.job_categories FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE user_type = 'admin'
  )
);

-- Site Content RLS Policies
-- Allow everyone to read site content
DROP POLICY IF EXISTS "site_content_select_all" ON public.site_content;
CREATE POLICY "site_content_select_all" ON public.site_content FOR SELECT USING (true);

-- Allow only admins to insert content
DROP POLICY IF EXISTS "site_content_insert_admin" ON public.site_content;
CREATE POLICY "site_content_insert_admin" ON public.site_content FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE user_type = 'admin'
  )
);

-- Allow only admins to update content
DROP POLICY IF EXISTS "site_content_update_admin" ON public.site_content;
CREATE POLICY "site_content_update_admin" ON public.site_content FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE user_type = 'admin'
  )
);

-- Allow only admins to delete content
DROP POLICY IF EXISTS "site_content_delete_admin" ON public.site_content;
CREATE POLICY "site_content_delete_admin" ON public.site_content FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE user_type = 'admin'
  )
);

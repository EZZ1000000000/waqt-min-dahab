-- ============================================================================
-- COMPREHENSIVE RLS POLICY FIX FOR ELDOMNA JOB PLATFORM
-- This script fixes all 403 Forbidden errors by properly configuring RLS
-- ============================================================================

-- 1. PROFILES TABLE - Allow users to read all profiles and update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;

CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. JOB_SEEKERS TABLE - Allow users to read all and manage their own
ALTER TABLE job_seekers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_seekers_select_policy" ON job_seekers;
DROP POLICY IF EXISTS "job_seekers_update_policy" ON job_seekers;
DROP POLICY IF EXISTS "job_seekers_insert_policy" ON job_seekers;

CREATE POLICY "job_seekers_select_policy" ON job_seekers
  FOR SELECT USING (true);

CREATE POLICY "job_seekers_insert_policy" ON job_seekers
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "job_seekers_update_policy" ON job_seekers
  FOR UPDATE USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- 3. EMPLOYERS TABLE - Allow users to read all and manage their own
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employers_select_policy" ON employers;
DROP POLICY IF EXISTS "employers_update_policy" ON employers;
DROP POLICY IF EXISTS "employers_insert_policy" ON employers;

CREATE POLICY "employers_select_policy" ON employers
  FOR SELECT USING (true);

CREATE POLICY "employers_insert_policy" ON employers
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "employers_update_policy" ON employers
  FOR UPDATE USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- 4. JOBS TABLE - Allow public read, authenticated users can create, employers can update their own
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_select_policy" ON jobs;
DROP POLICY IF EXISTS "jobs_insert_policy" ON jobs;
DROP POLICY IF EXISTS "jobs_update_policy" ON jobs;
DROP POLICY IF EXISTS "jobs_delete_policy" ON jobs;

CREATE POLICY "jobs_select_policy" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "jobs_insert_policy" ON jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "jobs_update_policy" ON jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM employers
      WHERE employers.id = jobs.employer_id
      AND employers.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employers
      WHERE employers.id = jobs.employer_id
      AND employers.profile_id = auth.uid()
    )
  );

CREATE POLICY "jobs_delete_policy" ON jobs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM employers
      WHERE employers.id = jobs.employer_id
      AND employers.profile_id = auth.uid()
    )
  );

-- 5. JOB_APPLICATIONS TABLE - Allow users to read their own and create new ones
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_applications_select_policy" ON job_applications;
DROP POLICY IF EXISTS "job_applications_insert_policy" ON job_applications;
DROP POLICY IF EXISTS "job_applications_update_policy" ON job_applications;

CREATE POLICY "job_applications_select_policy" ON job_applications
  FOR SELECT USING (
    auth.uid() = job_seeker_id OR
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id
      AND EXISTS (
        SELECT 1 FROM employers
        WHERE employers.id = jobs.employer_id
        AND employers.profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "job_applications_insert_policy" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = job_seeker_id);

CREATE POLICY "job_applications_update_policy" ON job_applications
  FOR UPDATE USING (
    auth.uid() = job_seeker_id OR
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id
      AND EXISTS (
        SELECT 1 FROM employers
        WHERE employers.id = jobs.employer_id
        AND employers.profile_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    auth.uid() = job_seeker_id OR
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id
      AND EXISTS (
        SELECT 1 FROM employers
        WHERE employers.id = jobs.employer_id
        AND employers.profile_id = auth.uid()
      )
    )
  );

-- 6. NOTIFICATIONS TABLE - Allow users to read and manage their own
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;

CREATE POLICY "notifications_select_policy" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_policy" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. ALTERNATIVE_JOBS TABLE - Allow users to manage their own
ALTER TABLE alternative_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alternative_jobs_select_policy" ON alternative_jobs;
DROP POLICY IF EXISTS "alternative_jobs_insert_policy" ON alternative_jobs;
DROP POLICY IF EXISTS "alternative_jobs_delete_policy" ON alternative_jobs;

CREATE POLICY "alternative_jobs_select_policy" ON alternative_jobs
  FOR SELECT USING (auth.uid() = job_seeker_id);

CREATE POLICY "alternative_jobs_insert_policy" ON alternative_jobs
  FOR INSERT WITH CHECK (auth.uid() = job_seeker_id);

CREATE POLICY "alternative_jobs_delete_policy" ON alternative_jobs
  FOR DELETE USING (auth.uid() = job_seeker_id);

-- 8. JOB_CATEGORIES TABLE - Allow public read only
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_categories_select_policy" ON job_categories;

CREATE POLICY "job_categories_select_policy" ON job_categories
  FOR SELECT USING (true);

-- 9. SITE_CONTENT TABLE - Allow public read only
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_content_select_policy" ON site_content;

CREATE POLICY "site_content_select_policy" ON site_content
  FOR SELECT USING (true);

-- ============================================================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- GRANT PERMISSIONS TO ANONYMOUS USERS (for public data)
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON profiles, employers, jobs, job_categories, site_content TO anon;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that all tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

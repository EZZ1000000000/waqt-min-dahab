-- ============================================================================
-- COMPREHENSIVE STORAGE RLS POLICIES FOR ELDOMNA JOB PLATFORM
-- ============================================================================
-- This script sets up proper Row Level Security (RLS) policies for all storage buckets
-- to ensure proper access control based on user roles (admin, employer, job_seeker)

-- ============================================================================
-- 1. CVS BUCKET POLICIES
-- ============================================================================
-- Admin: Full access (SELECT, INSERT, UPDATE, DELETE)
-- Employer: Can view CVs of applicants to their jobs
-- Job Seeker: Can upload and view their own CVs

-- Drop existing CVs bucket policies
DROP POLICY IF EXISTS "Users can upload their own CVs" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own CVs" ON storage.objects;
DROP POLICY IF EXISTS "Employers can read CVs for their job applications" ON storage.objects;

-- Admin can do everything with CVs
CREATE POLICY "admin_cvs_full_access" ON storage.objects
FOR ALL
USING (
  bucket_id = 'cvs' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
)
WITH CHECK (
  bucket_id = 'cvs' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
);

-- Job seekers can upload their own CVs
CREATE POLICY "job_seeker_cvs_upload" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cvs' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'job_seeker') AND
  name LIKE auth.uid() || '/%'
);

-- Job seekers can view their own CVs
CREATE POLICY "job_seeker_cvs_view" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'cvs' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'job_seeker') AND
  name LIKE auth.uid() || '/%'
);

-- Employers can view CVs of applicants to their jobs
CREATE POLICY "employer_cvs_view_applicants" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'cvs' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'employer') AND
  name IN (
    SELECT DISTINCT ja.cv_url
    FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE j.employer_id = auth.uid()
  )
);

-- ============================================================================
-- 2. JOB-IMAGES BUCKET POLICIES
-- ============================================================================
-- Admin: Full access
-- Employer: Can upload, view, and delete their own job images
-- Job Seeker: Can view only

-- Drop existing job-images bucket policies
DROP POLICY IF EXISTS "Employers can upload job images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view job images" ON storage.objects;
DROP POLICY IF EXISTS "Employers can delete their own job images" ON storage.objects;

-- Admin can do everything with job images
CREATE POLICY "admin_job_images_full_access" ON storage.objects
FOR ALL
USING (
  bucket_id = 'job-images' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
)
WITH CHECK (
  bucket_id = 'job-images' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
);

-- Employers can upload job images
CREATE POLICY "employer_job_images_upload" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'job-images' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'employer') AND
  name LIKE auth.uid() || '/%'
);

-- Employers can view their own job images
CREATE POLICY "employer_job_images_view" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'job-images' AND
  (
    auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'employer') AND
    name LIKE auth.uid() || '/%'
  ) OR
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
);

-- Employers can delete their own job images
CREATE POLICY "employer_job_images_delete" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'job-images' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'employer') AND
  name LIKE auth.uid() || '/%'
);

-- Job seekers can view job images
CREATE POLICY "job_seeker_job_images_view" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'job-images'
);

-- ============================================================================
-- 3. PHOTOS BUCKET POLICIES (Hero Slider Images)
-- ============================================================================
-- Everyone: Can view (public)
-- Admin: Full access (upload, delete, update)

-- Drop existing photos bucket policies
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update photos" ON storage.objects;

-- Admin can do everything with photos
CREATE POLICY "admin_photos_full_access" ON storage.objects
FOR ALL
USING (
  bucket_id = 'photos' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
)
WITH CHECK (
  bucket_id = 'photos' AND
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
);

-- Everyone can view photos (public)
CREATE POLICY "public_photos_view" ON storage.objects
FOR SELECT
USING (bucket_id = 'photos');

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Verify that all buckets have RLS enabled
SELECT bucket_id, name, COUNT(*) as policy_count
FROM storage.objects
WHERE bucket_id IN ('cvs', 'job-images', 'photos')
GROUP BY bucket_id, name;

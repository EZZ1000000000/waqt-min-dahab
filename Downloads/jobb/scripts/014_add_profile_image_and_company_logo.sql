-- ============================================================================
-- ADD PROFILE IMAGE AND COMPANY LOGO COLUMNS
-- ============================================================================
-- This script adds:
-- 1. profile_image_url column to job_seekers table
-- 2. Verification badge support (verified column already exists in employers)
-- 3. Pricing table for verification service

-- ============================================================================
-- 1. ADD PROFILE IMAGE TO JOB SEEKERS
-- ============================================================================
ALTER TABLE job_seekers
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN job_seekers.profile_image_url IS 'URL of the job seeker profile image stored in Blob storage';

-- ============================================================================
-- 2. VERIFY COMPANY_LOGO_URL EXISTS IN EMPLOYERS
-- ============================================================================
-- The company_logo_url column already exists in employers table
-- Just adding a comment for clarity
COMMENT ON COLUMN employers.company_logo_url IS 'URL of the company logo stored in Blob storage';

-- ============================================================================
-- 3. CREATE VERIFICATION SERVICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS verification_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL DEFAULT 'company_verification',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, expired, cancelled
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  contact_phone TEXT NOT NULL,
  notes TEXT,
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_services_employer_id ON verification_services(employer_id);
CREATE INDEX IF NOT EXISTS idx_verification_services_status ON verification_services(status);

-- Add comment
COMMENT ON TABLE verification_services IS 'Tracks verification service subscriptions for employers';

-- ============================================================================
-- 4. CREATE VERIFICATION PRICING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS verification_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  duration_days INTEGER NOT NULL DEFAULT 365,
  contact_phone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE verification_pricing IS 'Pricing configuration for verification services';

-- ============================================================================
-- 5. INSERT DEFAULT VERIFICATION PRICING
-- ============================================================================
INSERT INTO verification_pricing (service_name, description, price, currency, duration_days, contact_phone, is_active)
VALUES (
  'Company Verification',
  'Verify your company and display verification badge on your profile and job postings',
  500.00,
  'EGP',
  365,
  '+20100000000',
  TRUE
)
ON CONFLICT (service_name) DO NOTHING;

-- ============================================================================
-- 6. ENABLE RLS FOR NEW TABLES
-- ============================================================================
ALTER TABLE verification_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_pricing ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. CREATE RLS POLICIES FOR VERIFICATION SERVICES
-- ============================================================================
-- Admin: Full access
CREATE POLICY "admin_verification_services_full_access" ON verification_services
FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
);

-- Employers: Can view their own verification services
CREATE POLICY "employer_verification_services_view" ON verification_services
FOR SELECT
USING (
  employer_id = auth.uid() OR
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
);

-- Employers: Can insert their own verification services
CREATE POLICY "employer_verification_services_insert" ON verification_services
FOR INSERT
WITH CHECK (
  employer_id = auth.uid()
);

-- Employers: Can update their own verification services
CREATE POLICY "employer_verification_services_update" ON verification_services
FOR UPDATE
USING (
  employer_id = auth.uid()
)
WITH CHECK (
  employer_id = auth.uid()
);

-- ============================================================================
-- 8. CREATE RLS POLICIES FOR VERIFICATION PRICING
-- ============================================================================
-- Everyone: Can view pricing
CREATE POLICY "public_verification_pricing_view" ON verification_pricing
FOR SELECT
USING (is_active = TRUE);

-- Admin: Full access to pricing
CREATE POLICY "admin_verification_pricing_full_access" ON verification_pricing
FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin')
);

-- ============================================================================
-- 9. CREATE STORAGE BUCKETS FOR PROFILE IMAGES AND COMPANY LOGOS
-- ============================================================================
-- Note: These should be created via Supabase dashboard or separate script
-- But we'll document the expected bucket names:
-- - 'profile-images': For job seeker profile images
-- - 'company-logos': For company logos (or use existing bucket)

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check that columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'job_seekers' AND column_name = 'profile_image_url';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employers' AND column_name = 'company_logo_url';

-- Check that tables were created
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('verification_services', 'verification_pricing');

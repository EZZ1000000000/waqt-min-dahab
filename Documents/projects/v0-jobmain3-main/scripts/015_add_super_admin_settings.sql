-- ============================================================================
-- ADD SUPER ADMIN SETTINGS TABLE
-- ============================================================================
-- This script adds a settings table to control feature visibility for admins

-- ============================================================================
-- 1. CREATE ADMIN SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE admin_settings IS 'Controls visibility and availability of admin features';

-- ============================================================================
-- 2. INSERT DEFAULT SETTINGS
-- ============================================================================
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES 
  ('show_verification_page', TRUE, 'Show verification management page in admin dashboard'),
  ('show_alternative_jobs_page', TRUE, 'Show alternative jobs management page in admin dashboard')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 3. ENABLE RLS FOR ADMIN SETTINGS
-- ============================================================================
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES FOR ADMIN SETTINGS
-- ============================================================================
-- Super Admin: Full access (only super_admin user_type)
CREATE POLICY "super_admin_settings_full_access" ON admin_settings
FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'super_admin')
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'super_admin')
);

-- Admin: Can view settings
CREATE POLICY "admin_settings_view" ON admin_settings
FOR SELECT
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE user_type IN ('admin', 'super_admin'))
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT * FROM admin_settings;

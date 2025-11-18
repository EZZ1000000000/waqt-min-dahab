-- Create job_categories table
CREATE TABLE IF NOT EXISTS job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES job_categories(id);

-- Create site_content table for managing static content
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'text', -- 'text', 'image', 'json'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO job_categories (name, description) VALUES
  ('تكنولوجيا المعلومات', 'وظائف في مجال البرمجة والتطوير'),
  ('التسويق والمبيعات', 'وظائف في مجال التسويق والمبيعات'),
  ('الموارد البشرية', 'وظائف في مجال إدارة الموارد البشرية'),
  ('التصميم', 'وظائف في مجال التصميم الجرافيكي والويب'),
  ('المحاسبة والمالية', 'وظائف في مجال المحاسبة والمالية'),
  ('العمليات والإدارة', 'وظائف في مجال العمليات والإدارة'),
  ('خدمة العملاء', 'وظائف في مجال خدمة العملاء والدعم')
ON CONFLICT (name) DO NOTHING;

-- Insert default site content
INSERT INTO site_content (key, value, type) VALUES
  ('site_name', 'الدومنة', 'text'),
  ('site_description', 'منصة التوظيف الأولى في مصر', 'text'),
  ('hero_title', 'ابحث عن فرصتك الوظيفية المثالية', 'text'),
  ('hero_description', 'الدومنة تربط بين أفضل المواهب والشركات الرائدة في مصر. ابدأ رحلتك الوظيفية اليوم', 'text')
ON CONFLICT (key) DO NOTHING;

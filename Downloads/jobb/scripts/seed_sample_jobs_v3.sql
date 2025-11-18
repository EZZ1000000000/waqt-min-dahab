-- Create proper seed data with employers first, then jobs
-- This script adds 5 sample jobs with proper employer relationships

-- First, we need to create test employer profiles
-- Note: In production, employers would be created through auth, but for testing we'll insert directly

-- Create test employer UUIDs (these should match auth.users if they exist)
-- For this seed, we'll use specific UUIDs that you can reference

-- Insert test profiles for employers
INSERT INTO public.profiles (id, email, full_name, user_type, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'tech-company@example.com', 'Tech Company', 'employer', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'design-studio@example.com', 'Design Studio', 'employer', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'marketing-agency@example.com', 'Marketing Agency', 'employer', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'data-company@example.com', 'Data Company', 'employer', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'startup-hub@example.com', 'Startup Hub', 'employer', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test employers
INSERT INTO public.employers (id, profile_id, company_name, company_website, company_description, industry, company_size, location, verified, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Tech Solutions Egypt', 'https://techsolutions.eg', 'شركة متخصصة في تطوير البرمجيات والحلول التقنية', 'Technology', 'Medium', 'Cairo, Egypt', TRUE, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Creative Design Studio', 'https://creativedesign.eg', 'استوديو متخصص في التصميم والهوية البصرية', 'Design', 'Small', 'Alexandria, Egypt', TRUE, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'Digital Marketing Pro', 'https://digitalmarketingpro.eg', 'وكالة متخصصة في التسويق الرقمي والإعلانات', 'Marketing', 'Medium', 'Giza, Egypt', TRUE, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'Data Analytics Hub', 'https://dataanalytics.eg', 'متخصصون في تحليل البيانات والذكاء الاصطناعي', 'Technology', 'Large', 'Cairo, Egypt', TRUE, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid, 'Innovation Startup Hub', 'https://innovationhub.eg', 'حاضنة للمشاريع الناشئة والابتكارات التقنية', 'Startup', 'Medium', 'Cairo, Egypt', FALSE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Now insert the sample jobs
INSERT INTO public.jobs (id, employer_id, title, description, requirements, job_type, salary_min, salary_max, currency, location, remote_type, status, deadline, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Senior Frontend Developer',
    'نحن نبحث عن مطور واجهات أمامية متقدم لديه خبرة 5+ سنوات في تطوير تطبيقات ويب حديثة. ستعمل على مشاريع تحديية وستتعاون مع فريق متخصص.',
    ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git'],
    'full_time',
    8000,
    12000,
    'EGP',
    'Cairo, Egypt',
    'hybrid',
    'active',
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'UX/UI Designer',
    'نبحث عن مصمم تجربة مستخدم وواجهات مبدع لديه محفظة قوية. ستقود تصميم المنتجات الجديدة وتحسين التجربة الحالية.',
    ARRAY['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
    'full_time',
    6000,
    9000,
    'EGP',
    'Alexandria, Egypt',
    'remote',
    'active',
    NOW() + INTERVAL '25 days',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Backend Developer',
    'مطور خادم متمرس مع خبرة في Node.js و PostgreSQL. ستعمل على بناء APIs قوية وقابلة للتوسع.',
    ARRAY['Node.js', 'PostgreSQL', 'REST APIs', 'Docker', 'AWS'],
    'full_time',
    9000,
    14000,
    'EGP',
    'Cairo, Egypt',
    'on_site',
    'active',
    NOW() + INTERVAL '35 days',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'Digital Marketing Specialist',
    'متخصص تسويق رقمي لديه خبرة في إدارة الحملات والتحليلات. ستدير استراتيجيات التسويق عبر وسائل التواصل والإعلانات الرقمية.',
    ARRAY['Google Analytics', 'Facebook Ads', 'SEO', 'Content Marketing', 'Social Media'],
    'full_time',
    5000,
    8000,
    'EGP',
    'Giza, Egypt',
    'hybrid',
    'active',
    NOW() + INTERVAL '20 days',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440004'::uuid,
    'Data Analyst',
    'محلل بيانات متخصص لديه خبرة في SQL و Python. ستعمل على استخراج الرؤى من البيانات الضخمة وتقديم تقارير استراتيجية.',
    ARRAY['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'],
    'full_time',
    7000,
    11000,
    'EGP',
    'Cairo, Egypt',
    'remote',
    'active',
    NOW() + INTERVAL '28 days',
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT COUNT(*) as total_jobs FROM public.jobs;
SELECT COUNT(*) as total_employers FROM public.employers;

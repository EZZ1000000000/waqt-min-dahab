-- Create sample employers first
INSERT INTO employers (id, profile_id, company_name, company_description, company_size, industry, location, company_website, company_logo_url, verified, created_at, updated_at)
VALUES
  (
    'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6'::uuid,
    NULL,
    'تك سوليوشنز',
    'شركة متخصصة في تطوير البرمجيات والحلول الرقمية',
    'medium',
    'Technology',
    'Cairo, Egypt',
    'https://techsolutions.com',
    'https://via.placeholder.com/150?text=TechSolutions',
    true,
    NOW(),
    NOW()
  ),
  (
    'b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7'::uuid,
    NULL,
    'ديجيتال ماركتينج برو',
    'وكالة متخصصة في التسويق الرقمي والإعلانات',
    'small',
    'Marketing',
    'Alexandria, Egypt',
    'https://digitalmarketingpro.com',
    'https://via.placeholder.com/150?text=DigitalMarketing',
    true,
    NOW(),
    NOW()
  ),
  (
    'c3d4e5f6-g7h8-49i0-j1k2-l3m4n5o6p7q8'::uuid,
    NULL,
    'ديتا إنسايتس',
    'شركة متخصصة في تحليل البيانات والذكاء الاصطناعي',
    'large',
    'Data & Analytics',
    'Giza, Egypt',
    'https://datainsights.com',
    'https://via.placeholder.com/150?text=DataInsights',
    true,
    NOW(),
    NOW()
  );

-- Create job categories
INSERT INTO job_categories (id, name, description, icon_url, created_at, updated_at)
VALUES
  (
    'd4e5f6g7-h8i9-50j1-k2l3-m4n5o6p7q8r9'::uuid,
    'تطوير البرمجيات',
    'وظائف متعلقة بتطوير وبرمجة التطبيقات والمواقع',
    'https://via.placeholder.com/50?text=Dev',
    NOW(),
    NOW()
  ),
  (
    'e5f6g7h8-i9j0-51k2-l3m4-n5o6p7q8r9s0'::uuid,
    'التصميم',
    'وظائف متعلقة بتصميم الواجهات والتجارب',
    'https://via.placeholder.com/50?text=Design',
    NOW(),
    NOW()
  ),
  (
    'f6g7h8i9-j0k1-52l3-m4n5-o6p7q8r9s0t1'::uuid,
    'التسويق',
    'وظائف متعلقة بالتسويق الرقمي والإعلانات',
    'https://via.placeholder.com/50?text=Marketing',
    NOW(),
    NOW()
  ),
  (
    'g7h8i9j0-k1l2-53m4-n5o6-p7q8r9s0t1u2'::uuid,
    'تحليل البيانات',
    'وظائف متعلقة بتحليل البيانات والإحصائيات',
    'https://via.placeholder.com/50?text=Analytics',
    NOW(),
    NOW()
  );

-- Create sample jobs with proper employer_id and category_id
INSERT INTO jobs (id, employer_id, category_id, title, description, requirements, job_type, salary_min, salary_max, currency, location, remote_type, status, posted_at, deadline, created_at, updated_at)
VALUES
  (
    'h8i9j0k1-l2m3-54n5-o6p7-q8r9s0t1u2v3'::uuid,
    'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6'::uuid,
    'd4e5f6g7-h8i9-50j1-k2l3-m4n5o6p7q8r9'::uuid,
    'Senior Frontend Developer',
    'نحن نبحث عن مطور واجهات أمامية متقدم لديه خبرة 5+ سنوات في React و TypeScript. ستعمل على مشاريع حديثة وتحديات تقنية مثيرة.',
    ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git'],
    'Full-time',
    8000,
    12000,
    'EGP',
    'Cairo, Egypt',
    'Remote',
    'active',
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
  ),
  (
    'i9j0k1l2-m3n4-55o6-p7q8-r9s0t1u2v3w4'::uuid,
    'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6'::uuid,
    'e5f6g7h8-i9j0-51k2-l3m4-n5o6p7q8r9s0'::uuid,
    'UX/UI Designer',
    'مصمم تجربة مستخدم وواجهات مبدع مع خبرة في Figma و Adobe XD. ستعمل على تصميم تطبيقات ويب وموبايل حديثة.',
    ARRAY['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
    'Full-time',
    6000,
    9000,
    'EGP',
    'Alexandria, Egypt',
    'Hybrid',
    'active',
    NOW(),
    NOW() + INTERVAL '25 days',
    NOW(),
    NOW()
  ),
  (
    'j0k1l2m3-n4o5-56p7-q8r9-s0t1u2v3w4x5'::uuid,
    'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6'::uuid,
    'd4e5f6g7-h8i9-50j1-k2l3-m4n5o6p7q8r9'::uuid,
    'Backend Developer',
    'مطور خادم متقدم مع خبرة في Node.js و PostgreSQL. ستعمل على بناء APIs قوية وقابلة للتوسع.',
    ARRAY['Node.js', 'PostgreSQL', 'REST APIs', 'Docker', 'AWS'],
    'Full-time',
    7000,
    11000,
    'EGP',
    'Giza, Egypt',
    'On-site',
    'active',
    NOW(),
    NOW() + INTERVAL '28 days',
    NOW(),
    NOW()
  ),
  (
    'k1l2m3n4-o5p6-57q8-r9s0-t1u2v3w4x5y6'::uuid,
    'b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7'::uuid,
    'f6g7h8i9-j0k1-52l3-m4n5-o6p7q8r9s0t1'::uuid,
    'Digital Marketing Specialist',
    'متخصص تسويق رقمي مع خبرة في إدارة الحملات الإعلانية على وسائل التواصل الاجتماعي. ستعمل على زيادة الوعي بالعلامة التجارية.',
    ARRAY['Social Media Marketing', 'Google Ads', 'Facebook Ads', 'Analytics', 'Content Creation'],
    'Full-time',
    4500,
    7000,
    'EGP',
    'Cairo, Egypt',
    'Remote',
    'active',
    NOW(),
    NOW() + INTERVAL '20 days',
    NOW(),
    NOW()
  ),
  (
    'l2m3n4o5-p6q7-58r9-s0t1-u2v3w4x5y6z7'::uuid,
    'c3d4e5f6-g7h8-49i0-j1k2-l3m4n5o6p7q8'::uuid,
    'g7h8i9j0-k1l2-53m4-n5o6-p7q8r9s0t1u2'::uuid,
    'Data Analyst',
    'محلل بيانات متقدم مع خبرة في Python و SQL. ستعمل على تحليل البيانات الضخمة واستخراج الرؤى المهمة.',
    ARRAY['Python', 'SQL', 'Tableau', 'Excel', 'Data Visualization'],
    'Full-time',
    5500,
    8500,
    'EGP',
    'Giza, Egypt',
    'Hybrid',
    'active',
    NOW(),
    NOW() + INTERVAL '22 days',
    NOW(),
    NOW()
  );

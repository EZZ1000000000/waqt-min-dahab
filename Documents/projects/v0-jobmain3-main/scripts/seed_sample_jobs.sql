-- Insert sample jobs with realistic data
INSERT INTO jobs (
  id,
  employer_id,
  category_id,
  title,
  description,
  job_type,
  remote_type,
  location,
  salary_min,
  salary_max,
  currency,
  requirements,
  status,
  posted_at,
  deadline,
  created_at,
  updated_at
) VALUES
-- Job 1: Senior Frontend Developer
(
  gen_random_uuid(),
  (SELECT id FROM employers LIMIT 1),
  (SELECT id FROM job_categories WHERE name = 'Technology' LIMIT 1),
  'Senior Frontend Developer',
  'نحن نبحث عن مطور واجهات أمامية متقدم لديه خبرة 5+ سنوات في React و TypeScript. ستعمل على تطبيقات ويب حديثة وتساهم في تطوير معمارية النظام.',
  'Full-time',
  'Remote',
  'Cairo, Egypt',
  8000,
  12000,
  'EGP',
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git'],
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
),

-- Job 2: UX/UI Designer
(
  gen_random_uuid(),
  (SELECT id FROM employers LIMIT 1 OFFSET 1),
  (SELECT id FROM job_categories WHERE name = 'Design' LIMIT 1),
  'UX/UI Designer',
  'مصمم تجربة المستخدم والواجهات الرسومية المبدع المطلوب للعمل على منصة تعليمية جديدة. يجب أن تكون لديك خبرة في Figma و Adobe XD.',
  'Full-time',
  'Hybrid',
  'Alexandria, Egypt',
  6000,
  9000,
  'EGP',
  ARRAY['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
  'active',
  NOW(),
  NOW() + INTERVAL '25 days',
  NOW(),
  NOW()
),

-- Job 3: Backend Developer (Node.js)
(
  gen_random_uuid(),
  (SELECT id FROM employers LIMIT 1 OFFSET 2),
  (SELECT id FROM job_categories WHERE name = 'Technology' LIMIT 1),
  'Backend Developer - Node.js',
  'مطور خادم متخصص في Node.js و Express للعمل على API قوية وقابلة للتوسع. الخبرة مع قواعد البيانات مثل PostgreSQL و MongoDB مطلوبة.',
  'Full-time',
  'On-site',
  'Giza, Egypt',
  7500,
  11000,
  'EGP',
  ARRAY['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'REST API', 'Docker'],
  'active',
  NOW(),
  NOW() + INTERVAL '28 days',
  NOW(),
  NOW()
),

-- Job 4: Digital Marketing Specialist
(
  gen_random_uuid(),
  (SELECT id FROM employers LIMIT 1 OFFSET 3),
  (SELECT id FROM job_categories WHERE name = 'Marketing' LIMIT 1),
  'Digital Marketing Specialist',
  'متخصص تسويق رقمي لإدارة حملات وسائل التواصل الاجتماعي والإعلانات. خبرة مع Google Ads و Facebook Ads ضرورية.',
  'Full-time',
  'Hybrid',
  'Cairo, Egypt',
  5000,
  8000,
  'EGP',
  ARRAY['Social Media Marketing', 'Google Ads', 'Facebook Ads', 'Content Creation', 'Analytics'],
  'active',
  NOW(),
  NOW() + INTERVAL '20 days',
  NOW(),
  NOW()
),

-- Job 5: Data Analyst
(
  gen_random_uuid(),
  (SELECT id FROM employers LIMIT 1 OFFSET 4),
  (SELECT id FROM job_categories WHERE name = 'Data' LIMIT 1),
  'Data Analyst',
  'محلل بيانات لتحليل البيانات الضخمة واستخراج الرؤى المهمة. الخبرة مع Python و SQL و Tableau مطلوبة.',
  'Full-time',
  'Remote',
  'Cairo, Egypt',
  6500,
  10000,
  'EGP',
  ARRAY['Python', 'SQL', 'Tableau', 'Excel', 'Data Visualization', 'Statistics'],
  'active',
  NOW(),
  NOW() + INTERVAL '35 days',
  NOW(),
  NOW()
);

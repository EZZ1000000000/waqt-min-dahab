-- Insert sample hero slider images
INSERT INTO hero_slider (title, subtitle, image_url, button_text, button_link, order_index, is_active)
VALUES 
  (
    'ابحث عن فرصتك الوظيفية المثالية',
    'اكتشف آلاف الفرص الوظيفية من أفضل الشركات والمؤسسات في المنطقة',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    'ابدأ البحث',
    '/jobs',
    0,
    true
  ),
  (
    'طور مهاراتك المهنية',
    'احصل على دورات تدريبية وشهادات معترف بها عالمياً',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    'اكتشف الدورات',
    '/courses',
    1,
    true
  );

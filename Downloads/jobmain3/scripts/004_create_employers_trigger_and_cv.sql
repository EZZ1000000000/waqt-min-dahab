-- إنشاء trigger لملء جدول employers تلقائياً عند إنشاء مستخدم employer
-- هذا يحل مشكلة الخطأ 409 عند نشر الوظائف

-- أولاً: إضافة حقل cv_url لجدول job_applications
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- ثانياً: إنشاء function لملء جدول employers تلقائياً
CREATE OR REPLACE FUNCTION public.create_employer_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا كان المستخدم الجديد من نوع employer، أنشئ سجل في جدول employers
  IF NEW.user_type = 'employer' THEN
    INSERT INTO public.employers (id, profile_id, company_name, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.id,
      COALESCE(NEW.full_name, 'Company'),
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ثالثاً: إنشاء trigger يستدعي الـ function عند إدراج profile جديد
DROP TRIGGER IF EXISTS trigger_create_employer_profile ON public.profiles;
CREATE TRIGGER trigger_create_employer_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_employer_profile();

-- رابعاً: تحديث RLS policies لـ job_applications لتشمل cv_url
-- لا نحتاج لتغيير الـ policies الموجودة، فقط التأكد من أنها تعمل مع الحقل الجديد

-- خامساً: إضافة index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_job_applications_cv_url ON public.job_applications(cv_url);
CREATE INDEX IF NOT EXISTS idx_employers_profile_id ON public.employers(profile_id);

-- سادساً: التأكد من أن جميع الـ employers الموجودين لديهم سجلات صحيحة
-- هذا يصلح أي بيانات قديمة قد تكون موجودة
INSERT INTO public.employers (id, profile_id, company_name, created_at, updated_at)
SELECT 
  p.id,
  p.id,
  COALESCE(p.full_name, 'Company'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM public.profiles p
WHERE p.user_type = 'employer' 
  AND p.id NOT IN (SELECT id FROM public.employers)
ON CONFLICT (id) DO NOTHING;

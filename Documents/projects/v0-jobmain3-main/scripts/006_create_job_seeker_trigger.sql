-- إنشاء trigger لملء جدول job_seekers تلقائياً عند إنشاء مستخدم job_seeker
-- هذا يحل مشكلة الخطأ 406 عند محاولة جلب بيانات job_seeker

CREATE OR REPLACE FUNCTION public.create_job_seeker_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا كان المستخدم الجديد من نوع job_seeker، أنشئ سجل في جدول job_seekers
  IF NEW.user_type = 'job_seeker' THEN
    INSERT INTO public.job_seekers (id, profile_id, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.id,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger يستدعي الـ function عند إدراج profile جديد
DROP TRIGGER IF EXISTS trigger_create_job_seeker_profile ON public.profiles;
CREATE TRIGGER trigger_create_job_seeker_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_job_seeker_profile();

-- إضافة index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_job_seekers_profile_id ON public.job_seekers(profile_id);

-- إصلاح أي بيانات قديمة - إضافة job_seekers records لجميع job_seekers الموجودين
INSERT INTO public.job_seekers (id, profile_id, created_at, updated_at)
SELECT 
  p.id,
  p.id,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM public.profiles p
WHERE p.user_type = 'job_seeker' 
  AND p.id NOT IN (SELECT id FROM public.job_seekers)
ON CONFLICT (id) DO NOTHING;

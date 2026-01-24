-- إنشاء bucket لحفظ ملفات CV
-- تشغيل هذا الـ script من Supabase SQL Editor

-- إنشاء bucket للـ CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- إضافة RLS policies للـ bucket
CREATE POLICY "Users can upload their own CVs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read their own CVs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cvs'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR auth.uid() IN (
      SELECT employer_id FROM public.jobs 
      WHERE id IN (
        SELECT job_id FROM public.job_applications 
        WHERE cv_url = storage.objects.name
      )
    )
  )
);

CREATE POLICY "Employers can read CVs for their job applications"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cvs'
  AND auth.uid() IN (
    SELECT employer_id FROM public.jobs 
    WHERE id IN (
      SELECT job_id FROM public.job_applications 
      WHERE cv_url = storage.objects.name
    )
  )
);

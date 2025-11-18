-- Create users profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('job_seeker', 'employer', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create job seekers profile table
CREATE TABLE IF NOT EXISTS public.job_seekers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_url TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  location TEXT,
  preferred_job_types TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create employers profile table
CREATE TABLE IF NOT EXISTS public.employers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_logo_url TEXT,
  company_description TEXT,
  industry TEXT,
  company_size TEXT,
  location TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  job_type TEXT NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'temporary')),
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'USD',
  location TEXT NOT NULL,
  remote_type TEXT CHECK (remote_type IN ('on_site', 'hybrid', 'remote')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create job applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  job_seeker_id UUID NOT NULL REFERENCES public.job_seekers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
  cover_letter TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create alternative jobs table (for recommendations)
CREATE TABLE IF NOT EXISTS public.alternative_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_seeker_id UUID NOT NULL REFERENCES public.job_seekers(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('job_match', 'application_update', 'new_job', 'message')),
  title TEXT NOT NULL,
  message TEXT,
  related_job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  related_application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_seekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternative_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

-- Job Seekers RLS Policies
CREATE POLICY "job_seekers_select_own" ON public.job_seekers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "job_seekers_insert_own" ON public.job_seekers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "job_seekers_update_own" ON public.job_seekers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "job_seekers_delete_own" ON public.job_seekers FOR DELETE USING (auth.uid() = id);

-- Employers RLS Policies
CREATE POLICY "employers_select_own" ON public.employers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "employers_insert_own" ON public.employers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "employers_update_own" ON public.employers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "employers_delete_own" ON public.employers FOR DELETE USING (auth.uid() = id);
CREATE POLICY "employers_select_public" ON public.employers FOR SELECT USING (true);

-- Jobs RLS Policies
CREATE POLICY "jobs_select_all" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "jobs_insert_own" ON public.jobs FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.employers WHERE id = auth.uid()));
CREATE POLICY "jobs_update_own" ON public.jobs FOR UPDATE USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = jobs.id));
CREATE POLICY "jobs_delete_own" ON public.jobs FOR DELETE USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = jobs.id));

-- Job Applications RLS Policies
CREATE POLICY "applications_select_own" ON public.job_applications FOR SELECT USING (auth.uid() = job_seeker_id OR auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_applications.job_id));
CREATE POLICY "applications_insert_own" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = job_seeker_id);
CREATE POLICY "applications_update_own" ON public.job_applications FOR UPDATE USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_applications.job_id));

-- Alternative Jobs RLS Policies
CREATE POLICY "alt_jobs_select_own" ON public.alternative_jobs FOR SELECT USING (auth.uid() = job_seeker_id);
CREATE POLICY "alt_jobs_insert_own" ON public.alternative_jobs FOR INSERT WITH CHECK (auth.uid() = job_seeker_id);

-- Notifications RLS Policies
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_own" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

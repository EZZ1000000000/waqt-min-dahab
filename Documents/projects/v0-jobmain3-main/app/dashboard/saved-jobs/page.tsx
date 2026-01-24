"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { JobCard } from "@/components/job-card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SavedJob {
  id: string
  job_id: string
  reason: string | null
  jobs: {
    id: string
    title: string
    description: string
    job_type: string
    location: string
    salary_min: number | null
    salary_max: number | null
    currency: string
    employers: {
      company_name: string
    }
  }
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchSavedJobs()
  }, [])

  const fetchSavedJobs = async () => {
    try {
      setIsLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("alternative_jobs")
        .select("id, job_id, reason, jobs(id, title, description, job_type, location, salary_min, salary_max, currency, employers(company_name))")
        .eq("job_seeker_id", userData.user.id)
        .limit(100)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSavedJobs(data || [])
    } catch (error) {
      console.error("Error fetching saved jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSavedJob = async (altJobId: string, jobId: string) => {
    try {
      const { error } = await supabase.from("alternative_jobs").delete().eq("id", altJobId)
      if (error) throw error
      setSavedJobs(savedJobs.filter((job) => job.id !== altJobId))
    } catch (error) {
      console.error("Error removing saved job:", error)
    }
  }

  const handleApplyJob = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}/apply`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">الوظائف المحفوظة</h1>
        <p className="text-muted-foreground mt-2">الوظائف التي حفظتها لمراجعتها لاحقاً</p>
      </div>

      {savedJobs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Heart className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>لا توجد وظائف محفوظة</EmptyTitle>
            <EmptyDescription>احفظ الوظائف لمراجعتها لاحقاً والتقديم عليها عندما تكون مستعداً.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((savedJob) => (
            <JobCard
              key={savedJob.id}
              id={savedJob.jobs.id}
              title={savedJob.jobs.title}
              company={savedJob.jobs.employers.company_name}
              location={savedJob.jobs.location}
              jobType={savedJob.jobs.job_type}
              salaryMin={savedJob.jobs.salary_min}
              salaryMax={savedJob.jobs.salary_max}
              currency={savedJob.jobs.currency}
              description={savedJob.jobs.description}
              isSaved={true}
              onSave={() => handleRemoveSavedJob(savedJob.id, savedJob.jobs.id)}
              onApply={handleApplyJob}
            />
          ))}
        </div>
      )}
    </div>
  )
}

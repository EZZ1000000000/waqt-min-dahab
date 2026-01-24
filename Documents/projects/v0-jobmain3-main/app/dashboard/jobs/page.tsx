"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { JobCard } from "@/components/job-card"
import { JobFilters } from "@/components/job-filters"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Briefcase } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Job {
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
    company_logo_url: string | null
    verified: boolean
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJobType, setSelectedJobType] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchJobs()
    fetchSavedJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, searchQuery, selectedJobType, selectedLocation])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, description, job_type, location, salary_min, salary_max, currency, employers(company_name, company_logo_url, verified)")
        .eq("status", "active")
        .limit(50) // Add limit to avoid loading thousands of jobs
        .order("posted_at", { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSavedJobs = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: savedData } = await supabase
        .from("alternative_jobs")
        .select("job_id")
        .eq("job_seeker_id", userData.user.id)

      setSavedJobs(savedData?.map((item) => item.job_id) || [])
    } catch (error) {
      console.error("Error fetching saved jobs:", error)
    }
  }

  const filterJobs = () => {
    let filtered = jobs

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.employers.company_name.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query),
      )
    }

    if (selectedJobType) {
      filtered = filtered.filter((job) => job.job_type === selectedJobType)
    }

    if (selectedLocation) {
      filtered = filtered.filter((job) => job.location.toLowerCase().includes(selectedLocation.toLowerCase()))
    }

    setFilteredJobs(filtered)
  }

  const handleSaveJob = async (jobId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push("/auth/login")
        return
      }

      if (savedJobs.includes(jobId)) {
        await supabase.from("alternative_jobs").delete().eq("job_seeker_id", userData.user.id).eq("job_id", jobId)

        setSavedJobs(savedJobs.filter((id) => id !== jobId))
      } else {
        await supabase.from("alternative_jobs").insert({
          job_seeker_id: userData.user.id,
          job_id: jobId,
          reason: "saved",
        })

        setSavedJobs([...savedJobs, jobId])
      }
    } catch (error) {
      console.error("Error saving job:", error)
    }
  }

  const handleApplyJob = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}/apply`)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedJobType("")
    setSelectedLocation("")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">استكشف الوظائف</h1>
        <p className="text-muted-foreground mt-2">ابحث عن فرصتك الوظيفية المثالية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <JobFilters
            onSearch={setSearchQuery}
            onJobTypeChange={setSelectedJobType}
            onLocationChange={setSelectedLocation}
            onClear={handleClearFilters}
            searchQuery={searchQuery}
            selectedJobType={selectedJobType}
            selectedLocation={selectedLocation}
          />
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Briefcase className="w-6 h-6" />
                </EmptyMedia>
                <EmptyTitle>لم يتم العثور على وظائف</EmptyTitle>
                <EmptyDescription>حاول تعديل المرشحات أو البحث للعثور على المزيد من الفرص.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.employers.company_name}
                  location={job.location}
                  jobType={job.job_type}
                  salaryMin={job.salary_min}
                  salaryMax={job.salary_max}
                  currency={job.currency}
                  description={job.description}
                  companyLogo={job.employers.company_logo_url}
                  isVerified={job.employers.verified}
                  isSaved={savedJobs.includes(job.id)}
                  onSave={handleSaveJob}
                  onApply={handleApplyJob}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

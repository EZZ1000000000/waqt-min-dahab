"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { JobCard } from "@/components/job-card"
import { JobFilters } from "@/components/job-filters"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Job {
  id: string
  title: string
  description: string
  job_type: string
  location: string
  salary_min: number | null
  salary_max: number | null
  currency: string
  category_id: string | null
  image_url: string | null
  employers: {
    id: string
    company_name: string
    company_logo_url: string | null
    verified: boolean
  }
  verification_services: Array<{
    status: string
  }> | null
}

const JOBS_PER_PAGE = 10 // Added pagination constant

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJobType, setSelectedJobType] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [currentPage, setCurrentPage] = useState(1) // Added current page state
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category")
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
    setCurrentPage(1) // Reset to first page when filters change
  }, [jobs, searchQuery, selectedJobType, selectedLocation, selectedCategory])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          employers(id, company_name, company_logo_url, verified)
        `)
        .eq("status", "active")
        .order("posted_at", { ascending: false })

      if (error) throw error

      const jobsWithVerification = await Promise.all(
        (data || []).map(async (job) => {
          const { data: verificationData } = await supabase
            .from("verification_services")
            .select("status")
            .eq("employer_id", job.employer_id)
            .eq("status", "active")
            .single()

          return {
            ...job,
            isVerified: !!verificationData,
          }
        }),
      )

      setJobs(jobsWithVerification)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
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

    if (selectedJobType && selectedJobType !== "all") {
      filtered = filtered.filter((job) => job.job_type === selectedJobType)
    }

    if (selectedLocation) {
      filtered = filtered.filter((job) => job.location.toLowerCase().includes(selectedLocation.toLowerCase()))
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((job) => job.category_id === selectedCategory)
    }

    setFilteredJobs(filtered)
  }

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE
  const endIndex = startIndex + JOBS_PER_PAGE
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

  const handleApplyJob = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}/apply`)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedJobType("")
    setSelectedLocation("")
    setSelectedCategory("")
  }

  const isCompanyVerified = (job: any) => {
    return job.isVerified === true
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          استكشف الوظائف
        </h1>
        <p className="text-slate-600 mt-2 text-lg">ابحث عن فرصتك الوظيفية المثالية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <JobFilters
            onSearch={setSearchQuery}
            onJobTypeChange={setSelectedJobType}
            onLocationChange={setSelectedLocation}
            onCategoryChange={setSelectedCategory}
            onClear={handleClearFilters}
            searchQuery={searchQuery}
            selectedJobType={selectedJobType}
            selectedLocation={selectedLocation}
            selectedCategory={selectedCategory}
          />
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
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
            <>
              <div className="space-y-4">
                {paginatedJobs.map((job) => (
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
                    imageUrl={job.image_url}
                    companyLogo={job.employers.company_logo_url}
                    isVerified={isCompanyVerified(job)}
                    isSaved={false}
                    onSave={() => {
                      router.push("/auth/login")
                    }}
                    onApply={handleApplyJob}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div className="text-sm text-slate-600">
                    عرض {startIndex + 1} إلى {Math.min(endIndex, filteredJobs.length)} من {filteredJobs.length} وظيفة
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      السابق
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="gap-2"
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

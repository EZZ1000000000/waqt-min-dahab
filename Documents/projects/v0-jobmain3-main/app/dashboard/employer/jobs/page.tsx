"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Briefcase, Edit, Trash2, Users } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  location: string
  job_type: string
  status: string
  posted_at: string
  salary_min: number | null
  salary_max: number | null
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  draft: "bg-yellow-100 text-yellow-800",
}

const statusLabels: Record<string, string> = {
  active: "نشط",
  closed: "مغلق",
  draft: "مسودة",
}

const jobTypeLabels: Record<string, string> = {
  full_time: "دوام كامل",
  part_time: "دوام جزئي",
  contract: "عقد",
  temporary: "مؤقت",
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, location, job_type, status, posted_at, salary_min, salary_max")
        .eq("employer_id", userData.user.id)
        .limit(100)
        .order("posted_at", { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الإعلان الوظيفي؟")) return

    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId)
      if (error) throw error
      setJobs(jobs.filter((job) => job.id !== jobId))
    } catch (error) {
      console.error("Error deleting job:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">وظائفي</h1>
          <p className="text-muted-foreground mt-2">إدارة وتتبع إعلاناتك الوظيفية</p>
        </div>
        <Link href="/dashboard/employer/jobs/new">
          <Button>نشر وظيفة جديدة</Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Briefcase className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>لا توجد إعلانات وظيفية حتى الآن</EmptyTitle>
            <EmptyDescription>أنشئ إعلانك الأول للبدء في البحث عن المرشحين.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>{job.location}</CardDescription>
                  </div>
                  <Badge className={statusColors[job.status] || "bg-gray-100 text-gray-800"}>
                    {statusLabels[job.status] || job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{jobTypeLabels[job.job_type] || job.job_type}</span>
                    {job.salary_min && job.salary_max && (
                      <span>
                        {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                      </span>
                    )}
                    <span>تم النشر في {new Date(job.posted_at).toLocaleDateString("ar-EG")}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/employer/jobs/${job.id}/applications`}>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Users className="w-4 h-4" />
                        الطلبات
                      </Button>
                    </Link>
                    <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Edit className="w-4 h-4" />
                        تعديل
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job.id)} className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

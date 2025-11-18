"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Briefcase, ArrowLeft, Download, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

interface Application {
  id: string
  status: string
  cover_letter: string | null
  applied_at: string
  cv_url: string | null
  experience_years: number | null
  skills: string[] | null
  job_seekers: {
    profile_id: string
    resume_url: string | null
    skills: string[]
    experience_years: number | null
    profiles: {
      full_name: string
      email: string
    }
  }
}

const statusColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800",
  reviewed: "bg-purple-100 text-purple-800",
  shortlisted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-emerald-100 text-emerald-800",
}

const statusLabels: Record<string, string> = {
  applied: "تم التقديم",
  reviewed: "تم المراجعة",
  shortlisted: "مختار",
  rejected: "مرفوض",
  accepted: "مقبول",
}

export default function ApplicationsPage() {
  const params = useParams()
  const jobId = params.id as string
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (jobId) {
      fetchApplications()
    }
  }, [jobId])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("job_applications")
        .select("*, job_seekers(profile_id, resume_url, skills, experience_years, profiles(full_name, email))")
        .eq("job_id", jobId)
        .order("applied_at", { ascending: false })

      console.log("[v0] Employer Applications - Job ID:", jobId)
      console.log("[v0] Employer Applications - Data:", data)
      console.log("[v0] Employer Applications - Error:", error)

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("job_applications").update({ status: newStatus }).eq("id", applicationId)

      if (error) throw error

      setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))
    } catch (error) {
      console.error("Error updating application status:", error)
    }
  }

  const downloadCV = async (cvUrl: string, candidateName: string) => {
    try {
      const response = await fetch(cvUrl)
      const blob = await response.blob()
      const getFileExtension = (mimeType: string): string => {
        const mimeToExt: Record<string, string> = {
          "application/pdf": ".pdf",
          "application/msword": ".doc",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        }
        return mimeToExt[mimeType] || ".pdf"
      }
      const extension = getFileExtension(blob.type)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `CV_${candidateName}_${new Date().getTime()}${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading CV:", error)
    }
  }

  const getPublicCVUrl = (cvPath: string) => {
    if (!cvPath) return null
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/cvs/${cvPath}`
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
      <Link href="/dashboard/employer/jobs">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة للوظائف
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">طلبات التقديم</h1>
        <p className="text-muted-foreground mt-2">مراجعة وإدارة طلبات المتقدمين لهذه الوظيفة</p>
      </div>

      {applications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Briefcase className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>لا توجد طلبات حتى الآن</EmptyTitle>
            <EmptyDescription>ستظهر الطلبات هنا عندما يتقدم المرشحون لهذه الوظيفة.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle>{app.job_seekers.profiles.full_name}</CardTitle>
                    <CardDescription>{app.job_seekers.profiles.email}</CardDescription>
                  </div>
                  <Badge className={statusColors[app.status] || "bg-gray-100 text-gray-800"}>
                    {statusLabels[app.status] || app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">سنوات الخبرة</p>
                    <p className="font-semibold">
                      {app.experience_years || app.job_seekers.experience_years || "غير محدد"} سنة
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المهارات</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(() => {
                        let skillsArray: string[] = []

                        if (app.skills) {
                          try {
                            if (typeof app.skills === "string") {
                              skillsArray = JSON.parse(app.skills)
                            } else if (Array.isArray(app.skills)) {
                              skillsArray = app.skills
                            }
                          } catch (e) {
                            skillsArray = []
                          }
                        } else if (app.job_seekers?.skills && Array.isArray(app.job_seekers.skills)) {
                          skillsArray = app.job_seekers.skills
                        }

                        return skillsArray.length > 0 ? (
                          skillsArray.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">لا توجد مهارات</span>
                        )
                      })()}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ التقديم</p>
                    <p className="font-semibold">{new Date(app.applied_at).toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>

                {app.cover_letter && (
                  <div>
                    <p className="text-sm font-semibold mb-2">رسالة التقديم:</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded line-clamp-3">
                      {app.cover_letter}
                    </p>
                  </div>
                )}

                {app.cv_url && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">السيرة الذاتية (CV)</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">متوفرة للعرض والتنزيل</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={getPublicCVUrl(app.cv_url)} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <FileText className="w-4 h-4" />
                            عرض
                          </Button>
                        </a>
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => downloadCV(getPublicCVUrl(app.cv_url)!, app.job_seekers.profiles.full_name)}
                        >
                          <Download className="w-4 h-4" />
                          تنزيل
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    تم التقديم في {new Date(app.applied_at).toLocaleDateString("ar-EG")}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(app.id, "shortlisted")}
                      className="bg-transparent"
                    >
                      اختيار
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(app.id, "rejected")}
                      className="bg-transparent"
                    >
                      رفض
                    </Button>
                    <Button size="sm" onClick={() => handleStatusChange(app.id, "accepted")}>
                      قبول
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

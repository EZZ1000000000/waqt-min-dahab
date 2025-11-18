"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Users, Download, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Applicant {
  id: string
  job_seeker_id: string
  status: string
  applied_at: string
  cover_letter: string | null
  job_seekers: {
    profile_id: string
    resume_url: string | null
    skills: string[]
    experience_years: number | null
    profile_image_url: string | null
    profiles: {
      full_name: string
      email: string
    }
  }
}

export default function ApplicantsPage() {
  const params = useParams()
  const jobId = params.id as string
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchApplicants()
  }, [jobId])

  const fetchApplicants = async () => {
    try {
      if (!jobId) {
        console.error("Job ID is not available")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const { data, error } = await supabase
        .from("job_applications")
        .select(
          `
          id,
          job_seeker_id,
          status,
          applied_at,
          cover_letter,
          job_seekers(
            profile_id,
            resume_url,
            skills,
            experience_years,
            profile_image_url,
            profiles(full_name, email)
          )
        `,
        )
        .eq("job_id", jobId)
        .order("applied_at", { ascending: false })

      if (error) throw error
      setApplicants(data || [])
    } catch (error) {
      console.error("Error fetching applicants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800"
      case "reviewed":
        return "bg-yellow-100 text-yellow-800"
      case "shortlisted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "accepted":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "applied":
        return "تم التقديم"
      case "reviewed":
        return "تم المراجعة"
      case "shortlisted":
        return "مختار"
      case "rejected":
        return "مرفوض"
      case "accepted":
        return "مقبول"
      default:
        return status
    }
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
        <h1 className="text-3xl font-bold">المتقدمون للوظيفة</h1>
        <p className="text-muted-foreground mt-2">عرض وإدارة طلبات المتقدمين</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>لا توجد طلبات حتى الآن</EmptyTitle>
            <EmptyDescription>لم يتقدم أحد لهذه الوظيفة بعد</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <Card key={applicant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {applicant.job_seekers.profile_image_url && (
                      <img
                        src={applicant.job_seekers.profile_image_url || "/placeholder.svg"}
                        alt={applicant.job_seekers.profiles.full_name}
                        className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle>{applicant.job_seekers.profiles.full_name}</CardTitle>
                      <CardDescription>{applicant.job_seekers.profiles.email}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(applicant.status)}>{getStatusLabel(applicant.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">سنوات الخبرة</p>
                    <p className="font-semibold">{applicant.job_seekers.experience_years || "غير محدد"} سنة</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المهارات</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {applicant.job_seekers.skills && applicant.job_seekers.skills.length > 0 ? (
                        applicant.job_seekers.skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">لا توجد مهارات</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ التقديم</p>
                    <p className="font-semibold">{new Date(applicant.applied_at).toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>

                {applicant.cover_letter && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">رسالة التقديم</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{applicant.cover_letter}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {applicant.job_seekers.resume_url && (
                    <a href={applicant.job_seekers.resume_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Download className="w-4 h-4" />
                        تحميل السيرة الذاتية
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <FileText className="w-4 h-4" />
                    عرض الملف الشخصي
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

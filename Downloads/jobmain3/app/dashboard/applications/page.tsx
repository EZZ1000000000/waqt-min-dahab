"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Briefcase, Calendar } from "lucide-react"

interface Application {
  id: string
  status: string
  cover_letter: string | null
  applied_at: string
  jobs: {
    title: string
    location: string
    employers: {
      company_name: string
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
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userData.user.id)
        .single()

      if (profileError || !profile) {
        console.error("Profile not found")
        return
      }

      const { data: jobSeeker, error: seekerError } = await supabase
        .from("job_seekers")
        .select("id")
        .eq("profile_id", profile.id)
        .single()

      if (seekerError || !jobSeeker) {
        console.error("Job seeker not found")
        return
      }

      const { data, error } = await supabase
        .from("job_applications")
        .select("*, jobs(title, location, employers(company_name))")
        .eq("job_seeker_id", jobSeeker.id)
        .order("applied_at", { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">طلباتي</h1>
        <p className="text-muted-foreground mt-2">تتبع طلبات التوظيف الخاصة بك</p>
      </div>

      {applications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Briefcase className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>لا توجد طلبات حتى الآن</EmptyTitle>
            <EmptyDescription>ابدأ بالتقديم على الوظائف لرؤية طلباتك هنا.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle>{app.jobs.title}</CardTitle>
                    <CardDescription>{app.jobs.employers.company_name}</CardDescription>
                  </div>
                  <Badge className={statusColors[app.status] || "bg-gray-100 text-gray-800"}>
                    {statusLabels[app.status] || app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  تم التقديم في {new Date(app.applied_at).toLocaleDateString("ar-EG")}
                </div>
                {app.cover_letter && (
                  <div>
                    <p className="text-sm font-semibold mb-1">خطاب التقديم:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{app.cover_letter}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { FileText, Search, Download, Eye } from "lucide-react"

interface Application {
  id: string
  status: string
  applied_at: string
  cv_url: string | null
  cover_letter: string | null
  jobs: {
    title: string
    employers: {
      company_name: string
    }
  }
  job_seekers: {
    profiles: {
      full_name: string
      email: string
    }
    experience_years: number | null
    skills: string[]
    resume_url: string | null
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

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const supabase = createClient()

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchQuery, statusFilter])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("job_applications")
        .select(
          "*, jobs(title, employers(company_name)), job_seekers(profiles(full_name, email), experience_years, skills, resume_url)",
        )
        .order("applied_at", { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          app.job_seekers.profiles.full_name.toLowerCase().includes(query) ||
          app.job_seekers.profiles.email.toLowerCase().includes(query) ||
          app.jobs.title.toLowerCase().includes(query),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
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
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">جدول الطلبات الشامل</h1>
        <p className="text-muted-foreground mt-2">عرض جميع طلبات التقديم والسير الذاتية لجميع المستخدمين</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">تصفية الطلبات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن المرشح أو الوظيفة أو الشركة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="applied">تم التقديم</SelectItem>
              <SelectItem value="reviewed">تم المراجعة</SelectItem>
              <SelectItem value="shortlisted">مختار</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
              <SelectItem value="accepted">مقبول</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filteredApplications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>لم يتم العثور على طلبات</EmptyTitle>
            <EmptyDescription>حاول تعديل معايير البحث.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted">
                <th className="px-4 py-3 text-right text-sm font-semibold">المرشح</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الوظيفة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الشركة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الخبرة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">السيرة الذاتية</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{app.job_seekers.profiles.full_name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{app.job_seekers.profiles.email}</td>
                  <td className="px-4 py-3 text-sm">{app.jobs.title}</td>
                  <td className="px-4 py-3 text-sm">{app.jobs.employers.company_name}</td>
                  <td className="px-4 py-3 text-sm">{app.job_seekers.experience_years || "-"} سنة</td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[app.status] || "bg-gray-100 text-gray-800"}>
                      {statusLabels[app.status] || app.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {app.cv_url ? (
                      <div className="flex gap-2">
                        <a href={getPublicCVUrl(app.cv_url)} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" />
                            عرض
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => downloadCV(getPublicCVUrl(app.cv_url)!, app.job_seekers.profiles.full_name)}
                        >
                          <Download className="w-4 h-4" />
                          تنزيل
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">غير متوفرة</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(app.applied_at).toLocaleDateString("ar-EG")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          إجمالي الطلبات: <span className="font-semibold text-foreground">{filteredApplications.length}</span>
        </p>
      </div>
    </div>
  )
}

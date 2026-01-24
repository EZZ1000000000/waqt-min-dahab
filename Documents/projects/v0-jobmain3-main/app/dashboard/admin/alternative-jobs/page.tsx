import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users } from "lucide-react"
import { AlternativeJobsManagementClient } from "@/components/alternative-jobs-management-client"

export default async function AlternativeJobsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user is an admin
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", data.user.id).single()

  if (profile?.user_type !== "admin") {
    redirect("/dashboard")
  }

  // Fetch rejected applications
  const { data: rejectedApplications } = await supabase
    .from("job_applications")
    .select(
      `
      id,
      job_seeker_id,
      job_id,
      status,
      created_at,
      job_seekers(id, full_name, email),
      jobs(id, title, category, employers(company_name))
    `,
    )
    .eq("status", "rejected")
    .order("created_at", { ascending: false })

  // Fetch alternative jobs sent
  const { data: alternativeJobs } = await supabase
    .from("alternative_jobs")
    .select(
      `
      id,
      job_seeker_id,
      job_id,
      reason,
      created_at,
      job_seekers(id, full_name, email),
      jobs(id, title, category, employers(company_name))
    `,
    )
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="w-8 h-8" />
          إدارة الوظائف البديلة
        </h1>
        <p className="text-muted-foreground mt-2">إرسال وظائف بديلة للمرشحين المرفوضين</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              الطلبات المرفوضة
            </CardTitle>
            <CardDescription>المرشحون الذين تم رفض طلباتهم</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{rejectedApplications?.length || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">طلب مرفوض</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              الوظائف البديلة المرسلة
            </CardTitle>
            <CardDescription>الوظائف البديلة المقترحة</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{alternativeJobs?.length || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">وظيفة بديلة</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle>إرسال وظائف بديلة</CardTitle>
          <CardDescription>اختر مرشح مرفوض وأرسل له وظائف بديلة من نفس المجال</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AlternativeJobsManagementClient
            rejectedApplications={rejectedApplications || []}
            alternativeJobs={alternativeJobs || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}

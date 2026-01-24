import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, FileText, Shield, Crown } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user is an admin
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", data.user.id).single()

  if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") {
    redirect("/dashboard")
  }

  // Fetch statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalJobs } = await supabase.from("jobs").select("*", { count: "exact", head: true })

  const { count: totalApplications } = await supabase
    .from("job_applications")
    .select("*", { count: "exact", head: true })

  const { count: activeJobs } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: verifiedCompanies } = await supabase
    .from("employers")
    .select("*", { count: "exact", head: true })
    .eq("verified", true)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">لوحة تحكم المسؤول</h1>
        <p className="text-muted-foreground mt-2">إدارة المستخدمين والوظائف والنشاط على المنصة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              إجمالي المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">مستخدمون مسجلون</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              إجمالي الوظائف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">إعلانات وظائف</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              الوظائف النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">نشطة حالياً</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الطلبات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              شركات موثوقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedCompanies || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">شركات موثوقة</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>إدارة محتوى المنصة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/dashboard/admin/users" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <p className="font-medium">إدارة المستخدمين</p>
              <p className="text-sm text-muted-foreground">عرض وإدارة جميع المستخدمين</p>
            </a>
            <a href="/dashboard/admin/jobs" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <p className="font-medium">إدارة الوظائف</p>
              <p className="text-sm text-muted-foreground">مراجعة وتعديل إعلانات الوظائف</p>
            </a>
            <a href="/dashboard/admin/applications" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <p className="font-medium">عرض الطلبات</p>
              <p className="text-sm text-muted-foreground">مراقبة نشاط الطلبات</p>
            </a>
            <a href="/dashboard/admin/hero-slider" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <p className="font-medium">إدارة سلايدر البطل</p>
              <p className="text-sm text-muted-foreground">إدارة الصور والنصوص في قسم البطل</p>
            </a>
            <a href="/dashboard/admin/categories" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <p className="font-medium">إدارة الفئات</p>
              <p className="text-sm text-muted-foreground">إضافة وتعديل فئات الوظائف</p>
            </a>
            <a href="/dashboard/admin/verification" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <p className="font-medium">إدارة التوثيق</p>
              <p className="text-sm text-muted-foreground">إدارة خدمة توثيق الشركات</p>
            </a>
            <a
              href="/dashboard/admin/verification-settings"
              className="block p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <p className="font-medium">إعدادات التوثيق</p>
              <p className="text-sm text-muted-foreground">تعديل أسعار وإعدادات الخدمة</p>
            </a>
            <a
              href="/dashboard/admin/alternative-jobs"
              className="block p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <p className="font-medium">الوظائف البديلة</p>
              <p className="text-sm text-muted-foreground">إرسال وظائف بديلة للمرفوضين</p>
            </a>
            {profile?.user_type === "super_admin" && (
              <a
                href="/dashboard/super-admin"
                className="block p-3 rounded-lg hover:bg-muted transition-colors bg-blue-50 border border-blue-200"
              >
                <p className="font-medium flex items-center gap-2 text-blue-900">
                  <Crown className="w-4 h-4" />
                  إعدادات النظام
                </p>
                <p className="text-sm text-blue-700">إدارة إعدادات النظام والميزات</p>
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>حالة المنصة</CardTitle>
            <CardDescription>نظرة عامة على صحة النظام</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">قاعدة البيانات</span>
              <span className="text-sm font-medium text-green-600">تعمل بشكل طبيعي</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">المصادقة</span>
              <span className="text-sm font-medium text-green-600">تعمل بشكل طبيعي</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">واجهة برمجية</span>
              <span className="text-sm font-medium text-green-600">تعمل بشكل طبيعي</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

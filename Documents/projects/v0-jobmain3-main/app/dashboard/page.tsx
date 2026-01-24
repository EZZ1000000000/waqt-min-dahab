import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, FileText, Heart, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, user_type")
    .eq("id", data.user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">أهلاً وسهلاً بك مجدداً! 👋</h1>
          <p className="text-lg text-muted-foreground">
            {profile?.full_name && `مرحباً ${profile.full_name}، `}
            جاهز للبحث عن فرصتك الوظيفية التالية؟
          </p>
        </div>

        {profile?.user_type === "job_seeker" && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-blue-900" />
                </div>
                <CardTitle className="text-lg">استكشف الوظائف</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">ابحث عن آلاف الفرص الوظيفية المتاحة</p>
                <Link href="/dashboard/jobs" className="block">
                  <Button className="w-full bg-blue-900 hover:bg-blue-800">ابدأ البحث</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-900" />
                </div>
                <CardTitle className="text-lg">طلباتي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">تابع حالة طلباتك وتطبيقاتك</p>
                <Link href="/dashboard/applications" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    عرض الطلبات
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-amber-900" />
                </div>
                <CardTitle className="text-lg">الوظائف المحفوظة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">عرض الوظائف التي حفظتها</p>
                <Link href="/dashboard/saved-jobs" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    المحفوظة
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {profile?.user_type === "employer" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-blue-900" />
                </div>
                <CardTitle className="text-lg">وظائفي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">إدارة الوظائف المنشورة والطلبات</p>
                <Link href="/dashboard/employer/jobs" className="block">
                  <Button className="w-full bg-blue-900 hover:bg-blue-800">عرض الوظائف</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-900" />
                </div>
                <CardTitle className="text-lg">نشر وظيفة جديدة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">أضف فرصة عمل جديدة للمنصة</p>
                <Link href="/dashboard/employer/jobs/new" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    نشر وظيفة
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

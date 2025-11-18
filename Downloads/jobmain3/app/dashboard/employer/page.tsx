import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Shield, Phone, Calendar, DollarSign } from "lucide-react"

export default async function EmployerDashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user is an employer
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", data.user.id).single()

  if (profile?.user_type !== "employer") {
    redirect("/dashboard")
  }

  // Get employer data
  const { data: employer } = await supabase
    .from("employers")
    .select("id, company_name, verified")
    .eq("id", data.user.id)
    .single()

  // Get verification service data
  const { data: verificationService } = await supabase
    .from("verification_services")
    .select("*")
    .eq("employer_id", data.user.id)
    .maybeSingle()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">لوحة تحكم الشركة</h1>
        <p className="text-muted-foreground mb-8">إدارة وظائفك والعثور على أفضل المواهب.</p>

        {verificationService && (
          <Card className="mb-8 border-0 shadow-lg overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />
            <CardHeader className="bg-gradient-to-br from-amber-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-amber-600" />
                  <CardTitle className="text-slate-900">باقة التوثيق</CardTitle>
                </div>
                <Badge
                  className={
                    verificationService.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {verificationService.status === "active" ? "نشطة" : "غير نشطة"}
                </Badge>
              </div>
              <CardDescription className="mt-2">تفاصيل خدمة التوثيق الخاصة بك</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">السعر</p>
                    <p className="text-xl font-bold text-slate-900">
                      {verificationService.price} {verificationService.currency}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">المدة</p>
                    <p className="text-xl font-bold text-slate-900">
                      {verificationService.expires_at
                        ? Math.ceil(
                            (new Date(verificationService.expires_at).getTime() - new Date().getTime()) /
                              (1000 * 60 * 60 * 24),
                          )
                        : "غير محدد"}{" "}
                      يوم
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">رقم التواصل</p>
                    <p className="text-lg font-bold text-slate-900 dir-ltr">{verificationService.contact_phone}</p>
                  </div>
                </div>

                {verificationService.notes && (
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">ملاحظات</p>
                      <p className="text-slate-900">{verificationService.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {verificationService.activated_at && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-slate-600">
                    تم التفعيل في:{" "}
                    <span className="font-semibold text-slate-900">
                      {new Date(verificationService.activated_at).toLocaleDateString("ar-EG")}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Link href="/dashboard/employer/jobs">
            <Button size="lg">عرض وظائفي</Button>
          </Link>
          <Link href="/dashboard/employer/jobs/new">
            <Button size="lg" variant="outline">
              نشر وظيفة جديدة
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

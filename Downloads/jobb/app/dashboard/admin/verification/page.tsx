import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Phone, DollarSign } from "lucide-react"
import { VerificationManagementClient } from "@/components/verification-management-client"

export default async function VerificationPage() {
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

  // Fetch all employers
  const { data: employers } = await supabase
    .from("employers")
    .select("id, company_name, verified, created_at, location")
    .order("created_at", { ascending: false })

  // Fetch verification pricing
  const { data: pricing } = await supabase.from("verification_pricing").select("*").eq("is_active", true).single()

  // Fetch verification services
  const { data: services } = await supabase
    .from("verification_services")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          إدارة خدمة التوثيق
        </h1>
        <p className="text-muted-foreground mt-2">إدارة توثيق الشركات والخدمات المدفوعة</p>
      </div>

      {/* Pricing Section */}
      {pricing && (
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              سعر الخدمة
            </CardTitle>
            <CardDescription>معلومات التسعير وطريقة التواصل</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">اسم الخدمة</p>
                <p className="font-semibold text-lg">{pricing.service_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">السعر</p>
                <p className="font-semibold text-lg">
                  {pricing.price} {pricing.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">رقم التواصل</p>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${pricing.contact_phone}`} className="font-semibold text-blue-600 hover:underline">
                    {pricing.contact_phone}
                  </a>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">{pricing.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Employers List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle>قائمة الشركات</CardTitle>
          <CardDescription>إدارة حالة التوثيق للشركات</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-4 font-semibold">اسم الشركة</th>
                  <th className="text-right py-3 px-4 font-semibold">الموقع</th>
                  <th className="text-right py-3 px-4 font-semibold">حالة التوثيق</th>
                  <th className="text-right py-3 px-4 font-semibold">تاريخ الإنشاء</th>
                  <th className="text-right py-3 px-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {employers && employers.length > 0 ? (
                  employers.map((employer: any) => (
                    <tr key={employer.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium">{employer.company_name}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{employer.location || "-"}</td>
                      <td className="py-3 px-4">
                        {employer.verified ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1 w-fit">
                            <Shield className="w-3 h-3" />
                            موثوقة
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            غير موثوقة
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(employer.created_at).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-3 px-4">
                        <VerificationManagementClient
                          employerId={employer.id}
                          isVerified={employer.verified}
                          companyName={employer.company_name}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      لا توجد شركات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Active Services */}
      {services && services.length > 0 && (
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle>الخدمات النشطة</CardTitle>
            <CardDescription>الشركات التي لديها خدمات توثيق نشطة</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {services.map((service: any) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">خدمة توثيق</p>
                    <p className="text-sm text-muted-foreground">
                      الحالة: <Badge variant="outline">{service.status}</Badge>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{service.price} EGP</p>
                    {service.expires_at && (
                      <p className="text-sm text-muted-foreground">
                        ينتهي: {new Date(service.expires_at).toLocaleDateString("ar-EG")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

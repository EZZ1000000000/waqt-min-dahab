import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { VerificationSettingsClient } from "@/components/verification-settings-client"

export default async function VerificationSettingsPage() {
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

  // Fetch verification pricing
  const { data: pricing } = await supabase.from("verification_pricing").select("*").eq("is_active", true).single()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="w-8 h-8" />
          إعدادات خدمة التوثيق
        </h1>
        <p className="text-muted-foreground mt-2">تعديل أسعار الخدمة والمدة ورقم التواصل</p>
      </div>

      {pricing && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle>معلومات الخدمة</CardTitle>
            <CardDescription>قم بتحديث إعدادات خدمة التوثيق</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <VerificationSettingsClient pricing={pricing} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

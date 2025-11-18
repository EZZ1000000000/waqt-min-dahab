import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-sm">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold">تم إنشاء الحساب بنجاح</CardTitle>
            <CardDescription className="text-green-100">تحقق من بريدك الإلكتروني</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-right">
              <p className="text-sm text-green-800 font-semibold">✓ تم إرسال رابط التأكيد إلى بريدك الإلكتروني</p>
            </div>
            <p className="text-sm text-gray-600 text-right">
              يرجى التحقق من بريدك الإلكتروني والنقر على رابط التأكيد لإكمال تسجيلك.
            </p>
            <p className="text-xs text-gray-500 text-right">إذا لم تجد البريد، تحقق من مجلد البريد العشوائي (Spam).</p>
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold py-2 rounded-lg transition-all">
                العودة إلى تسجيل الدخول
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [userType, setUserType] = useState<"job_seeker" | "employer">("job_seeker")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("كلمات المرور غير متطابقة")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            user_type: userType,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "حدث خطأ ما")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
              <CardTitle className="text-3xl font-bold">إنشاء حساب جديد</CardTitle>
              <CardDescription className="text-blue-100">انضم إلى منصة إلدومنة للتوظيف</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-right text-gray-700 font-semibold">
                      الاسم الكامل
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="أحمد محمد"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-right text-gray-700 font-semibold">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="userType" className="text-right text-gray-700 font-semibold">
                      أنا
                    </Label>
                    <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                      <SelectTrigger id="userType" className="text-right" dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job_seeker">باحث عن وظيفة</SelectItem>
                        <SelectItem value="employer">صاحب عمل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-right text-gray-700 font-semibold">
                      كلمة المرور
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-right text-gray-700 font-semibold">
                      تأكيد كلمة المرور
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded text-right">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold py-2 rounded-lg transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  هل لديك حساب بالفعل؟{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-900 font-bold underline underline-offset-4 hover:text-blue-800"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

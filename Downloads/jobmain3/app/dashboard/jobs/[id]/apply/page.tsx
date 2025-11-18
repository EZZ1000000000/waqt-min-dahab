"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ApplyJobPage() {
  const params = useParams()
  const jobId = params.id as string

  const [coverLetter, setCoverLetter] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvFileName, setCvFileName] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [skills, setSkills] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [jobExists, setJobExists] = useState(false)
  const [jobTitle, setJobTitle] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkJob = async () => {
      try {
        const { data: job, error: jobError } = await supabase.from("jobs").select("id, title").eq("id", jobId).single()

        if (jobError || !job) {
          setError("الوظيفة غير موجودة")
          return
        }

        setJobExists(true)
        setJobTitle(job.title)
      } catch (err) {
        console.error("[v0] Job check error:", err)
        setError("فشل في التحقق من الوظيفة")
      }
    }

    if (jobId) {
      checkJob()
    }
  }, [jobId, supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!validTypes.includes(file.type)) {
        setError("يرجى رفع ملف PDF أو Word فقط")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الملف يجب أن يكون أقل من 5MB")
        return
      }
      setCvFile(file)
      setCvFileName(file.name)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!jobExists) {
        setError("الوظيفة غير موجودة")
        return
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        setError("يجب تسجيل الدخول أولاً")
        router.push("/auth/login")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        setError("لم يتم العثور على ملفك الشخصي")
        return
      }

      const { data: jobSeeker, error: seekerError } = await supabase
        .from("job_seekers")
        .select("id")
        .eq("profile_id", profile.id)
        .single()

      if (seekerError || !jobSeeker) {
        setError("لم يتم العثور على ملف الباحث عن عمل. يرجى إكمال ملفك الشخصي أولاً")
        return
      }

      let cvUrl = null

      if (cvFile) {
        const fileName = `${user.id}/${Date.now()}_${cvFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage.from("cvs").upload(fileName, cvFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: cvFile.type,
        })

        if (uploadError) {
          console.error("[v0] Upload error:", uploadError)
          throw new Error(`فشل رفع الملف: ${uploadError.message}`)
        }

        cvUrl = uploadData.path
      }

      const skillsArray = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)

      const { error: insertError } = await supabase.from("job_applications").insert({
        job_id: jobId,
        job_seeker_id: jobSeeker.id,
        cover_letter: coverLetter || null,
        cv_url: cvUrl,
        skills: skillsArray.length > 0 ? skillsArray : null,
        status: "applied",
      })

      if (insertError) {
        console.error("[v0] Insert error:", insertError)
        throw new Error(`فشل إرسال الطلب: ${insertError.message}`)
      }

      if (experienceYears) {
        const { error: updateError } = await supabase
          .from("job_seekers")
          .update({ experience_years: Number.parseInt(experienceYears) })
          .eq("id", jobSeeker.id)

        if (updateError) {
          console.error("[v0] Update error:", updateError)
          throw new Error(`فشل تحديث سنوات الخبرة: ${updateError.message}`)
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/applications")
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "فشل في إرسال الطلب"
      setError(errorMessage)
      console.error("[v0] Application error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!jobExists && !error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">جاري التحقق من الوظيفة...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/dashboard/jobs/${jobId}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة للوظيفة
        </Button>
      </Link>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>تقديم الطلب</CardTitle>
            <CardDescription>{jobTitle || "أرسل طلبك مع سيرتك الذاتية"}</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4 py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <p className="text-green-600 font-semibold text-lg">تم إرسال الطلب بنجاح!</p>
                <p className="text-muted-foreground">جاري التحويل إلى طلباتك...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* CV Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="cv" className="text-base font-semibold">
                    السيرة الذاتية (CV) *
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      id="cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label htmlFor="cv" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="font-medium">اضغط لرفع الملف أو اسحبه هنا</span>
                      <span className="text-sm text-muted-foreground">PDF أو Word (حد أقصى 5MB)</span>
                    </label>
                  </div>
                  {cvFileName && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">{cvFileName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-base font-semibold">
                    سنوات الخبرة *
                  </Label>
                  <input
                    id="experience"
                    type="number"
                    min="0"
                    max="70"
                    placeholder="أدخل عدد سنوات الخبرة"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-base font-semibold">
                    المهارات *
                  </Label>
                  <Textarea
                    id="skills"
                    placeholder="أدخل المهارات مفصولة بفواصل (مثال: JavaScript, React, Node.js)"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">اكتب المهارات مفصولة بفواصل</p>
                </div>

                {/* Cover Letter Section */}
                <div className="space-y-2">
                  <Label htmlFor="coverLetter" className="text-base font-semibold">
                    خطاب التقديم
                  </Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="أخبر صاحب العمل لماذا أنت مناسب لهذه الوظيفة..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">اختياري لكن موصى به</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading || !cvFile} className="flex-1">
                    {isLoading ? "جاري الإرسال..." : "إرسال الطلب"}
                  </Button>
                  <Link href={`/dashboard/jobs/${jobId}`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full bg-transparent">
                      إلغاء
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

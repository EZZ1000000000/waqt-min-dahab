"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface JobData {
  id: string
  title: string
  description: string
  requirements: string[]
  job_type: string
  location: string
  remote_type: string
  salary_min: number | null
  salary_max: number | null
  currency: string
  deadline: string | null
  status: string
}

export default function EditJobPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<JobData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    try {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase.from("jobs").select("*").eq("id", params.id).single()

      if (fetchError) throw fetchError
      setFormData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل في جلب الوظيفة")
      router.push("/dashboard/employer/jobs")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : null,
    )
  }

  const handleSelectChange = (name: string, value: string) => {
    if (!formData) return
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : null,
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setIsSaving(true)
    setError(null)

    try {
      const requirements = formData.requirements
        .map((req) => (typeof req === "string" ? req : ""))
        .filter((req) => req.trim().length > 0)

      const { error: updateError } = await supabase
        .from("jobs")
        .update({
          title: formData.title,
          description: formData.description,
          requirements,
          job_type: formData.job_type,
          location: formData.location,
          remote_type: formData.remote_type,
          salary_min: formData.salary_min ? Number.parseInt(String(formData.salary_min)) : null,
          salary_max: formData.salary_max ? Number.parseInt(String(formData.salary_max)) : null,
          currency: formData.currency,
          deadline: formData.deadline || null,
          status: formData.status,
        })
        .eq("id", params.id)

      if (updateError) throw updateError

      router.push("/dashboard/employer/jobs")
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل في تحديث الوظيفة")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-96 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-slate-600">الوظيفة غير موجودة</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/dashboard/employer/jobs">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة للوظائف
        </Button>
      </Link>

      <div className="max-w-3xl mx-auto">
        <Card className="border-0 shadow-lg">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardTitle>تعديل الوظيفة</CardTitle>
            <CardDescription>حدّث تفاصيل الوظيفة</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الوظيفة *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">الموقع *</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الوظيفة *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">المتطلبات</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={Array.isArray(formData.requirements) ? formData.requirements.join("\n") : ""}
                  onChange={(e) => {
                    if (formData) {
                      setFormData({
                        ...formData,
                        requirements: e.target.value.split("\n"),
                      })
                    }
                  }}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_type">نوع الوظيفة *</Label>
                  <Select value={formData.job_type} onValueChange={(value) => handleSelectChange("job_type", value)}>
                    <SelectTrigger id="job_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">دوام كامل</SelectItem>
                      <SelectItem value="part_time">دوام جزئي</SelectItem>
                      <SelectItem value="contract">عقد</SelectItem>
                      <SelectItem value="temporary">مؤقت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remote_type">نوع العمل *</Label>
                  <Select
                    value={formData.remote_type}
                    onValueChange={(value) => handleSelectChange("remote_type", value)}
                  >
                    <SelectTrigger id="remote_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_site">في المقر</SelectItem>
                      <SelectItem value="hybrid">هجين</SelectItem>
                      <SelectItem value="remote">عن بعد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">الحد الأدنى للراتب</Label>
                  <Input
                    id="salary_min"
                    name="salary_min"
                    type="number"
                    value={formData.salary_min || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">الحد الأقصى للراتب</Label>
                  <Input
                    id="salary_max"
                    name="salary_max"
                    type="number"
                    value={formData.salary_max || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="EGP">EGP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">آخر موعد للتقديم</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline ? formData.deadline.split("T")[0] : ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشطة</SelectItem>
                      <SelectItem value="closed">مغلقة</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
                <Link href="/dashboard/employer/jobs" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    إلغاء
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

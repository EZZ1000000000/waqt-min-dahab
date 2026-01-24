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
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"

interface Category {
  id: string
  name: string
}

interface FormData {
  title: string
  description: string
  requirements: string
  job_type: "full_time" | "part_time" | "contract" | "temporary"
  location: string
  remote_type: "on_site" | "hybrid" | "remote"
  salary_min: string
  salary_max: string
  currency: string
  deadline: string
  category_id: string
  image_url: string
}

export default function NewJobPage() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    requirements: "",
    job_type: "full_time",
    location: "",
    remote_type: "on_site",
    salary_min: "",
    salary_max: "",
    currency: "EGP",
    deadline: "",
    category_id: "",
    image_url: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("job_categories")
        .select("id, name")
        .order("name", { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("فشل في تحميل الفئات")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الصورة يجب أن يكون أقل من 5 ميجابايت")
        return
      }
      if (!file.type.startsWith("image/")) {
        setError("يجب أن تكون الملف صورة")
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    setIsUploadingImage(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return null

      const fileName = `${userData.user.id}/${Date.now()}-${imageFile.name}`
      const { data, error } = await supabase.storage.from("job-images").upload(fileName, imageFile)

      if (error) throw error

      const { data: publicUrl } = supabase.storage.from("job-images").getPublicUrl(fileName)

      return publicUrl.publicUrl
    } catch (err) {
      console.error("[v0] Image upload error:", err)
      setError("فشل في رفع الصورة")
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = "عنوان الوظيفة مطلوب"
    }
    if (formData.title.trim().length < 3) {
      errors.title = "عنوان الوظيفة يجب أن يكون 3 أحرف على الأقل"
    }

    if (!formData.description.trim()) {
      errors.description = "وصف الوظيفة مطلوب"
    }
    if (formData.description.trim().length < 10) {
      errors.description = "وصف الوظيفة يجب أن يكون 10 أحرف على الأقل"
    }

    if (!formData.location.trim()) {
      errors.location = "الموقع مطلوب"
    }

    if (!formData.job_type) {
      errors.job_type = "نوع الوظيفة مطلوب"
    }

    if (!formData.remote_type) {
      errors.remote_type = "نوع العمل مطلوب"
    }

    if (!formData.category_id) {
      errors.category_id = "الفئة مطلوبة"
    }

    if (formData.salary_min && formData.salary_max) {
      const min = Number.parseInt(formData.salary_min)
      const max = Number.parseInt(formData.salary_max)
      if (min > max) {
        errors.salary = "الحد الأدنى للراتب يجب أن يكون أقل من الحد الأقصى"
      }
    }

    if (formData.deadline) {
      const deadline = new Date(formData.deadline)
      if (deadline < new Date()) {
        errors.deadline = "آخر موعد للتقديم يجب أن يكون في المستقبل"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      setError("يرجى تصحيح الأخطاء أعلاه")
      return
    }

    setIsLoading(true)

    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError || !userData.user) {
        router.push("/auth/login")
        return
      }

      const { data: employerData, error: employerError } = await supabase
        .from("employers")
        .select("id")
        .eq("id", userData.user.id)
        .single()

      if (employerError || !employerData) {
        setError("يجب أن تكون صاحب عمل لنشر وظيفة")
        return
      }

      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      const requirements = formData.requirements
        .split("\n")
        .map((req) => req.trim())
        .filter((req) => req.length > 0)

      const jobData = {
        employer_id: userData.user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: requirements.length > 0 ? requirements : [],
        job_type: formData.job_type,
        location: formData.location.trim(),
        remote_type: formData.remote_type,
        salary_min: formData.salary_min ? Number.parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number.parseInt(formData.salary_max) : null,
        currency: formData.currency,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        category_id: formData.category_id,
        status: "active",
        image_url: imageUrl,
      }

      console.log("[v0] Submitting job data:", jobData)

      const { data, error: insertError } = await supabase.from("jobs").insert([jobData]).select()

      if (insertError) {
        console.error("[v0] Insert error:", insertError)
        throw insertError
      }

      console.log("[v0] Job created successfully:", data)
      router.push("/dashboard/employer/jobs")
    } catch (err) {
      console.error("[v0] Error creating job:", err)
      const errorMessage = err instanceof Error ? err.message : "فشل في إنشاء الإعلان الوظيفي"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
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
        <Card>
          <CardHeader>
            <CardTitle>نشر وظيفة جديدة</CardTitle>
            <CardDescription>أدخل التفاصيل لإنشاء إعلان وظيفي جديد</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="job_image">صورة الوظيفة (اختياري)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="معاينة الصورة"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        إزالة الصورة
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">اضغط لاختيار صورة أو اسحبها هنا</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF حتى 5MB</p>
                      <input
                        id="job_image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    عنوان الوظيفة <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="مثال: مهندس برمجيات أول"
                    value={formData.title}
                    onChange={handleChange}
                    className={validationErrors.title ? "border-destructive" : ""}
                  />
                  {validationErrors.title && <p className="text-xs text-destructive">{validationErrors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">
                    الموقع <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="مثال: القاهرة، مصر"
                    value={formData.location}
                    onChange={handleChange}
                    className={validationErrors.location ? "border-destructive" : ""}
                  />
                  {validationErrors.location && <p className="text-xs text-destructive">{validationErrors.location}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">
                  الفئة <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleSelectChange("category_id", value)}
                >
                  <SelectTrigger id="category_id" className={validationErrors.category_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="اختر فئة الوظيفة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.category_id && (
                  <p className="text-xs text-destructive">{validationErrors.category_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  وصف الوظيفة <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="صف الدور والمسؤوليات وما تبحث عنه..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={validationErrors.description ? "border-destructive" : ""}
                />
                {validationErrors.description && (
                  <p className="text-xs text-destructive">{validationErrors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">المتطلبات</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="أدخل كل متطلب في سطر جديد"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">متطلب واحد لكل سطر</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_type">
                    نوع الوظيفة <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.job_type} onValueChange={(value) => handleSelectChange("job_type", value)}>
                    <SelectTrigger id="job_type" className={validationErrors.job_type ? "border-destructive" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">دوام كامل</SelectItem>
                      <SelectItem value="part_time">دوام جزئي</SelectItem>
                      <SelectItem value="contract">عقد</SelectItem>
                      <SelectItem value="temporary">مؤقت</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.job_type && <p className="text-xs text-destructive">{validationErrors.job_type}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remote_type">
                    نوع العمل <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.remote_type}
                    onValueChange={(value) => handleSelectChange("remote_type", value)}
                  >
                    <SelectTrigger
                      id="remote_type"
                      className={validationErrors.remote_type ? "border-destructive" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_site">في المقر</SelectItem>
                      <SelectItem value="hybrid">هجين</SelectItem>
                      <SelectItem value="remote">عن بعد</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.remote_type && (
                    <p className="text-xs text-destructive">{validationErrors.remote_type}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">الحد الأدنى للراتب</Label>
                  <Input
                    id="salary_min"
                    name="salary_min"
                    type="number"
                    placeholder="50000"
                    value={formData.salary_min}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">الحد الأقصى للراتب</Label>
                  <Input
                    id="salary_max"
                    name="salary_max"
                    type="number"
                    placeholder="100000"
                    value={formData.salary_max}
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
                      <SelectItem value="EGP">جنيه مصري</SelectItem>
                      <SelectItem value="USD">دولار أمريكي</SelectItem>
                      <SelectItem value="EUR">يورو</SelectItem>
                      <SelectItem value="GBP">جنيه إسترليني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {validationErrors.salary && <p className="text-xs text-destructive">{validationErrors.salary}</p>}

              <div className="space-y-2">
                <Label htmlFor="deadline">آخر موعد للتقديم</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={validationErrors.deadline ? "border-destructive" : ""}
                />
                {validationErrors.deadline && <p className="text-xs text-destructive">{validationErrors.deadline}</p>}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || isUploadingImage} className="flex-1">
                  {isLoading ? "جاري الإنشاء..." : isUploadingImage ? "جاري رفع الصورة..." : "نشر الوظيفة"}
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

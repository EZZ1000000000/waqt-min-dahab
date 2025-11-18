"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Upload, X } from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string
  user_type: string
  bio: string | null
  avatar_url: string | null
}

interface EmployerData {
  id: string
  company_name: string
  company_website: string | null
  company_logo_url: string | null
  company_description: string | null
  industry: string | null
  company_size: string | null
  location: string | null
}

interface JobSeekerData {
  id: string
  resume_url: string | null
  skills: string[]
  experience_years: number | null
  location: string | null
  preferred_job_types: string[]
  is_available: boolean
  profile_image_url: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [employerData, setEmployerData] = useState<EmployerData | null>(null)
  const [jobSeekerData, setJobSeekerData] = useState<JobSeekerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      if (profileData.user_type === "employer") {
        const { data: empData, error: empError } = await supabase
          .from("employers")
          .select("*")
          .eq("id", userData.user.id)
          .single()

        if (!empError && empData) {
          setEmployerData(empData)
          if (empData.company_logo_url) {
            setCompanyLogoPreview(empData.company_logo_url)
          }
        }
      } else if (profileData.user_type === "job_seeker") {
        const { data: seekerData, error: seekerError } = await supabase
          .from("job_seekers")
          .select("*")
          .eq("id", userData.user.id)
          .single()

        if (!seekerError && seekerData) {
          setJobSeekerData(seekerData)
          if (seekerData.profile_image_url) {
            setProfileImagePreview(seekerData.profile_image_url)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return
    const { name, value } = e.target
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleEmployerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!employerData) return
    const { name, value } = e.target
    setEmployerData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleJobSeekerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!jobSeekerData) return
    const { name, value } = e.target
    if (name === "experience_years") {
      setJobSeekerData((prev) => (prev ? { ...prev, [name]: value ? Number.parseInt(value) : null } : null))
    } else if (name === "is_available") {
      setJobSeekerData((prev) => (prev ? { ...prev, [name]: !prev.is_available } : null))
    } else {
      setJobSeekerData((prev) => (prev ? { ...prev, [name]: value } : null))
    }
  }

  const handleCompanyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !employerData) return

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "company-logos")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()
      setEmployerData((prev) => (prev ? { ...prev, company_logo_url: url } : null))
      setCompanyLogoPreview(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !jobSeekerData) return

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "profile-images")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()
      setJobSeekerData((prev) => (prev ? { ...prev, profile_image_url: url } : null))
      setProfileImagePreview(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveImage = (type: "logo" | "profile") => {
    if (type === "logo" && employerData) {
      setEmployerData((prev) => (prev ? { ...prev, company_logo_url: null } : null))
      setCompanyLogoPreview(null)
    } else if (type === "profile" && jobSeekerData) {
      setJobSeekerData((prev) => (prev ? { ...prev, profile_image_url: null } : null))
      setProfileImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
        })
        .eq("id", profile.id)

      if (profileError) throw profileError

      if (profile.user_type === "employer" && employerData) {
        const { error: empError } = await supabase
          .from("employers")
          .update({
            company_name: employerData.company_name,
            company_website: employerData.company_website,
            company_logo_url: employerData.company_logo_url,
            company_description: employerData.company_description,
            industry: employerData.industry,
            company_size: employerData.company_size,
            location: employerData.location,
          })
          .eq("id", profile.id)

        if (empError) throw empError
      } else if (profile.user_type === "job_seeker" && jobSeekerData) {
        const { error: seekerError } = await supabase
          .from("job_seekers")
          .update({
            experience_years: jobSeekerData.experience_years,
            location: jobSeekerData.location,
            is_available: jobSeekerData.is_available,
            profile_image_url: jobSeekerData.profile_image_url,
          })
          .eq("id", profile.id)

        if (seekerError) throw seekerError
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">لم يتم العثور على الملف الشخصي</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ملفي الشخصي</h1>
          <p className="text-muted-foreground mt-2">إدارة معلومات حسابك الشخصية</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الحساب الأساسية</CardTitle>
              <CardDescription>البيانات الأساسية لحسابك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={profile.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_type">نوع الحساب</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="user_type"
                    type="text"
                    value={
                      profile.user_type === "job_seeker"
                        ? "باحث عن عمل"
                        : profile.user_type === "employer"
                          ? "صاحب عمل"
                          : "مسؤول"
                    }
                    disabled
                    className="bg-muted"
                  />
                  <Badge variant="outline">{profile.user_type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">لا يمكن تغيير نوع الحساب</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">الاسم الكامل</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="اسمك الكامل"
                  value={profile.full_name || ""}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">السيرة الذاتية</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="أخبرنا عن نفسك..."
                  value={profile.bio || ""}
                  onChange={handleProfileChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Employer Specific Section */}
          {profile.user_type === "employer" && employerData && (
            <Card>
              <CardHeader>
                <CardTitle>معلومات الشركة</CardTitle>
                <CardDescription>بيانات شركتك وتفاصيلها</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>لوجو الشركة</Label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCompanyLogoUpload}
                          disabled={isUploadingLogo}
                          className="hidden"
                          id="company-logo-input"
                        />
                        <label htmlFor="company-logo-input" className="cursor-pointer block">
                          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {isUploadingLogo ? "جاري الرفع..." : "اضغط لرفع اللوجو"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG أو GIF</p>
                        </label>
                      </div>
                    </div>
                    {companyLogoPreview && (
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <img
                          src={companyLogoPreview || "/placeholder.svg"}
                          alt="Company logo preview"
                          className="w-full h-full object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("logo")}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">اسم الشركة *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    placeholder="اسم شركتك"
                    value={employerData.company_name || ""}
                    onChange={handleEmployerChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_website">موقع الويب</Label>
                  <Input
                    id="company_website"
                    name="company_website"
                    placeholder="https://example.com"
                    value={employerData.company_website || ""}
                    onChange={handleEmployerChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_description">وصف الشركة</Label>
                  <Textarea
                    id="company_description"
                    name="company_description"
                    placeholder="أخبرنا عن شركتك..."
                    value={employerData.company_description || ""}
                    onChange={handleEmployerChange}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">الصناعة</Label>
                    <Input
                      id="industry"
                      name="industry"
                      placeholder="مثال: التكنولوجيا، التمويل"
                      value={employerData.industry || ""}
                      onChange={handleEmployerChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_size">حجم الشركة</Label>
                    <Input
                      id="company_size"
                      name="company_size"
                      placeholder="مثال: 50-100 موظف"
                      value={employerData.company_size || ""}
                      onChange={handleEmployerChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">الموقع</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="المدينة والدولة"
                    value={employerData.location || ""}
                    onChange={handleEmployerChange}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Seeker Specific Section */}
          {profile.user_type === "job_seeker" && jobSeekerData && (
            <Card>
              <CardHeader>
                <CardTitle>معلومات الخبرة والمهارات</CardTitle>
                <CardDescription>بيانات خبرتك ومهاراتك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>صورة الملف الشخصي</Label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          disabled={isUploadingImage}
                          className="hidden"
                          id="profile-image-input"
                        />
                        <label htmlFor="profile-image-input" className="cursor-pointer block">
                          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {isUploadingImage ? "جاري الرفع..." : "اضغط لرفع الصورة"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG أو GIF</p>
                        </label>
                      </div>
                    </div>
                    {profileImagePreview && (
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <img
                          src={profileImagePreview || "/placeholder.svg"}
                          alt="Profile image preview"
                          className="w-full h-full object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("profile")}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_years">سنوات الخبرة</Label>
                  <Input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    min="0"
                    max="70"
                    placeholder="عدد سنوات الخبرة"
                    value={jobSeekerData.experience_years || ""}
                    onChange={handleJobSeekerChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">الموقع</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="المدينة والدولة"
                    value={jobSeekerData.location || ""}
                    onChange={handleJobSeekerChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={jobSeekerData.is_available}
                      onChange={handleJobSeekerChange}
                      className="w-4 h-4"
                    />
                    متاح للعمل الآن
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {jobSeekerData.is_available ? "أنت متاح للعمل" : "أنت غير متاح للعمل حالياً"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error and Success Messages */}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">تم تحديث الملف الشخصي بنجاح!</p>}

          {/* Submit Button */}
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </form>
      </div>
    </div>
  )
}

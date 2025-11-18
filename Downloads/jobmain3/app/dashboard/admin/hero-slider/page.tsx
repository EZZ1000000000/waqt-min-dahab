"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, GripVertical, Eye, EyeOff, Upload } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Slide {
  id: string
  title: string
  subtitle: string
  image_url: string
  button_text?: string
  button_link?: string
  order_index: number
  is_active: boolean
}

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Slide>>({})
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const { toast } = useToast()

  const supabase = getSupabaseClient()

  // Fetch slides
  useEffect(() => {
    fetchSlides()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Create a unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("photos").upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) throw error

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(filename)

      // Update form data with image URL
      setFormData({ ...formData, image_url: publicUrl })
      setImagePreview(publicUrl)

      toast({
        title: "نجح",
        description: "تم رفع الصورة بنجاح",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase.from("hero_slider").select("*").order("order_index", { ascending: true })

      if (error) throw error
      setSlides(data || [])
    } catch (error) {
      console.error("Error fetching slides:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل الشرائح",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlide = () => {
    setEditingId("new")
    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      button_text: "",
      button_link: "",
      order_index: slides.length,
      is_active: true,
    })
    setImagePreview("")
  }

  const handleSaveSlide = async () => {
    try {
      if (!formData.title || !formData.subtitle || !formData.image_url) {
        toast({
          title: "خطأ",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        })
        return
      }

      if (editingId === "new") {
        const { error } = await supabase.from("hero_slider").insert([formData])
        if (error) throw error
        toast({
          title: "نجح",
          description: "تم إضافة الشريحة بنجاح",
        })
      } else {
        const { error } = await supabase.from("hero_slider").update(formData).eq("id", editingId)
        if (error) throw error
        toast({
          title: "نجح",
          description: "تم تحديث الشريحة بنجاح",
        })
      }

      setEditingId(null)
      setFormData({})
      setImagePreview("")
      fetchSlides()
    } catch (error) {
      console.error("Error saving slide:", error)
      toast({
        title: "خطأ",
        description: "فشل في حفظ الشريحة",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSlide = async (id: string) => {
    try {
      const { error } = await supabase.from("hero_slider").delete().eq("id", id)
      if (error) throw error
      toast({
        title: "نجح",
        description: "تم حذف الشريحة بنجاح",
      })
      fetchSlides()
    } catch (error) {
      console.error("Error deleting slide:", error)
      toast({
        title: "خطأ",
        description: "فشل في حذف الشريحة",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("hero_slider").update({ is_active: !isActive }).eq("id", id)
      if (error) throw error
      fetchSlides()
    } catch (error) {
      console.error("Error toggling slide:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الشريحة",
        variant: "destructive",
      })
    }
  }

  const handleEditSlide = (slide: Slide) => {
    setEditingId(slide.id)
    setFormData(slide)
    setImagePreview(slide.image_url)
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">جاري التحميل...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة سلايدر البطل</h1>
          <p className="text-muted-foreground mt-2">إدارة الصور والنصوص في قسم البطل</p>
        </div>
        <Button onClick={handleAddSlide} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة شريحة جديدة
        </Button>
      </div>

      {/* Edit Form */}
      {editingId && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId === "new" ? "إضافة شريحة جديدة" : "تعديل الشريحة"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">العنوان الرئيسي</label>
              <Input
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="أدخل العنوان الرئيسي"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">النص الفرعي</label>
              <Textarea
                value={formData.subtitle || ""}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="أدخل النص الفرعي"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الصورة</label>
              <div className="space-y-3">
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button asChild disabled={uploading} className="gap-2 cursor-pointer">
                      <span>
                        <Upload className="w-4 h-4" />
                        {uploading ? "جاري الرفع..." : "رفع صورة"}
                      </span>
                    </Button>
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {formData.image_url ? "✓ تم اختيار صورة" : "لم يتم اختيار صورة"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">نص الزر (اختياري)</label>
                <Input
                  value={formData.button_text || ""}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="مثال: ابدأ الآن"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">رابط الزر (اختياري)</label>
                <Input
                  value={formData.button_link || ""}
                  onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                  placeholder="/auth/sign-up"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveSlide}>حفظ</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setFormData({})
                  setImagePreview("")
                }}
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Slides List */}
      <div className="space-y-4">
        {slides.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              لا توجد شرائح حالياً. أضف شريحة جديدة للبدء.
            </CardContent>
          </Card>
        ) : (
          slides.map((slide) => (
            <Card key={slide.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <GripVertical className="w-5 h-5 text-muted-foreground mt-1" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{slide.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{slide.subtitle}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>الترتيب: {slide.order_index}</span>
                          <span>•</span>
                          <span>الصورة: {slide.image_url.substring(0, 30)}...</span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(slide.id, slide.is_active)}>
                          {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditSlide(slide)}>
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

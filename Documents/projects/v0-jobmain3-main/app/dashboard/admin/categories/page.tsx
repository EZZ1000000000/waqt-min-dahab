"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Plus, Edit2 } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  description: string
  icon_url: string | null
  image_url: string | null
}

export default function CategoriesPage() {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", image_url: "" })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("job_categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("خطأ في تحميل الفئات")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      const formDataToSend = new FormData()
      formDataToSend.append("file", file)
      formDataToSend.append("folder", "categories")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      setFormData({ ...formData, image_url: data.url })
      toast.success("تم رفع الصورة بنجاح")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("خطأ في رفع الصورة")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم الفئة")
      return
    }

    try {
      const dataToSave = {
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        icon_url: formData.image_url, // Use same image as icon
      }

      if (editingId) {
        const { error } = await supabase.from("job_categories").update(dataToSave).eq("id", editingId)

        if (error) throw error
        toast.success("تم تحديث الفئة بنجاح")
      } else {
        const { error } = await supabase.from("job_categories").insert([dataToSave])

        if (error) throw error
        toast.success("تم إضافة الفئة بنجاح")
      }

      setFormData({ name: "", description: "", image_url: "" })
      setEditingId(null)
      setIsOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error("خطأ في حفظ الفئة")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return

    try {
      const { error } = await supabase.from("job_categories").delete().eq("id", id)

      if (error) throw error
      toast.success("تم حذف الفئة بنجاح")
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("خطأ في حذف الفئة")
    }
  }

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
    })
    setEditingId(category.id)
    setIsOpen(true)
  }

  const handleOpenDialog = () => {
    setFormData({ name: "", description: "", image_url: "" })
    setEditingId(null)
    setIsOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">إدارة فئات الوظائف</h1>
          <p className="text-muted-foreground mt-2">أضف وعدّل فئات الوظائف مع الصور</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة فئة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل الفئة" : "إضافة فئة جديدة"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">اسم الفئة</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: تكنولوجيا المعلومات"
                />
              </div>
              <div>
                <label className="text-sm font-medium">الوصف</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الفئة"
                />
              </div>
              <div>
                <label className="text-sm font-medium">صورة الفئة (تُستخدم كأيقونة وصورة)</label>
                <div className="space-y-2">
                  {formData.image_url && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={formData.image_url || "/placeholder.svg"}
                        alt="Category"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(file)
                          }
                        }}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                    </label>
                    {formData.image_url && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, image_url: "" })}
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={uploading}>
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">لا توجد فئات حالياً</p>
            <Button onClick={handleOpenDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة أول فئة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  {category.image_url && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={category.image_url || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)} className="gap-2">
                      <Edit2 className="w-4 h-4" />
                      تعديل
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)} className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

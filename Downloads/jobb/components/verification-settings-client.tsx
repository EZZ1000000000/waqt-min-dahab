"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { DollarSign, Phone, Clock } from "lucide-react"

interface VerificationSettingsClientProps {
  pricing: any
}

export function VerificationSettingsClient({ pricing }: VerificationSettingsClientProps) {
  const [formData, setFormData] = useState({
    service_name: pricing.service_name || "",
    price: pricing.price || 0,
    currency: pricing.currency || "EGP",
    duration_days: pricing.duration_days || 365,
    contact_phone: pricing.contact_phone || "",
    description: pricing.description || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "duration_days" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const { error } = await supabase
        .from("verification_pricing")
        .update({
          service_name: formData.service_name,
          price: formData.price,
          currency: formData.currency,
          duration_days: formData.duration_days,
          contact_phone: formData.contact_phone,
          description: formData.description,
        })
        .eq("id", pricing.id)

      if (error) throw error

      setMessage("تم تحديث الإعدادات بنجاح!")
      router.refresh()
    } catch (error) {
      console.error("Error updating settings:", error)
      setMessage("حدث خطأ أثناء تحديث الإعدادات")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="service_name">اسم الخدمة</Label>
          <Input
            id="service_name"
            name="service_name"
            value={formData.service_name}
            onChange={handleChange}
            placeholder="مثال: توثيق الشركة"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="price" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            السعر
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="currency">العملة</Label>
          <Input
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            placeholder="EGP"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="duration_days" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            مدة الخدمة (بالأيام)
          </Label>
          <Input
            id="duration_days"
            name="duration_days"
            type="number"
            value={formData.duration_days}
            onChange={handleChange}
            placeholder="365"
            className="mt-2"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="contact_phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            رقم التواصل
          </Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            placeholder="+20100000000"
            className="mt-2"
            dir="ltr"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">وصف الخدمة</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="وصف تفصيلي للخدمة..."
          className="mt-2"
          rows={4}
        />
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes("بنجاح") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        {isLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </Button>
    </form>
  )
}

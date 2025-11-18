"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, AlertCircle } from 'lucide-react'
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface AdminSetting {
  id: string
  setting_key: string
  setting_value: boolean
  description: string
}

export function SuperAdminDashboardClient() {
  const [settings, setSettings] = useState<AdminSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("admin_settings").select("*").order("setting_key")

      if (error) throw error
      setSettings(data || [])
    } catch (error) {
      console.error("[v0] Error fetching settings:", error)
      toast({
        title: "خطأ",
        description: "فشل تحميل الإعدادات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSetting = async (settingId: string, currentValue: boolean) => {
    try {
      setUpdating(settingId)
      const { error } = await supabase
        .from("admin_settings")
        .update({ setting_value: !currentValue })
        .eq("id", settingId)

      if (error) throw error

      setSettings(settings.map((s) => (s.id === settingId ? { ...s, setting_value: !currentValue } : s)))

      toast({
        title: "تم التحديث",
        description: "تم تحديث الإعداد بنجاح",
      })
    } catch (error) {
      console.error("[v0] Error updating setting:", error)
      toast({
        title: "خطأ",
        description: "فشل تحديث الإعداد",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const getSettingIcon = (key: string) => {
    if (key.includes("verification")) return <Shield className="w-5 h-5" />
    if (key.includes("alternative")) return <Zap className="w-5 h-5" />
    return <AlertCircle className="w-5 h-5" />
  }

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      show_verification_page: "صفحة إدارة التوثيق",
      show_alternative_jobs_page: "صفحة الوظائف البديلة",
    }
    return labels[key] || key
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            إدارة الميزات
          </CardTitle>
          <CardDescription>تحكم في ظهور الميزات المختلفة في لوحة تحكم المسؤول</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-slate-600">{getSettingIcon(setting.setting_key)}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{getSettingLabel(setting.setting_key)}</h3>
                    <p className="text-sm text-slate-600">{setting.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={setting.setting_value ? "default" : "secondary"}
                    className={setting.setting_value ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}
                  >
                    {setting.setting_value ? "مفعل" : "معطل"}
                  </Badge>
                  <Button
                    onClick={() => toggleSetting(setting.id, setting.setting_value)}
                    disabled={updating === setting.id}
                    variant="outline"
                    size="sm"
                    className="min-w-24"
                  >
                    {updating === setting.id ? "جاري..." : setting.setting_value ? "تعطيل" : "تفعيل"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            ملاحظة مهمة
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p>تعطيل أي ميزة سيخفيها من لوحة تحكم المسؤول العادي، لكن البيانات ستبقى محفوظة في قاعدة البيانات.</p>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, FileText, LayoutGrid, ImageIcon, Home, Shield, Settings, Zap, Crown } from 'lucide-react'
import { getSupabaseClient } from "@/lib/supabase/client"

export function AdminNav() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showVerification, setShowVerification] = useState(true)
  const [showAlternativeJobs, setShowAlternativeJobs] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const supabase = getSupabaseClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

          const isSuperAdminUser = profile?.user_type === "super_admin"
          const isAdminUser = profile?.user_type === "admin" || isSuperAdminUser

          setIsAdmin(isAdminUser)
          setIsSuperAdmin(isSuperAdminUser)

          if (isAdminUser) {
            const { data: settings } = await supabase.from("admin_settings").select("setting_key, setting_value")

            if (settings) {
              const verificationSetting = settings.find((s) => s.setting_key === "show_verification_page")
              const alternativeJobsSetting = settings.find((s) => s.setting_key === "show_alternative_jobs_page")

              setShowVerification(verificationSetting?.setting_value ?? true)
              setShowAlternativeJobs(alternativeJobsSetting?.setting_value ?? true)
            }
          }
        }
      } catch (error) {
        console.error("Error checking admin role:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminRole()
  }, [])

  const adminPages = [
    {
      label: "لوحة التحكم",
      href: "/dashboard/admin",
      icon: Home,
      show: true,
    },
    {
      label: "المستخدمين",
      href: "/dashboard/admin/users",
      icon: Users,
      show: true,
    },
    {
      label: "الوظائف",
      href: "/dashboard/admin/jobs",
      icon: Briefcase,
      show: true,
    },
    {
      label: "الطلبات",
      href: "/dashboard/admin/applications",
      icon: FileText,
      show: true,
    },
    {
      label: "الفئات",
      href: "/dashboard/admin/categories",
      icon: LayoutGrid,
      show: true,
    },
    {
      label: "صور البطل",
      href: "/dashboard/admin/hero-slider",
      icon: ImageIcon,
      show: true,
    },
    {
      label: "التوثيق",
      href: "/dashboard/admin/verification",
      icon: Shield,
      show: showVerification,
    },
    {
      label: "إعدادات التوثيق",
      href: "/dashboard/admin/verification-settings",
      icon: Settings,
      show: showVerification,
    },
    {
      label: "الوظائف البديلة",
      href: "/dashboard/admin/alternative-jobs",
      icon: Zap,
      show: showAlternativeJobs,
    },
    {
      label: "إعدادات النظام",
      href: "/dashboard/super-admin",
      icon: Crown,
      show: isSuperAdmin,
    },
  ]

  if (loading) {
    return null
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-sm font-semibold text-foreground mb-3">صفحات الإدارة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {adminPages
            .filter((page) => page.show)
            .map((page) => {
              const Icon = page.icon
              return (
                <Link key={page.href} href={page.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-auto flex flex-col items-center gap-1 py-2 bg-transparent"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs text-center">{page.label}</span>
                  </Button>
                </Link>
              )
            })}
        </div>
      </div>
    </div>
  )
}

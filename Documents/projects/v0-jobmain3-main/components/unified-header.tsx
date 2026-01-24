"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X, Briefcase, FileText, User, Building2, BarChart3, Bell, Heart } from 'lucide-react'
import { NotificationsBell } from "@/components/notifications-bell"

export function UnifiedHeader() {
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        setUser(userData.user)

        if (userData.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", userData.user.id)
            .single()
          setUserType(profile?.user_type || null)
        }
      } catch (error) {
        console.error("[v0] Error checking user:", error)
        setUser(null)
        setUserType(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (event === "SIGNED_OUT") {
        setIsMobileMenuOpen(false)
        setUserType(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsMobileMenuOpen(false)
    router.push("/")
  }

  const isActive = (path: string) => pathname.startsWith(path)
  const isDashboard = pathname.startsWith("/dashboard")

  const isDashboardPage = isDashboard
  const headerBg = isDashboardPage
    ? "bg-gradient-to-r from-blue-900 to-blue-800 text-white"
    : "bg-white/80 backdrop-blur-md border-b border-border"

  return (
    <header className={`sticky top-0 z-50 ${headerBg} shadow-lg`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className={`text-2xl font-bold shrink-0 transition-colors ${
            isDashboardPage ? "text-white hover:text-blue-100" : "text-primary hover:text-primary/80"
          }`}
        >
          باب رزق
        </Link>

        {/* Desktop Navigation */}
        <div className={`hidden md:flex items-center gap-1 ${isDashboardPage ? "overflow-x-auto" : "gap-3"}`}>
          {isLoading ? (
            <div className="w-20 h-10 bg-muted rounded animate-pulse" />
          ) : user ? (
            <>
              {isDashboardPage && userType === "job_seeker" && (
                <>
                  <Link href="/dashboard/jobs">
                    <Button
                      variant={isActive("/dashboard/jobs") ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${
                        isActive("/dashboard/jobs") ? "bg-blue-600" : "text-white hover:bg-blue-700"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span className="hidden sm:inline">الوظائف</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/saved-jobs">
                    <Button
                      variant={isActive("/dashboard/saved-jobs") ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${
                        isActive("/dashboard/saved-jobs") ? "bg-blue-600" : "text-white hover:bg-blue-700"
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="hidden sm:inline">المحفوظة</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/applications">
                    <Button
                      variant={isActive("/dashboard/applications") ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${
                        isActive("/dashboard/applications") ? "bg-blue-600" : "text-white hover:bg-blue-700"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">طلباتي</span>
                    </Button>
                  </Link>
                </>
              )}

              {isDashboardPage && userType === "employer" && (
                <>
                  <Link href="/dashboard/employer/jobs">
                    <Button
                      variant={isActive("/dashboard/employer/jobs") ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${
                        isActive("/dashboard/employer/jobs") ? "bg-blue-600" : "text-white hover:bg-blue-700"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span className="hidden sm:inline">وظائفي</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/employer/jobs/new">
                    <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-blue-700">
                      <Building2 className="w-4 h-4" />
                      <span className="hidden sm:inline">نشر وظيفة</span>
                    </Button>
                  </Link>
                </>
              )}

              {isDashboardPage && userType === "admin" && (
                <>
                  <Link href="/dashboard/admin">
                    <Button
                      variant={isActive("/dashboard/admin") ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${
                        isActive("/dashboard/admin") ? "bg-blue-600" : "text-white hover:bg-blue-700"
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">لوحة التحكم</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/users">
                    <Button
                      variant={isActive("/dashboard/admin/users") ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${
                        isActive("/dashboard/admin/users") ? "bg-blue-600" : "text-white hover:bg-blue-700"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">المستخدمون</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/jobs">
                    <Button
                      variant={isActive("/dashboard/admin/jobs") ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${
                        isActive("/dashboard/admin/jobs") ? "bg-blue-600" : "text-white hover:bg-blue-700"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span className="hidden sm:inline">الوظائف</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/applications">
                    <Button
                      variant={isActive("/dashboard/admin/applications") ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${
                        isActive("/dashboard/admin/applications") ? "bg-blue-600" : "text-white hover:bg-blue-700"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">الطلبات</span>
                    </Button>
                  </Link>
                </>
              )}

              {isDashboardPage && (
                <>
                  <Link href="/dashboard/notifications">
                    <Button
                      variant={isActive("/dashboard/notifications") ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${
                        isActive("/dashboard/notifications") ? "bg-blue-600" : "text-white hover:bg-blue-700"
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                      <span className="hidden sm:inline">الإشعارات</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button
                      variant={isActive("/dashboard/profile") ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${
                        isActive("/dashboard/profile") ? "bg-blue-600" : "text-white hover:bg-blue-700"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">الملف الشخصي</span>
                    </Button>
                  </Link>
                  <NotificationsBell />
                </>
              )}

              {!isDashboardPage && (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline">لوحة التحكم</Button>
                  </Link>
                </>
              )}

              <Button
                variant={isDashboardPage ? "ghost" : "ghost"}
                size={isDashboardPage ? "sm" : "sm"}
                onClick={handleLogout}
                className={`gap-2 ${isDashboardPage ? "text-white hover:bg-red-600 transition-colors" : ""}`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant={isDashboardPage ? "ghost" : "ghost"}>دخول</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>إنشاء حساب</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
          {isMobileMenuOpen ? (
            <X className={`w-6 h-6 ${isDashboardPage ? "text-white" : ""}`} />
          ) : (
            <Menu className={`w-6 h-6 ${isDashboardPage ? "text-white" : ""}`} />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-t ${isDashboardPage ? "bg-blue-800" : "bg-background"}`}>
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {isLoading ? (
              <div className="w-full h-10 bg-muted rounded animate-pulse" />
            ) : user ? (
              <>
                {isDashboardPage && userType === "job_seeker" && (
                  <>
                    <Link href="/dashboard/jobs" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive("/dashboard/jobs") ? "default" : "ghost"}
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        الوظائف
                      </Button>
                    </Link>
                    <Link href="/dashboard/saved-jobs" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive("/dashboard/saved-jobs") ? "default" : "ghost"}
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                        المحفوظة
                      </Button>
                    </Link>
                    <Link href="/dashboard/applications" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive("/dashboard/applications") ? "default" : "ghost"}
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        طلباتي
                      </Button>
                    </Link>
                  </>
                )}

                {isDashboardPage && userType === "employer" && (
                  <>
                    <Link href="/dashboard/employer/jobs" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive("/dashboard/employer/jobs") ? "default" : "ghost"}
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        وظائفي
                      </Button>
                    </Link>
                    <Link href="/dashboard/employer/jobs/new" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        نشر وظيفة
                      </Button>
                    </Link>
                  </>
                )}

                {isDashboardPage && userType === "admin" && (
                  <>
                    <Link href="/dashboard/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive("/dashboard/admin") ? "default" : "ghost"}
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <BarChart3 className="w-4 h-4" />
                        لوحة التحكم
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/users" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive("/dashboard/admin/users") ? "default" : "ghost"}
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <User className="w-4 h-4" />
                        المستخدمون
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/jobs" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive("/dashboard/admin/jobs") ? "default" : "ghost"}
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        الوظائف
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/applications" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive("/dashboard/admin/applications") ? "default" : "ghost"}
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        الطلبات
                      </Button>
                    </Link>
                  </>
                )}

                {isDashboardPage && (
                  <>
                    <Link href="/dashboard/notifications" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive("/dashboard/notifications") ? "default" : "ghost"}
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                        الإشعارات
                      </Button>
                    </Link>
                    <Link href="/dashboard/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive("/dashboard/profile") ? "default" : "ghost"}
                        className={`w-full gap-2 ${
                          isDashboardPage ? "text-white hover:bg-blue-700" : "bg-transparent"
                        }`}
                      >
                        <User className="w-4 h-4" />
                        الملف الشخصي
                      </Button>
                    </Link>
                  </>
                )}

                {!isDashboardPage && (
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      لوحة التحكم
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={`w-full gap-2 justify-start ${isDashboardPage ? "text-white hover:bg-red-600" : ""}`}
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    دخول
                  </Button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">إنشاء حساب</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

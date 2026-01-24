"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Briefcase, DollarSign, Heart, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  jobType: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  description: string
  isSaved?: boolean
  onSave?: (jobId: string) => void
  onApply?: (jobId: string) => void
  imageUrl?: string
  companyLogo?: string
  isVerified?: boolean
}

export function JobCard({
  id,
  title,
  company,
  location,
  jobType,
  salaryMin,
  salaryMax,
  currency = "USD",
  description,
  isSaved = false,
  onSave,
  onApply,
  imageUrl,
  companyLogo,
  isVerified = false,
}: JobCardProps) {
  const [user, setUser] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleApplyClick = async () => {
    setIsCheckingAuth(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push(`/auth/login?redirect=/jobs/${id}/apply`)
      } else {
        router.push(`/dashboard/jobs/${id}/apply`)
      }
    } catch (error) {
      console.error("[v0] Auth check error:", error)
      router.push(`/auth/login?redirect=/jobs/${id}/apply`)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 overflow-hidden group">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      {imageUrl && (
        <div className="w-full h-48 bg-muted overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg text-slate-900 mb-2">{title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {companyLogo && (
                <div className="w-6 h-6 bg-white rounded border border-border overflow-hidden flex-shrink-0">
                  <img src={companyLogo || "/placeholder.svg"} alt={company} className="w-full h-full object-cover" />
                </div>
              )}
              <CardDescription className="text-blue-600 font-medium">{company}</CardDescription>
              {isVerified && (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1 ml-1">
                  <Shield className="w-3 h-3" />
                  موثوق
                </Badge>
              )}
            </div>
          </div>
          {onSave && (
            <button
              onClick={() => onSave(id)}
              className="shrink-0 p-2 hover:bg-white rounded-lg transition-colors"
              aria-label={isSaved ? "Remove from saved" : "Save job"}
            >
              <Heart
                className={`w-5 h-5 ${isSaved ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500"}`}
              />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap gap-2">
          <Badge className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
            <MapPin className="w-3 h-3" />
            {location}
          </Badge>
          <Badge className="flex items-center gap-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
            <Briefcase className="w-3 h-3" />
            {jobType}
          </Badge>
          {salaryMin && salaryMax && (
            <Badge className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200">
              <DollarSign className="w-3 h-3" />
              {salaryMin.toLocaleString()} - {salaryMax.toLocaleString()} {currency}
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/jobs/${id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-white border-slate-200 text-slate-900 hover:bg-slate-50">
              عرض التفاصيل
            </Button>
          </Link>
          {onApply && (
            <Button
              onClick={handleApplyClick}
              disabled={isCheckingAuth}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isCheckingAuth ? "جاري..." : "تقديم الطلب"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

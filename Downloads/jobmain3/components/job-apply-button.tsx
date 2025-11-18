"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface JobApplyButtonProps {
  jobId: string
  className?: string
}

export function JobApplyButton({ jobId, className }: JobApplyButtonProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        setUser(userData.user)
      } catch (error) {
        console.error("[v0] Error checking user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleApply = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/jobs/${jobId}/apply`)
    } else {
      router.push(`/dashboard/jobs/${jobId}/apply`)
    }
  }

  return (
    <Button
      onClick={handleApply}
      disabled={isLoading}
      className={`w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg ${className}`}
    >
      {isLoading ? "جاري التحقق..." : "تقديم الطلب"}
    </Button>
  )
}

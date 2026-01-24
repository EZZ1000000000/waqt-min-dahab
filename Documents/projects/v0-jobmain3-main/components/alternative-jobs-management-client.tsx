"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { Send, AlertCircle } from "lucide-react"

interface RejectedApplication {
  id: string
  job_seeker_id: string
  job_id: string
  status: string
  created_at: string
  job_seekers: {
    id: string
    full_name: string
    email: string
  }
  jobs: {
    id: string
    title: string
    category: string
    employers: {
      company_name: string
    }
  }
}

interface AlternativeJob {
  id: string
  job_seeker_id: string
  job_id: string
  reason: string
  created_at: string
  job_seekers: {
    id: string
    full_name: string
    email: string
  }
  jobs: {
    id: string
    title: string
    category: string
    employers: {
      company_name: string
    }
  }
}

interface AlternativeJobsManagementClientProps {
  rejectedApplications: RejectedApplication[]
  alternativeJobs: AlternativeJob[]
}

export function AlternativeJobsManagementClient({
  rejectedApplications,
  alternativeJobs,
}: AlternativeJobsManagementClientProps) {
  const [selectedSeeker, setSelectedSeeker] = useState<string>("")
  const [availableJobs, setAvailableJobs] = useState<any[]>([])
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const supabase = createClient()

  // Get unique rejected seekers
  const uniqueSeekers = Array.from(new Map(rejectedApplications.map((app) => [app.job_seeker_id, app])).values())

  useEffect(() => {
    if (selectedSeeker) {
      fetchAvailableJobs()
    }
  }, [selectedSeeker])

  const fetchAvailableJobs = async () => {
    try {
      const selectedApp = rejectedApplications.find((app) => app.job_seeker_id === selectedSeeker)
      if (!selectedApp) return

      // Get the category of the rejected job
      const rejectedCategory = selectedApp.jobs.category

      // Fetch jobs in the same category that haven't been sent to this seeker
      const { data: jobs, error } = await supabase
        .from("jobs")
        .select("*, employers(company_name)")
        .eq("category", rejectedCategory)
        .eq("status", "active")
        .order("posted_at", { ascending: false })

      if (error) throw error

      // Filter out jobs already sent as alternatives
      const sentJobIds = alternativeJobs.filter((alt) => alt.job_seeker_id === selectedSeeker).map((alt) => alt.job_id)

      const filtered = jobs?.filter((job) => !sentJobIds.includes(job.id)) || []
      setAvailableJobs(filtered)
      setSelectedJobs([])
    } catch (error) {
      console.error("Error fetching available jobs:", error)
    }
  }

  const handleJobToggle = (jobId: string) => {
    setSelectedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  const handleSendAlternatives = async () => {
    if (!selectedSeeker || selectedJobs.length === 0) {
      setMessage("يرجى اختيار مرشح ووظائف بديلة")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const alternativesToInsert = selectedJobs.map((jobId) => ({
        job_seeker_id: selectedSeeker,
        job_id: jobId,
        reason: "alternative_suggestion",
      }))

      const { error } = await supabase.from("alternative_jobs").insert(alternativesToInsert)

      if (error) throw error

      setMessage("تم إرسال الوظائف البديلة بنجاح!")
      setSelectedSeeker("")
      setSelectedJobs([])
      setAvailableJobs([])
      router.refresh()
    } catch (error) {
      console.error("Error sending alternatives:", error)
      setMessage("حدث خطأ أثناء إرسال الوظائف البديلة")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">اختر المرشح المرفوض</label>
        <Select value={selectedSeeker} onValueChange={setSelectedSeeker}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="اختر مرشح..." />
          </SelectTrigger>
          <SelectContent>
            {uniqueSeekers.map((app) => (
              <SelectItem key={app.job_seeker_id} value={app.job_seeker_id}>
                <div className="flex items-center gap-2">
                  <span>{app.job_seekers.full_name}</span>
                  <span className="text-xs text-muted-foreground">({app.job_seekers.email})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSeeker && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-medium">الوظائف المتاحة من نفس المجال</h3>
            <Badge variant="outline">{availableJobs.length}</Badge>
          </div>

          {availableJobs.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">لا توجد وظائف متاحة من نفس المجال</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableJobs.map((job) => (
                <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={job.id}
                        checked={selectedJobs.includes(job.id)}
                        onCheckedChange={() => handleJobToggle(job.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <label htmlFor={job.id} className="font-medium cursor-pointer block">
                          {job.title}
                        </label>
                        <p className="text-sm text-muted-foreground">{job.employers.company_name}</p>
                        <Badge variant="outline" className="mt-2">
                          {job.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

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
        onClick={handleSendAlternatives}
        disabled={isLoading || !selectedSeeker || selectedJobs.length === 0}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
        {isLoading ? "جاري الإرسال..." : `إرسال ${selectedJobs.length} وظيفة بديلة`}
      </Button>
    </div>
  )
}

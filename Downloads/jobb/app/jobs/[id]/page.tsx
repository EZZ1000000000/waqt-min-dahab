import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { MapPin, DollarSign, Clock, Briefcase, ArrowRight, CheckCircle2, Calendar, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { JobApplyButton } from "@/components/job-apply-button"

export const dynamic = "force-dynamic"

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      *,
      employers(company_name, company_description, company_logo_url, location, verified)
    `)
    .eq("id", id)
    .single()

  if (error || !job) {
    notFound()
  }

  const { data: verificationData } = await supabase
    .from("verification_services")
    .select("status")
    .eq("employer_id", job.employer_id)
    .eq("status", "active")
    .maybeSingle()

  const isCompanyVerified = !!verificationData

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/jobs"
          className="text-blue-600 hover:text-blue-700 hover:underline mb-6 inline-flex items-center gap-2 font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للوظائف
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {job.image_url && (
              <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
                <img src={job.image_url || "/placeholder.svg"} alt={job.title} className="w-full h-96 object-cover" />
              </div>
            )}

            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {job.employers?.company_logo_url && (
                        <div className="w-8 h-8 bg-white rounded border border-border overflow-hidden flex-shrink-0">
                          <img
                            src={job.employers.company_logo_url || "/placeholder.svg"}
                            alt={job.employers.company_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardTitle className="text-4xl text-slate-900">{job.title}</CardTitle>
                      {isCompanyVerified && (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          موثوق
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg text-blue-600 font-semibold">{job.employers?.company_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">الموقع</p>
                        <span className="font-semibold text-slate-900">{job.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">نوع الوظيفة</p>
                        <span className="font-semibold text-slate-900">{job.job_type}</span>
                      </div>
                    </div>
                    {job.salary_min && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الراتب</p>
                          <span className="font-semibold text-slate-900">
                            {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()} {job.currency}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">نوع العمل</p>
                        <span className="font-semibold text-slate-900">{job.remote_type}</span>
                      </div>
                    </div>
                    {job.deadline && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">آخر موعد</p>
                          <span className="font-semibold text-slate-900">
                            {new Date(job.deadline).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <CardTitle className="text-slate-900">وصف الوظيفة</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>

            {job.requirements && job.requirements.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <CardTitle className="text-slate-900">المتطلبات</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {job.requirements.map((req: string, idx: number) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-orange-400 to-red-500" />
              <CardHeader className="bg-gradient-to-br from-orange-50 to-red-50">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  معلومات الشركة
                  {isCompanyVerified && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      موثوق
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {job.employers?.company_logo_url && (
                  <img
                    src={job.employers.company_logo_url || "/placeholder.svg"}
                    alt={job.employers.company_name}
                    className="w-full h-32 object-cover rounded-lg border border-slate-200"
                  />
                )}
                <div>
                  <p className="font-bold text-slate-900 mb-2">{job.employers?.company_name}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{job.employers?.company_description}</p>
                </div>
              </CardContent>
            </Card>

            <JobApplyButton jobId={job.id} />
          </div>
        </div>
      </div>
    </main>
  )
}

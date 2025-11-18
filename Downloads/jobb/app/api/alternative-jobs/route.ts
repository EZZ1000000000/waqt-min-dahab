import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: jobSeeker } = await supabase
      .from("job_seekers")
      .select("id, skills")
      .eq("id", userData.user.id)
      .single()

    if (!jobSeeker) {
      return NextResponse.json({ error: "Job seeker profile not found" }, { status: 404 })
    }

    // Get alternative jobs (saved jobs with recommendations)
    const { data: alternatives, error } = await supabase
      .from("alternative_jobs")
      .select("*, jobs(*, employers(company_name))")
      .eq("job_seeker_id", jobSeeker.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(alternatives)
  } catch (error) {
    console.error("Error fetching alternative jobs:", error)
    return NextResponse.json({ error: "Failed to fetch alternative jobs" }, { status: 500 })
  }
}

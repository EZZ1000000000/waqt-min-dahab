import { redirect } from "next/navigation"

export default async function DashboardJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/jobs/${id}`)
}

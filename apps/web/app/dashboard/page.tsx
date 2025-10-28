import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { DashboardContent } from "./dashboard-content"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/dashboard")
  }

  const user = await getSessionUser(sessionId)

  if (!user) {
    redirect("/login?redirect=/dashboard")
  }

  return <DashboardContent user={user} />
}

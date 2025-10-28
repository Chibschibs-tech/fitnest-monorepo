import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { PausedSubscriptionsContent } from "./paused-subscriptions-content"

export const dynamic = "force-dynamic"

export default async function PausedSubscriptionsPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/admin/subscriptions/paused")
  }

  const user = await getSessionUser(sessionId)

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/subscriptions/paused")
  }

  return <PausedSubscriptionsContent />
}

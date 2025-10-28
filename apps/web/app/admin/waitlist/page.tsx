import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { WaitlistDataTable } from "./waitlist-data-table"

export const dynamic = "force-dynamic"

export default async function AdminWaitlistPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/admin/waitlist")
  }

  const user = await getSessionUser(sessionId)

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/waitlist")
  }

  return <WaitlistDataTable />
}

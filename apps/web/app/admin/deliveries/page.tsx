import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import DeliveriesContent from "./deliveries-content"

export const dynamic = "force-dynamic"

export default async function DeliveriesPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/admin/deliveries")
  }

  const user = await getSessionUser(sessionId)

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/deliveries")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Delivery Management</h1>
        <p className="text-gray-600">Track and manage meal deliveries</p>
      </div>
      <DeliveriesContent />
    </div>
  )
}

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import SnacksContent from "./snacks-content"

export const dynamic = "force-dynamic"

export default async function SnacksPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/admin/products/snacks")
  }

  const user = await getSessionUser(sessionId)

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/products/snacks")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Snacks & Supplements</h1>
        <p className="text-gray-600">Manage protein bars, supplements, and healthy snacks</p>
      </div>
      <SnacksContent />
    </div>
  )
}

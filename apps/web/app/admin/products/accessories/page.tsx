import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import AccessoriesContent from "./accessories-content"

export const dynamic = "force-dynamic"

export default async function AccessoriesPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/admin/products/accessories")
  }

  const user = await getSessionUser(sessionId)

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/products/accessories")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Accessories</h1>
        <p className="text-gray-600">Manage fitness accessories, bags, bottles, and apparel</p>
      </div>
      <AccessoriesContent />
    </div>
  )
}

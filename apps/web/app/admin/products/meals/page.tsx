import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import MealsContent from "./meals-content"

export const dynamic = "force-dynamic"

export default async function MealsPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/admin/products/meals")
  }

  const user = await getSessionUser(sessionId)

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/products/meals")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Meal Management</h1>
        <p className="text-gray-600">Manage your meal offerings and nutrition information</p>
      </div>
      <MealsContent />
    </div>
  )
}

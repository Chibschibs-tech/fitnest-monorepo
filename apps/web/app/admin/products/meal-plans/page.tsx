import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import MealPlansContent from "./meal-plans-content"

export const dynamic = "force-dynamic"

export default async function MealPlansPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/admin/products/meal-plans")
  }

  const user = await getSessionUser(sessionId)

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/products/meal-plans")
  }

  return (
    <div className="container mx-auto p-6">
      <MealPlansContent />
    </div>
  )
}

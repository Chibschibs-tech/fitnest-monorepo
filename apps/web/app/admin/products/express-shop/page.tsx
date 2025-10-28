import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import ExpressShopContent from "./express-shop-content"

export const dynamic = "force-dynamic"

export default async function ExpressShopPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/admin/products/express-shop")
  }

  const user = await getSessionUser(sessionId)

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/products/express-shop")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Express Shop Products</h1>
        <p className="text-gray-600">Manage products available for immediate purchase</p>
      </div>
      <ExpressShopContent />
    </div>
  )
}

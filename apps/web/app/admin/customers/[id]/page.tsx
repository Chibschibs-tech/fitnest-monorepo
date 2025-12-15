import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import CustomerDetailContent from "./customer-detail-content"

export const dynamic = "force-dynamic"

interface PageProps {
  params: {
    id: string
  }
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/admin/customers")
  }

  const user = await getSessionUser(sessionId)

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/customers")
  }

  // Validate that ID is numeric
  const customerId = params.id
  if (isNaN(Number(customerId)) && customerId !== "new") {
    // Invalid ID - redirect to customers list
    redirect("/admin/customers")
  }

  return (
    <div className="container mx-auto p-6">
      <CustomerDetailContent customerId={customerId} />
    </div>
  )
}

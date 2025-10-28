import { redirect } from "next/navigation"
import { OrderDetailContent } from "./order-detail-content"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const sessionId = cookies().get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/dashboard/orders/" + params.id)
  }

  return <OrderDetailContent orderId={params.id} />
}

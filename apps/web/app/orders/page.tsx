import { OrdersContent } from "./orders-content"

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic"

export default function OrdersPage() {
  return <OrdersContent />
}

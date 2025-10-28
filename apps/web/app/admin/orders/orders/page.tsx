import { Suspense } from "react"
import OrdersContent from "./orders-content"

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading orders...</div>}>
        <OrdersContent />
      </Suspense>
    </div>
  )
}

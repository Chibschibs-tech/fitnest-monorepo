import { Suspense } from "react"
import SubscriptionsContent from "./subscriptions-content"

export default function SubscriptionsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading subscriptions...</div>}>
        <SubscriptionsContent />
      </Suspense>
    </div>
  )
}

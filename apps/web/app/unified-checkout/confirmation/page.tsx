import type { Metadata } from "next"
import { ConfirmationContent } from "./confirmation-content"

export const metadata: Metadata = {
  title: "Order Confirmation | Fitnest.ma",
  description: "Your order has been successfully placed.",
}

export default function ConfirmationPage() {
  return <ConfirmationContent />
}

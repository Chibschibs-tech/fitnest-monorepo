import { redirect } from "next/navigation"

export default function OrderPage({
  searchParams,
}: {
  searchParams?: { plan?: string }
}) {
  const plan = searchParams?.plan
  redirect(plan ? `/compose-ton-plan?plan=${encodeURIComponent(plan)}` : "/compose-ton-plan")
}

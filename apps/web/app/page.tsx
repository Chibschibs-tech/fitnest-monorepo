import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default function RootHome() {
  // Redirect to waitlist while website is under development
  // Home page remains accessible at /home
  redirect("/waitlist")
}

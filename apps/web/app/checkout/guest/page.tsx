import { redirect } from "next/navigation"

// Guest checkout closed by founder decision D-052 (2026-09-08);
// customer identity moves to phone+OTP (slice 001).
export default function GuestCheckoutOptionsPage() {
  redirect("/checkout")
}

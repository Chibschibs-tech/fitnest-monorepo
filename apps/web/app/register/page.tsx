import { redirect } from "next/navigation"

// Legacy registration closed by founder decision D-052 (2026-09-08);
// customer identity moves to phone+OTP (slice 001).
export default function RegisterPage() {
  redirect("/login")
}

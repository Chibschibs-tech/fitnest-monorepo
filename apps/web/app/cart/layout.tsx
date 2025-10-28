import type React from "react"
export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="cart-layout">{children}</div>
}

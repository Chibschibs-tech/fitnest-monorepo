"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function CartInitializer() {
  const [initialized, setInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initializeCart = async () => {
      try {
        const response = await fetch("/api/init-cart-table")

        if (!response.ok) {
          throw new Error("Failed to initialize cart")
        }

        const data = await response.json()
        console.log("Cart initialization:", data)

        if (data.success) {
          setInitialized(true)
        } else {
          throw new Error(data.error || "Unknown error initializing cart")
        }
      } catch (error) {
        console.error("Error initializing cart:", error)
        toast({
          variant: "destructive",
          title: "Cart Initialization Error",
          description: error instanceof Error ? error.message : "Failed to initialize cart",
        })
      }
    }

    initializeCart()
  }, [toast])

  // This component doesn't render anything visible
  return null
}

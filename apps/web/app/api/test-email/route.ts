export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sendWelcomeEmail, sendOrderConfirmationEmail, sendDeliveryUpdateEmail } from "@/lib/email-utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, email, name } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let result

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail(email, name)
        break

      case "order_confirmation":
        // Mock order data for testing
        const mockOrderData = {
          id: "TEST-" + Math.floor(Math.random() * 10000),
          customer: {
            name,
            email,
            firstName: name.split(" ")[0],
          },
          items: [
            {
              name: "Healthy Meal Plan - 1 Week",
              quantity: 1,
              price: 349.99,
            },
            {
              name: "Protein Bar Sampler",
              quantity: 2,
              price: 59.99,
            },
          ],
          subtotal: 469.97,
          shipping: 0,
          total: 469.97,
          shipping: {
            address: "123 Test Street, Casablanca, Morocco",
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          },
        }

        result = await sendOrderConfirmationEmail(mockOrderData)
        break

      case "delivery_update":
        // Mock delivery data for testing
        const mockDeliveryData = {
          id: "TEST-" + Math.floor(Math.random() * 10000),
          customer: {
            name,
            email,
            firstName: name.split(" ")[0],
          },
          shipping: {
            address: "123 Test Street, Casablanca, Morocco",
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          },
        }

        result = await sendDeliveryUpdateEmail(mockDeliveryData)
        break

      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type.replace("_", " ")} email sent successfully`,
        messageId: result.messageId,
      })
    } else {
      console.error(`Failed to send ${type} email:`, result.error)
      return NextResponse.json(
        {
          error: `Failed to send ${type} email: ${result.error}`,
          details: result.details,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Test email sending error:", error)
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

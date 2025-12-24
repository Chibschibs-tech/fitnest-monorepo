import { NextResponse } from "next/server"
import { checkEmailConfig, sendWaitlistConfirmationEmail, sendWaitlistAdminNotification } from "@/lib/email-utils"

export async function GET() {
  try {
    // Check email configuration
    const config = checkEmailConfig()
    
    if (!config.configured) {
      return NextResponse.json({
        configured: false,
        error: "Email configuration is incomplete",
        missing: config.missing,
        message: "Please set the following environment variables: EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, EMAIL_FROM",
      }, { status: 400 })
    }

    return NextResponse.json({
      configured: true,
      message: "Email configuration is valid",
      env: {
        host: process.env.EMAIL_SERVER_HOST ? "✓" : "✗",
        port: process.env.EMAIL_SERVER_PORT ? "✓" : "✗",
        user: process.env.EMAIL_SERVER_USER ? "✓" : "✗",
        password: process.env.EMAIL_SERVER_PASSWORD ? "✓" : "✗",
        from: process.env.EMAIL_FROM ? "✓" : "✗",
        adminEmail: process.env.ADMIN_EMAIL || "chihab.jabri@gmail.com (default)",
      },
    })
  } catch (error) {
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { testType, email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (testType === "client") {
      // Test client confirmation email
      const result = await sendWaitlistConfirmationEmail({
        email,
        name: "Test User",
        position: 1,
        estimatedWait: 5,
      })
      return NextResponse.json({
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      })
    } else if (testType === "admin") {
      // Test admin notification email
      const result = await sendWaitlistAdminNotification({
        id: 999,
        firstName: "Test",
        lastName: "User",
        email,
        phone: "+212 6XX XXX XXX",
        mealPlanPreference: "Balanced",
        city: "Casablanca",
        notifications: true,
      })
      return NextResponse.json({
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      })
    } else {
      return NextResponse.json({ error: "Invalid testType. Use 'client' or 'admin'" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}


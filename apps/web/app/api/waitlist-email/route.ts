export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Helper function to safely get environmental variables with default values
function getEnv(key: string, defaultValue = ""): string {
  return process.env[key] || defaultValue
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, mealPlan, city, notifications } = body

    console.log("Received waitlist submission:", { firstName, lastName, email, phone, mealPlan, city, notifications })

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "First name, last name, and email are required" }, { status: 400 })
    }

    // Create email content
    const emailContent = `
New Waitlist Signup - Fitnest.ma

CUSTOMER DETAILS:
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || "Not provided"}
Preferred Meal Plan: ${mealPlan || "Not selected"}
City: ${city || "Not selected"}
Wants Notifications: ${notifications ? "Yes" : "No"}
Submission Date: ${new Date().toLocaleString()}

---
This is an automated message from the Fitnest.ma waitlist form.
    `

    // Use the same email configuration as other emails
    const transporter = nodemailer.createTransport({
      host: getEnv("EMAIL_SERVER_HOST"),
      port: Number(getEnv("EMAIL_SERVER_PORT")),
      secure: getEnv("EMAIL_SERVER_SECURE") === "true",
      auth: {
        user: getEnv("EMAIL_SERVER_USER"),
        pass: getEnv("EMAIL_SERVER_PASSWORD"),
      },
      connectionTimeout: 5000,
      pool: true,
      maxConnections: 5,
      rateDelta: 1000,
      rateLimit: 5,
      debug: true,
    })

    console.log("Email configuration:", {
      host: getEnv("EMAIL_SERVER_HOST"),
      port: getEnv("EMAIL_SERVER_PORT"),
      user: getEnv("EMAIL_SERVER_USER"),
      from: getEnv("EMAIL_FROM"),
    })

    // Verify transporter
    try {
      await transporter.verify()
      console.log("Email transporter verified successfully")
    } catch (verifyError) {
      console.error("Email transporter verification failed:", verifyError)
    }

    // Send email to noreply@fitnest.ma
    const mailOptions = {
      from: getEnv("EMAIL_FROM"),
      to: "noreply@fitnest.ma",
      subject: `New Waitlist Signup: ${firstName} ${lastName}`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #015033; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Waitlist Signup</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #eee;">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Preferred Meal Plan:</strong> ${mealPlan || "Not selected"}</p>
            <p><strong>City:</strong> ${city || "Not selected"}</p>
            <p><strong>Wants Notifications:</strong> ${notifications ? "Yes" : "No"}</p>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="background-color: #e6f2ed; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>This is an automated message from the Fitnest.ma waitlist form.</p>
          </div>
        </div>
      `,
    }

    console.log("Attempting to send email to noreply@fitnest.ma...")

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.messageId)
    console.log("Email response:", info.response)

    // Return success
    return NextResponse.json({
      success: true,
      message: "Waitlist signup received",
      emailSent: true,
      messageId: info.messageId,
    })
  } catch (error) {
    console.error("Waitlist email error:", error)

    // Return success to user but log the error
    return NextResponse.json({
      success: true,
      message: "Waitlist signup received",
      emailSent: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

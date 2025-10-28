export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Helper function to safely get environmental variables with default values
function getEnv(key: string, defaultValue = ""): string {
  return process.env[key] || defaultValue
}

export async function GET() {
  try {
    console.log("Testing email configuration...")

    // Check environment variables
    const emailConfig = {
      host: getEnv("EMAIL_SERVER_HOST"),
      port: getEnv("EMAIL_SERVER_PORT"),
      secure: getEnv("EMAIL_SERVER_SECURE"),
      user: getEnv("EMAIL_SERVER_USER"),
      pass: getEnv("EMAIL_SERVER_PASSWORD") ? "***SET***" : "NOT SET",
      from: getEnv("EMAIL_FROM"),
    }

    console.log("Email config:", emailConfig)

    if (
      !emailConfig.host ||
      !emailConfig.port ||
      !emailConfig.user ||
      emailConfig.pass === "NOT SET" ||
      !emailConfig.from
    ) {
      return NextResponse.json({
        success: false,
        error: "Email configuration incomplete",
        config: emailConfig,
      })
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: emailConfig.host,
      port: Number(emailConfig.port),
      secure: emailConfig.secure === "true",
      auth: {
        user: emailConfig.user,
        pass: getEnv("EMAIL_SERVER_PASSWORD"),
      },
      connectionTimeout: 5000,
      pool: true,
      maxConnections: 5,
      rateDelta: 1000,
      rateLimit: 5,
      debug: true,
    })

    // Verify transporter
    console.log("Verifying transporter...")
    await transporter.verify()
    console.log("Transporter verified successfully")

    // Send test email
    console.log("Sending test email...")
    const testEmailContent = `
Test Email from Fitnest.ma Waitlist System

This is a test email to verify the email configuration is working properly.

Test Details:
- Sent at: ${new Date().toLocaleString()}
- From: ${emailConfig.from}
- To: noreply@fitnest.ma
- Server: ${emailConfig.host}:${emailConfig.port}

If you receive this email, the configuration is working correctly.
    `

    const info = await transporter.sendMail({
      from: emailConfig.from,
      to: "noreply@fitnest.ma",
      subject: "Test Email - Fitnest.ma Waitlist System",
      text: testEmailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #015033; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Test Email</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #eee;">
            <h2>Fitnest.ma Waitlist System Test</h2>
            <p>This is a test email to verify the email configuration is working properly.</p>
            <h3>Test Details:</h3>
            <ul>
              <li><strong>Sent at:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>From:</strong> ${emailConfig.from}</li>
              <li><strong>To:</strong> noreply@fitnest.ma</li>
              <li><strong>Server:</strong> ${emailConfig.host}:${emailConfig.port}</li>
            </ul>
            <p>If you receive this email, the configuration is working correctly.</p>
          </div>
        </div>
      `,
    })

    console.log("Test email sent successfully:", info.messageId)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
      response: info.response,
      config: emailConfig,
    })
  } catch (error) {
    console.error("Test email failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error,
    })
  }
}

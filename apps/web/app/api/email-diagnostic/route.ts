import { NextResponse } from "next/server"
import { checkEmailConfig } from "@/lib/email-utils"

export async function GET() {
  try {
    // Check email configuration
    const config = checkEmailConfig()
    
    // Get environment variables (without exposing sensitive data)
    const envCheck = {
      EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST ? "✓ Set" : "✗ Missing",
      EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT ? `✓ Set (${process.env.EMAIL_SERVER_PORT})` : "✗ Missing",
      EMAIL_SERVER_SECURE: process.env.EMAIL_SERVER_SECURE ? `✓ Set (${process.env.EMAIL_SERVER_SECURE})` : "✗ Missing",
      EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER ? `✓ Set (${process.env.EMAIL_SERVER_USER})` : "✗ Missing",
      EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD ? `✓ Set (${process.env.EMAIL_SERVER_PASSWORD.length} chars)` : "✗ Missing",
      EMAIL_FROM: process.env.EMAIL_FROM ? `✓ Set (${process.env.EMAIL_FROM})` : "✗ Missing",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ? `✓ Set (${process.env.ADMIN_EMAIL})` : "✗ Missing (using default: chihab@ekwip.ma)",
    }

    // Try to create transporter to see if it works
    let transporterStatus = "Not tested"
    let transporterError = null
    
    if (config.configured) {
      try {
        const nodemailer = require("nodemailer")
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          secure: process.env.EMAIL_SERVER_SECURE === "true",
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
          connectionTimeout: 5000,
        })
        
        // Try to verify connection
        try {
          await transporter.verify()
          transporterStatus = "✅ Connection verified successfully"
        } catch (verifyError: any) {
          transporterStatus = "❌ Connection verification failed"
          transporterError = {
            message: verifyError.message,
            code: verifyError.code,
            command: verifyError.command,
            response: verifyError.response,
            responseCode: verifyError.responseCode,
          }
        }
      } catch (createError: any) {
        transporterStatus = "❌ Failed to create transporter"
        transporterError = {
          message: createError.message,
        }
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: "production",
      configStatus: config.configured ? "✅ Configured" : "❌ Not Configured",
      configDetails: config,
      environmentVariables: envCheck,
      transporterStatus,
      transporterError,
      recommendations: !config.configured ? [
        "Add all required environment variables in Vercel",
        "Make sure EMAIL_SERVER_PASSWORD is the App Password (16 chars, no spaces)",
        "Redeploy after adding environment variables",
      ] : transporterError ? [
        "Check that the App Password is correct",
        "Verify EMAIL_SERVER_USER matches the account that generated the App Password",
        "Ensure 2-Step Verification is enabled on the Gmail account",
        "Check that EMAIL_SERVER_PORT matches EMAIL_SERVER_SECURE (587 + false, or 465 + true)",
      ] : [
        "Configuration looks good! Check Vercel function logs for email sending errors.",
      ],
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}


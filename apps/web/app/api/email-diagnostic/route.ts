export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Helper function to safely get environmental variables with default values
function getEnv(key: string, defaultValue = ""): string {
  return process.env[key] || defaultValue
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, provider = "custom" } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log(`Running email diagnostic for provider: ${provider}`)

    // Collect environment variables
    const diagnosticResults: any = {
      environmentVariables: {
        host: getEnv("EMAIL_SERVER_HOST") ? "✓ Set" : "✗ Missing",
        port: getEnv("EMAIL_SERVER_PORT") ? "✓ Set" : "✗ Missing",
        secure: getEnv("EMAIL_SERVER_SECURE") ? "✓ Set" : "✗ Missing",
        user: getEnv("EMAIL_SERVER_USER") ? "✓ Set" : "✗ Missing",
        password: getEnv("EMAIL_SERVER_PASSWORD")
          ? "✓ Set (length: " + getEnv("EMAIL_SERVER_PASSWORD").length + ")"
          : "✗ Missing",
        from: getEnv("EMAIL_FROM") ? "✓ Set" : "✗ Missing",
      },
      smtpConnection: null,
      emailSending: null,
      providerSpecific: {},
    }

    // Add provider-specific checks
    if (provider === "gmail") {
      const user = getEnv("EMAIL_SERVER_USER")
      if (user && !user.includes("@gmail.com")) {
        diagnosticResults.providerSpecific.gmailUsername = {
          status: "warning",
          message: "Gmail SMTP requires full email address as username",
        }
      }

      const secure = getEnv("EMAIL_SERVER_SECURE")
      const port = getEnv("EMAIL_SERVER_PORT")
      if (secure !== "true" || port !== "465") {
        diagnosticResults.providerSpecific.gmailSecurity = {
          status: "warning",
          message: "Gmail typically requires secure=true and port=465",
        }
      }
    }

    // Test SMTP connection with detailed error capture
    console.log("Testing SMTP connection with the following config:")
    console.log({
      host: getEnv("EMAIL_SERVER_HOST"),
      port: Number(getEnv("EMAIL_SERVER_PORT")),
      secure: getEnv("EMAIL_SERVER_SECURE") === "true",
      auth: {
        user: getEnv("EMAIL_SERVER_USER"),
        pass: "********", // Don't log passwords
      },
    })

    let transporter
    try {
      transporter = nodemailer.createTransport({
        host: getEnv("EMAIL_SERVER_HOST"),
        port: Number(getEnv("EMAIL_SERVER_PORT")),
        secure: getEnv("EMAIL_SERVER_SECURE") === "true",
        auth: {
          user: getEnv("EMAIL_SERVER_USER"),
          pass: getEnv("EMAIL_SERVER_PASSWORD"),
        },
        debug: true, // Include debug information
        logger: true, // Log information about the transport
      })

      const verifyResult = await transporter.verify()
      diagnosticResults.smtpConnection = {
        success: true,
        message: "SMTP connection successful",
        details: verifyResult,
      }
      console.log("SMTP connection verified:", verifyResult)
    } catch (error: any) {
      // Extract detailed error information
      const errorDetails: any = {
        code: error.code,
        command: error.command,
      }

      // Provider-specific error handling
      if (provider === "gmail" && error.code === "EAUTH") {
        errorDetails.suggestion = "For Gmail accounts with 2FA, you need to create an App Password"
      }

      // Categorize common SMTP errors
      let errorMessage = error.message
      if (error.code === "ESOCKET") {
        errorMessage = "Connection failed - check host and port settings"
      } else if (error.code === "EAUTH") {
        errorMessage = "Authentication failed - check username and password"
      } else if (error.code === "ETIMEDOUT") {
        errorMessage = "Connection timed out - server may be down or blocked"
      }

      diagnosticResults.smtpConnection = {
        success: false,
        message: errorMessage,
        details: errorDetails,
      }
      console.error("SMTP connection failed:", error)

      // Return early if connection failed
      return NextResponse.json(diagnosticResults)
    }

    // Only attempt to send email if SMTP connection was successful
    try {
      console.log("Attempting to send diagnostic email...")

      // Check if EMAIL_FROM is properly formatted
      const fromEmail = getEnv("EMAIL_FROM")
      if (!fromEmail.includes("@")) {
        throw new Error("EMAIL_FROM is not properly formatted. It should contain an email address.")
      }

      const info = await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject: "Fitnest.ma Email Diagnostic Test",
        text: "This is a diagnostic test email from Fitnest.ma to verify email functionality.",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h1 style="color: #4CAF50;">Fitnest.ma Email Diagnostic</h1>
            <p>This is a diagnostic test email sent at ${new Date().toISOString()}</p>
            <p>If you're receiving this email, it means your email configuration is working correctly.</p>
            <h2>Configuration Details</h2>
            <ul>
              <li><strong>Host:</strong> ${getEnv("EMAIL_SERVER_HOST")}</li>
              <li><strong>Port:</strong> ${getEnv("EMAIL_SERVER_PORT")}</li>
              <li><strong>Secure:</strong> ${getEnv("EMAIL_SERVER_SECURE")}</li>
              <li><strong>User:</strong> ${getEnv("EMAIL_SERVER_USER")}</li>
              <li><strong>From:</strong> ${getEnv("EMAIL_FROM")}</li>
              <li><strong>Provider:</strong> ${provider}</li>
              <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p>If you received this email successfully, your email configuration is working properly.</p>
          </div>
        `,
      })

      diagnosticResults.emailSending = {
        success: true,
        messageId: info.messageId,
        response: info.response,
        envelope: info.envelope,
      }
      console.log("Diagnostic email sent:", info)
    } catch (error: any) {
      // Detailed email sending error analysis
      const errorDetails: any = {
        name: error.name,
        message: error.message,
      }

      let errorMessage = error.message
      // Special handling for common email sending errors
      if (error.message.includes("sender address does not match")) {
        errorMessage = "Sender address in FROM field doesn't match authorized sender"
        errorDetails.suggestion = "Ensure EMAIL_FROM matches your authenticated email address"
      } else if (error.message.includes("recipient")) {
        errorMessage = "Invalid recipient email address"
      } else if (error.responseCode === 550) {
        errorMessage = "Email rejected by recipient server (550)"
        errorDetails.suggestion = "Check if your sending domain has proper SPF/DKIM setup"
      }

      diagnosticResults.emailSending = {
        success: false,
        message: errorMessage,
        details: errorDetails,
      }
      console.error("Failed to send diagnostic email:", error)
    }

    return NextResponse.json(diagnosticResults)
  } catch (error) {
    console.error("Email diagnostic error:", error)
    return NextResponse.json(
      {
        error: "Failed to run email diagnostic",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

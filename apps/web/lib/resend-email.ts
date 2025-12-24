import { Resend } from "resend"

// Fitnest brand colors
const FITNEST_GREEN = "#264e35"
const FITNEST_ORANGE = "#e06439"
const FITNEST_LIGHT_GREEN = "#e8f3ed"

// Initialize Resend client
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set")
  }
  return new Resend(apiKey)
}

// Get email addresses from environment
function getAdminEmail() {
  return process.env.ADMIN_EMAIL || "chihab@ekwip.ma"
}

function getFromEmail() {
  return process.env.EMAIL_FROM || "noreply@fitnest.ma"
}

/**
 * Send waitlist confirmation email to the client
 */
export async function sendWaitlistConfirmationEmail(data: {
  email: string
  name: string
  position: number
  estimatedWait: number
}) {
  try {
    const { email, name, position, estimatedWait } = data
    console.log(`📧 [Resend] Sending waitlist confirmation to ${email}`)

    const resend = getResendClient()
    const firstName = name.split(" ")[0]

    const result = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: "You're on the Fitnest Waitlist! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: ${FITNEST_GREEN}; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <img src="https://obtmksfewry4ishp.public.blob.vercel-storage.com/Logo/Logo-Fitnest-white-NwDGrdKRIJziMZXVVN9cKNeWBx1ENP.png" alt="Fitnest Logo" width="180" style="max-width: 100%;">
            </div>
            
            <div style="padding: 30px; border: 1px solid #eee; background-color: #fff; border-radius: 0 0 8px 8px;">
              <h2 style="color: ${FITNEST_GREEN}; margin-top: 0; font-size: 24px;">You're on the Waitlist! 🎉</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #444;">Hello ${firstName},</p>
              <p style="font-size: 16px; line-height: 1.6; color: #444;">Thank you for joining the Fitnest waitlist! We're experiencing high demand and are carefully managing our capacity to ensure every customer receives the exceptional quality and service we're known for.</p>
              
              <div style="background-color: ${FITNEST_LIGHT_GREEN}; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid ${FITNEST_GREEN};">
                <h3 style="margin-top: 0; color: ${FITNEST_GREEN}; font-size: 18px;">Your Waitlist Details</h3>
                <p style="margin: 8px 0; font-size: 16px;"><strong>Position:</strong> #${position}</p>
                <p style="margin: 8px 0; font-size: 16px;"><strong>Average Wait Time:</strong> ${estimatedWait} days</p>
                <p style="margin: 8px 0; font-size: 16px;"><strong>Date Added:</strong> ${new Date().toLocaleDateString()}</p>
                <p style="margin: 12px 0 0 0; font-size: 16px; font-style: italic;">We'll call you before your spot is ready to confirm your subscription details. The wait time is typically around ${estimatedWait} days.</p>
              </div>
              
              <h3 style="color: ${FITNEST_ORANGE}; font-size: 18px;">While You Wait, Here's What You'll Get:</h3>
              <ul style="font-size: 16px; line-height: 1.6; color: #444; padding-left: 20px;">
                <li><strong>20% discount</strong> on your first subscription</li>
                <li><strong>Delicious complimentary snacks</strong> with your first order</li>
              </ul>
              
              <p style="font-size: 16px; line-height: 1.6; color: #444;">We'll notify you as soon as a spot opens up. In the meantime, feel free to explore our website to learn more about our meal plans and nutrition philosophy.</p>
              
              <div style="text-align: center; margin-top: 35px;">
                <a href="https://fitnest.ma/meal-plans" style="background-color: ${FITNEST_GREEN}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Explore Meal Plans</a>
              </div>
              
              <p style="margin-top: 35px; font-size: 16px; line-height: 1.6; color: #444;">Thank you for your patience and interest in Fitnest!</p>
              <p style="font-size: 16px; line-height: 1.6; color: #444;">Best regards,<br>The Fitnest Team</p>
            </div>
            
            <div style="background-color: ${FITNEST_LIGHT_GREEN}; padding: 20px; text-align: center; border-radius: 8px; margin-top: 20px;">
              <h3 style="color: ${FITNEST_GREEN}; margin-top: 0; font-size: 18px;">Follow Us</h3>
              <div style="margin: 15px 0;">
                <a href="https://instagram.com/fitnest.ma" style="display: inline-block; margin: 0 10px; color: ${FITNEST_GREEN}; text-decoration: none;">
                  <span style="font-size: 14px;">📷 Instagram</span>
                </a>
                <a href="https://facebook.com/fitnest.ma" style="display: inline-block; margin: 0 10px; color: ${FITNEST_GREEN}; text-decoration: none;">
                  <span style="font-size: 14px;">👥 Facebook</span>
                </a>
                <a href="https://tiktok.com/@fitnest.ma" style="display: inline-block; margin: 0 10px; color: ${FITNEST_GREEN}; text-decoration: none;">
                  <span style="font-size: 14px;">🎵 TikTok</span>
                </a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 15px;">© ${new Date().getFullYear()} Fitnest.ma. All rights reserved.</p>
              <p style="font-size: 14px; color: #666;">If you have any questions, please contact us at support@fitnest.ma</p>
            </div>
          </body>
        </html>
      `,
      text: `You're on the Fitnest Waitlist! 🎉

Hello ${firstName},

Thank you for joining the Fitnest waitlist! We're experiencing high demand and are carefully managing our capacity to ensure every customer receives the exceptional quality and service we're known for.

YOUR WAITLIST DETAILS
Position: #${position}
Average Wait Time: ${estimatedWait} days
Date Added: ${new Date().toLocaleDateString()}

We'll call you before your spot is ready to confirm your subscription details. The wait time is typically around ${estimatedWait} days.

WHILE YOU WAIT, HERE'S WHAT YOU'LL GET:
- 20% discount on your first subscription
- Delicious complimentary snacks with your first order

We'll notify you as soon as a spot opens up. In the meantime, feel free to explore our website to learn more about our meal plans and nutrition philosophy.

Thank you for your patience and interest in Fitnest!

Best regards,
The Fitnest Team

FOLLOW US
Instagram: @fitnest.ma
Facebook: /fitnest.ma
TikTok: @fitnest.ma

© ${new Date().getFullYear()} Fitnest.ma. All rights reserved.`,
    })

    if (result.error) {
      console.error("❌ [Resend] Error sending email:", result.error)
      return {
        success: false,
        error: result.error.message || "Failed to send email",
        details: result.error,
      }
    }

    console.log(`✅ [Resend] Confirmation email sent to ${email}. ID: ${result.data?.id}`)
    return {
      success: true,
      messageId: result.data?.id,
      response: result.data,
    }
  } catch (error) {
    console.error("❌ [Resend] Exception sending waitlist confirmation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error,
    }
  }
}

/**
 * Send admin notification email when a new waitlist entry is created
 * Sends to both chihab@ekwip.ma and noreply@fitnest.ma
 */
export async function sendWaitlistAdminNotification(submissionData: {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  mealPlanPreference?: string
  city?: string
  notifications?: boolean
}) {
  try {
    const { id, firstName, lastName, email, phone, mealPlanPreference, city, notifications } = submissionData

    console.log(`📧 [Resend] Sending admin notification for waitlist entry ${id}`)

    const resend = getResendClient()
    const adminEmail = getAdminEmail()
    const fromEmail = getFromEmail()

    // Send to both admin email and noreply@fitnest.ma
    const recipients = [adminEmail, "noreply@fitnest.ma"].filter(Boolean)

    const emailContent = {
      from: fromEmail,
      to: recipients,
      subject: `🔔 New Waitlist Entry - ${firstName} ${lastName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: ${FITNEST_GREEN}; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">🔔 New Waitlist Entry</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #eee; background-color: #fff; border-radius: 0 0 8px 8px;">
              <h2 style="color: ${FITNEST_GREEN}; margin-top: 0;">New waitlist submission received</h2>
              
              <div style="background-color: ${FITNEST_LIGHT_GREEN}; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: ${FITNEST_GREEN};">Customer Details</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
                <p><strong>City:</strong> ${city || "Not provided"}</p>
                <p><strong>Meal Plan Preference:</strong> ${mealPlanPreference || "Not specified"}</p>
                <p><strong>Notifications:</strong> ${notifications ? "Yes" : "No"}</p>
                <p><strong>Submission ID:</strong> ${id}</p>
                <p><strong>Acquisition Source:</strong> Waitlist</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p style="color: #444;">This customer has been added to the waitlist and should be contacted soon.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://fitnest.ma/admin/waitlist" style="background-color: ${FITNEST_GREEN}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View All Waitlist Entries</a>
              </div>
            </div>
            <div style="background-color: ${FITNEST_LIGHT_GREEN}; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 8px; margin-top: 20px;">
              <p>© ${new Date().getFullYear()} Fitnest.ma Admin Notification</p>
            </div>
          </body>
        </html>
      `,
      text: `New Waitlist Entry - ${firstName} ${lastName}

Customer Details:
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || "Not provided"}
City: ${city || "Not provided"}
Meal Plan Preference: ${mealPlanPreference || "Not specified"}
Notifications: ${notifications ? "Yes" : "No"}
Submission ID: ${id}
Acquisition Source: Waitlist
Date: ${new Date().toLocaleString()}

This customer has been added to the waitlist and should be contacted soon.

View all entries: https://fitnest.ma/admin/waitlist`,
    }

    const result = await resend.emails.send(emailContent)

    if (result.error) {
      console.error("❌ [Resend] Error sending admin notification:", result.error)
      return {
        success: false,
        error: result.error.message || "Failed to send email",
        details: result.error,
      }
    }

    console.log(`✅ [Resend] Admin notification sent to ${recipients.join(", ")}. ID: ${result.data?.id}`)
    return {
      success: true,
      messageId: result.data?.id,
      response: result.data,
      recipients,
    }
  } catch (error) {
    console.error("❌ [Resend] Exception sending admin notification:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error,
    }
  }
}


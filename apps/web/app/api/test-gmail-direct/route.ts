export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST() {
  try {
    console.log("Testing with Gmail account...")

    // For testing - you'll need to provide a real Gmail account and app password
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "your-actual-gmail@gmail.com", // Replace with your Gmail
        pass: "your-app-password", // Replace with your Gmail app password
      },
      debug: true,
    })

    await transporter.verify()
    console.log("Gmail transporter verified")

    const info = await transporter.sendMail({
      from: '"Fitnest.ma" <your-actual-gmail@gmail.com>',
      to: "chihab.jabri@gmail.com",
      subject: "Gmail Test - Fitnest.ma",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Gmail SMTP Test</h2>
          <p>This email was sent using Gmail SMTP to test the configuration.</p>
          <p>Time: ${new Date().toISOString()}</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Gmail test email sent",
      messageId: info.messageId,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

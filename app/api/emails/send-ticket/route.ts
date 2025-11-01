import { type NextRequest, NextResponse } from "next/server"
import { sendMail } from "@/lib/mailer"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, ticketData } = body

    const html = `
      <div style="font-family:Arial, sans-serif;max-width:640px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#6B3FA0,#D4AF37);padding:20px;border-radius:8px;color:#fff;text-align:center;">
          <h1 style="margin:0">Dinner N' Awards Night</h1>
          <p style="margin:6px 0 0">Your E-Ticket</p>
        </div>
        <div style="padding:20px;">
          <p>Hello ${ticketData.firstName} ${ticketData.lastName},</p>
          <p>Thank you for your purchase. Present the QR at entry.</p>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:12px 0;">
            <p style="margin:0 0 8px 0;">ID: ${ticketData.ticketId}</p>
            <p style="margin:0 0 8px 0;">Type: ${String(ticketData.ticketType).toUpperCase()}</p>
            <div style="text-align:center;">
              <img src="${ticketData.qrCode}" alt="QR Code" style="max-width:240px" />
            </div>
          </div>
        </div>
      </div>`

    await sendMail({ to: email, subject: "Your Dinner N' Awards Night E-Ticket", html })

    return NextResponse.json({ success: true, message: "E-ticket email sent" })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

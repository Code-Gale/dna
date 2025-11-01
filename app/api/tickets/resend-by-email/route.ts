import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { TicketModel } from "@/models/Ticket"
import { sendMail } from "@/lib/mailer"
import { renderTicketsEmail } from "@/lib/ticket-email"
import { generateTicketPDF } from "@/lib/pdf"
import { buildICS } from "@/lib/ics"
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })
    await dbConnect()
    const tickets = await TicketModel.find({ email, paymentStatus: "success" }).sort({ createdAt: 1 }).lean()
    if (!tickets || tickets.length === 0) return NextResponse.json({ error: "No tickets for this email" }, { status: 404 })

    const simplified = tickets.map((t) => ({ id: t.ticketId as string, qrCode: t.qrCode as string }))
    const attachments = simplified.map((t) => ({
      filename: `${t.id}.png`,
      content: Buffer.from((t.qrCode || '').split(',')[1] || '', 'base64'),
      contentType: 'image/png',
      cid: `qr-${t.id}@tickets`,
    }))
    // Add PDFs per ticket
    const pdfs = await Promise.all(
      simplified.map(async (t) => ({
        filename: `${t.id}.pdf`,
        content: await generateTicketPDF({ ticketId: t.id, firstName: tickets[0].firstName as string, lastName: tickets[0].lastName as string, ticketType: tickets[0].ticketType as string, qrDataUrl: t.qrCode }),
        contentType: 'application/pdf',
      }))
    )
    const ics = { filename: 'event.ics', content: Buffer.from(buildICS()), contentType: 'text/calendar' }

    const first = tickets[0]
    const html = renderTicketsEmail({
      firstName: first.firstName as string,
      lastName: first.lastName as string,
      ticketType: first.ticketType as string,
      tickets: simplified,
      useCid: true,
    })

    await sendMail({ to: email, subject: "Your Dinner N' Awards Night E-Tickets", html, attachments: [...attachments, ...pdfs, ics] })
    return NextResponse.json({ success: true, count: tickets.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to resend by email" }, { status: 500 })
  }
}

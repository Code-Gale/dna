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
    const { ticketId } = await request.json()
    if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 })
    await dbConnect()
    const ticket = await TicketModel.findOne({ ticketId })
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    const one = { id: ticket.ticketId, qrCode: ticket.qrCode! }
    const attachments = [
      {
        filename: `${one.id}.png`,
        content: Buffer.from((one.qrCode || '').split(',')[1] || '', 'base64'),
        contentType: 'image/png',
        cid: `qr-${one.id}@tickets`,
      },
    ]
    // PDF + ICS
    const pdf = await generateTicketPDF({ ticketId: one.id, firstName: ticket.firstName, lastName: ticket.lastName, ticketType: ticket.ticketType, qrDataUrl: one.qrCode })
    attachments.push({ filename: `${one.id}.pdf`, content: pdf, contentType: 'application/pdf' } as any)
    attachments.push({ filename: 'event.ics', content: Buffer.from(buildICS()), contentType: 'text/calendar' } as any)
    const html = renderTicketsEmail({
      firstName: ticket.firstName,
      lastName: ticket.lastName,
      ticketType: ticket.ticketType,
      tickets: [one],
      useCid: true,
    })
    await sendMail({ to: ticket.email, subject: "Your Dinner N' Awards Night E-Ticket", html, attachments })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to resend" }, { status: 500 })
  }
}

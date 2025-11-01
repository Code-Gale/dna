import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { TicketModel } from "@/models/Ticket"
import QRCode from "qrcode"
import { sendMail } from "@/lib/mailer"
import { getActivePricing } from "@/lib/pricing"
import { renderTicketsEmail } from "@/lib/ticket-email"
import { TransactionModel } from "@/models/Transaction"
import { generateTicketPDF } from "@/lib/pdf"
import { buildICS } from "@/lib/ics"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
  const body = await request.json()
  const { reference } = body

    // Verify Paystack payment
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message }, { status: response.status })
    }

    // On success, create tickets and send emails (idempotent)
    if (data?.data?.status === "success") {
      await dbConnect()
      // If transaction already processed, return existing tickets
      const existingTx = await TransactionModel.findOne({ reference })
      if (existingTx?.status === "processed" && existingTx.tickets?.length) {
        const existingTickets = await TicketModel.find({ reference }).sort({ createdAt: 1 }).lean()
        const simplified = existingTickets.map((t) => ({ id: t.ticketId as string, qrCode: t.qrCode as string }))
        const meta = data.data.metadata || {}
        const email = data.data.customer?.email || meta.email
        const firstName = meta.firstName || "Guest"
        const lastName = meta.lastName || ""
        const { ticketType } = await getActivePricing()
        const attachments = simplified.map((t) => {
          const base64 = (t.qrCode || "").split(",")[1] || ""
          return {
            filename: `${t.id}.png`,
            content: Buffer.from(base64, "base64"),
            contentType: "image/png",
            cid: `qr-${t.id}@tickets`,
          }
        })
        // Attach PDFs and ICS (single per email)
        const pdfs = await Promise.all(
          simplified.map(async (t) => ({
            filename: `${t.id}.pdf`,
            content: await generateTicketPDF({ ticketId: t.id, firstName, lastName, ticketType, qrDataUrl: t.qrCode }),
            contentType: "application/pdf",
          })),
        )
        const ics = { filename: "event.ics", content: Buffer.from(buildICS()), contentType: "text/calendar" }
        const html = renderTicketsEmail({ firstName, lastName, ticketType, tickets: simplified, useCid: true })
        await sendMail({ to: email, subject: "Your Dinner N' Awards Night E-Tickets", html, attachments: [...attachments, ...pdfs, ics] })
        return NextResponse.json({ success: true, tickets: simplified, email })
      }

      // Create or mark transaction as processing (unique ensures idempotency)
      try {
        await TransactionModel.create({ reference, status: "processing" })
      } catch (e: any) {
        // Duplicate reference -> another request already started; fetch and return once available
        const existing = await TicketModel.find({ reference }).sort({ createdAt: 1 }).lean()
        if (existing.length) {
          const simplified = existing.map((t) => ({ id: t.ticketId as string, qrCode: t.qrCode as string }))
          return NextResponse.json({ success: true, tickets: simplified })
        }
      }
      const meta = data.data.metadata || {}
      const quantity = Number(meta.quantity || 1)
      const email = data.data.customer?.email || meta.email
      const firstName = meta.firstName || "Guest"
      const lastName = meta.lastName || ""
      const phone = meta.phone || ""
      const { price, ticketType } = await getActivePricing()

      const createdTickets: { id: string; qrCode: string }[] = []
      for (let i = 0; i < quantity; i++) {
        const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        const qrData = JSON.stringify({ ticketId, email, firstName, lastName, ticketType })
        const qrCode = await QRCode.toDataURL(qrData)
        await TicketModel.create({
          ticketId,
          firstName,
          lastName,
          email,
          phone,
          amountPaid: price,
          paymentStatus: "success",
          ticketType,
          qrCode,
          reference,
        })
        createdTickets.push({ id: ticketId, qrCode })
      }

      // Email tickets using Nodemailer (if SMTP configured)
      // Build PNG attachments from QR data URLs
      const attachments = createdTickets.map((t) => {
        const base64 = (t.qrCode || "").split(",")[1] || ""
        return {
          filename: `${t.id}.png`,
          content: Buffer.from(base64, "base64"),
          contentType: "image/png",
          cid: `qr-${t.id}@tickets`,
        }
      })
      // Add PDF and ICS attachments
      const pdfAttachments = await Promise.all(
        createdTickets.map(async (t) => ({
          filename: `${t.id}.pdf`,
          content: await generateTicketPDF({ ticketId: t.id, firstName, lastName, ticketType, qrDataUrl: t.qrCode }),
          contentType: "application/pdf",
        })),
      )
      const icsAttachment = { filename: "event.ics", content: Buffer.from(buildICS()), contentType: "text/calendar" }

      const html = renderTicketsEmail({ firstName, lastName, ticketType, tickets: createdTickets, useCid: true })
      await sendMail({ to: email, subject: "Your Dinner N' Awards Night E-Tickets", html, attachments: [...attachments, ...pdfAttachments, icsAttachment] })

      // Mark transaction processed
      await TransactionModel.findOneAndUpdate(
        { reference },
        { status: "processed", tickets: createdTickets.map((t) => t.id), processedAt: new Date() },
        { upsert: true },
      )

      return NextResponse.json({ success: true, tickets: createdTickets, email })
    }

    return NextResponse.json({ success: false, data })
  } catch (error) {
    console.error("Paystack verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}

 


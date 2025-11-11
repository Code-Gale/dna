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

    // Verify Korapay payment - adjust endpoint according to Korapay docs
    const response = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
      },
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json({ error: data?.message || "Failed to verify with Korapay" }, { status: response.status || 500 })
    }

    // Korapay success status shape may differ; assume data.data.status === "successful" or similar
    const status = data?.data?.status || data?.status
    if (String(status).toLowerCase() === "successful" || String(status).toLowerCase() === "success") {
      await dbConnect()
      const existingTx = await TransactionModel.findOne({ reference })
      if (existingTx?.status === "processed" && existingTx.tickets?.length) {
        const existingTickets = await TicketModel.find({ reference }).sort({ createdAt: 1 }).lean()
        const simplified = existingTickets.map((t) => ({ id: t.ticketId as string, qrCode: t.qrCode as string }))
        const meta = data?.data?.metadata || {}
        const customer = data?.data?.customer || {}
        const email = customer?.email || meta.email
        // Derive first and last names from customer.name or metadata
        const fullName = (customer?.name || meta?.name || `${meta.firstName || ""} ${meta.lastName || ""}`).trim()
        let firstName = "Guest"
        let lastName = "-"
        if (fullName) {
          const parts = fullName.split(/\s+/)
          firstName = parts.shift() || "Guest"
          lastName = parts.join(" ") || "-"
        }
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
        const pdfs = await Promise.all(
          simplified.map(async (t) => ({
            filename: `${t.id}.pdf`,
            content: await generateTicketPDF({ ticketId: t.id, firstName, lastName, ticketType, qrDataUrl: t.qrCode }),
            contentType: "application/pdf",
          })),
        )
        const ics = { filename: "event.ics", content: Buffer.from(buildICS()), contentType: "text/calendar" }
        const html = renderTicketsEmail({ firstName, lastName, ticketType, tickets: simplified, useCid: true })
        try {
          await sendMail({ to: email, subject: "Your Dinner N' Awards Night E-Tickets", html, attachments: [...attachments, ...pdfs, ics] })
        } catch (e: any) {
          console.error("Korapay verification: failed to send email (existing processed tx):", e)
          // Continue — don't fail the whole verification because of email issues
          return NextResponse.json({ success: true, tickets: simplified, email, emailSent: false })
        }
        return NextResponse.json({ success: true, tickets: simplified, email, emailSent: true })
      }

      try {
        await TransactionModel.create({ reference, status: "processing" })
      } catch (e: any) {
        const existing = await TicketModel.find({ reference }).sort({ createdAt: 1 }).lean()
        if (existing.length) {
          const simplified = existing.map((t) => ({ id: t.ticketId as string, qrCode: t.qrCode as string }))
          return NextResponse.json({ success: true, tickets: simplified })
        }
      }

      const meta = data?.data?.metadata || {}
      const customer = data?.data?.customer || {}
      const quantity = Number(meta.quantity || 1)
      const email = customer?.email || meta.email
      const fullName = (customer?.name || meta?.name || `${meta.firstName || ""} ${meta.lastName || ""}`).trim()
      let firstName = "Guest"
      let lastName = "-"
      if (fullName) {
        const parts = fullName.split(/\s+/)
        firstName = parts.shift() || "Guest"
        lastName = parts.join(" ") || "-"
      }
      // Korapay uses phone_number for phone; fall back to metadata
      const phone = customer?.phone_number || customer?.phone || meta.phone || "N/A"
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

      const attachments = createdTickets.map((t) => {
        const base64 = (t.qrCode || "").split(",")[1] || ""
        return {
          filename: `${t.id}.png`,
          content: Buffer.from(base64, "base64"),
          contentType: "image/png",
          cid: `qr-${t.id}@tickets`,
        }
      })
      const pdfAttachments = await Promise.all(
        createdTickets.map(async (t) => ({
          filename: `${t.id}.pdf`,
          content: await generateTicketPDF({ ticketId: t.id, firstName, lastName, ticketType, qrDataUrl: t.qrCode }),
          contentType: "application/pdf",
        })),
      )
      const icsAttachment = { filename: "event.ics", content: Buffer.from(buildICS()), contentType: "text/calendar" }

      const html = renderTicketsEmail({ firstName, lastName, ticketType, tickets: createdTickets, useCid: true })
      try {
        await sendMail({ to: email, subject: "Your Dinner N' Awards Night E-Tickets", html, attachments: [...attachments, ...pdfAttachments, icsAttachment] })
      } catch (e: any) {
        console.error("Korapay verification: failed to send email (new tx):", e)
        // Persist email job for manual retry
        try {
          await import("@/lib/db").then(async (m) => {
            await m.dbConnect()
            const { EmailQueueModel } = await import("@/models/EmailQueue")
            const serializedAttachments = [...attachments, ...pdfAttachments, icsAttachment].map((a: any) => ({
              filename: a.filename,
              contentBase64: typeof a.content === "string" ? a.content.split(",")[1] || a.content : Buffer.from(a.content).toString("base64"),
              contentType: a.contentType || a.content_type || "application/octet-stream",
            }))
            await EmailQueueModel.create({ reference, to: email, subject: "Your Dinner N' Awards Night E-Tickets", html, attachments: serializedAttachments, lastError: (e && e.message) || String(e) })
          })
        } catch (qe) {
          console.error("Failed to enqueue failed email for retry:", qe)
        }

        // mark transaction processed but indicate email failed so callers/admin can retry
        await TransactionModel.findOneAndUpdate(
          { reference },
          { status: "processed", tickets: createdTickets.map((t) => t.id), processedAt: new Date(), emailSent: false },
          { upsert: true },
        )

        return NextResponse.json({ success: true, tickets: createdTickets, email, emailSent: false })
      }

      await TransactionModel.findOneAndUpdate(
        { reference },
        { status: "processed", tickets: createdTickets.map((t) => t.id), processedAt: new Date() },
        { upsert: true },
      )

      return NextResponse.json({ success: true, tickets: createdTickets, email })
    }

    return NextResponse.json({ success: false, data })
  } catch (error) {
    console.error("Korapay verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}

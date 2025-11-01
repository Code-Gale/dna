import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { TicketModel } from "@/models/Ticket"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketId } = body

  await dbConnect()
  const ticket = await TicketModel.findOne({ ticketId })
    // Fallback: allow checking by created QR-embedded id if stored separately in future
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.checkedIn) {
      return NextResponse.json(
        {
          error: "Ticket already checked in",
          duplicate: true,
          checkedInAt: ticket.checkedInAt,
          ticket: {
            id: ticket.ticketId,
            firstName: ticket.firstName,
            lastName: ticket.lastName,
            ticketType: ticket.ticketType,
          },
        },
        { status: 409 },
      )
    }

    ticket.checkedIn = true
    ticket.checkedInAt = new Date()
    await ticket.save()

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.ticketId,
        firstName: ticket.firstName,
        lastName: ticket.lastName,
        ticketType: ticket.ticketType,
        verified: true,
      },
    })
  } catch (error) {
    console.error("Ticket verification error:", error)
    return NextResponse.json({ error: "Failed to verify ticket" }, { status: 500 })
  }
}

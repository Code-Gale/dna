import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { TicketModel } from "@/models/Ticket"
export const runtime = "nodejs"

export async function GET() {
  try {
    await dbConnect()
    const tickets = await TicketModel.find().sort({ createdAt: -1 }).limit(500).lean()
    return NextResponse.json({ tickets })
  } catch (e) {
    console.error("List tickets error", e)
    return NextResponse.json({ error: "Failed to list tickets" }, { status: 500 })
  }
}

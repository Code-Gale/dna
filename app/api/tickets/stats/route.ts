import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { TicketModel } from "@/models/Ticket"
import { SettingModel } from "@/models/Setting"
export const runtime = "nodejs"

export async function GET() {
  try {
    await dbConnect()
    let setting = await SettingModel.findOne()
    if (!setting) {
      // Auto-seed default settings on first call so the collection appears
      setting = await SettingModel.create({})
    }
    const sold = await TicketModel.countDocuments({ paymentStatus: "success" })
    const total = setting?.totalTickets ?? 100
    const remaining = Math.max(total - sold, 0)
    return NextResponse.json({ total, sold, remaining, earlyBirdDeadline: setting?.earlyBirdDeadline, eventDate: setting?.eventDate })
  } catch (e) {
    console.error("Stats error", e)
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { TicketModel } from "@/models/Ticket"
import { SettingModel } from "@/models/Setting"
export const runtime = "nodejs"
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    await dbConnect()
    // Use lean() and fresh read to avoid Mongoose caching
    let setting = await SettingModel.findOne().lean()
    if (!setting) {
      // Auto-seed default settings on first call so the collection appears
      const newSetting = await SettingModel.create({})
      setting = newSetting.toObject()
    }
    const sold = await TicketModel.countDocuments({ paymentStatus: "success" })
    const total = setting?.totalTickets ?? 100
    const remaining = Math.max(total - sold, 0)
    const now = new Date()
    const earlyBirdDeadline = setting?.earlyBirdDeadline ? new Date(setting.earlyBirdDeadline) : null
    const isEarlyBird = earlyBirdDeadline ? now <= earlyBirdDeadline : true
    const earlyBirdPrice = setting?.earlyBirdPrice ?? 5000
    const regularPrice = setting?.regularPrice ?? 7500
    const currentPrice = isEarlyBird ? earlyBirdPrice : regularPrice
    
    return NextResponse.json(
      { 
        total, 
        sold, 
        remaining, 
        earlyBirdDeadline: setting?.earlyBirdDeadline, 
        eventDate: setting?.eventDate,
        earlyBirdPrice,
        regularPrice,
        currentPrice,
        isEarlyBird
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (e) {
    console.error("Stats error", e)
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}

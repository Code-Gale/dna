import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { SettingModel } from "@/models/Setting"
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { totalTickets, earlyBirdPrice, regularPrice, earlyBirdDeadline, eventDate } = body
    await dbConnect()
    let setting = await SettingModel.findOne()
    if (!setting) setting = await SettingModel.create({})
    if (typeof totalTickets === "number" && totalTickets > 0) setting.totalTickets = totalTickets
    if (typeof earlyBirdPrice === "number" && earlyBirdPrice > 0) setting.earlyBirdPrice = earlyBirdPrice
    if (typeof regularPrice === "number" && regularPrice > 0) setting.regularPrice = regularPrice
    if (earlyBirdDeadline) setting.earlyBirdDeadline = new Date(earlyBirdDeadline)
    if (eventDate) setting.eventDate = new Date(eventDate)
    await setting.save()
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update settings" }, { status: 400 })
  }
}

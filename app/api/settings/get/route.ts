import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { SettingModel } from "@/models/Setting"
export const runtime = "nodejs"

export async function GET() {
  await dbConnect()
  let setting = await SettingModel.findOne()
  if (!setting) setting = await SettingModel.create({})
  return NextResponse.json({
    totalTickets: setting.totalTickets,
    earlyBirdPrice: setting.earlyBirdPrice,
    regularPrice: setting.regularPrice,
    earlyBirdDeadline: setting.earlyBirdDeadline,
    eventDate: setting.eventDate,
  })
}

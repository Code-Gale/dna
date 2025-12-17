import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { SettingModel } from "@/models/Setting"
export const runtime = "nodejs"
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  await dbConnect()
  // Use lean() for fresh read to avoid Mongoose caching
  let setting = await SettingModel.findOne().lean()
  if (!setting) {
    const newSetting = await SettingModel.create({})
    setting = newSetting.toObject()
  }
  return NextResponse.json(
    {
      totalTickets: setting?.totalTickets ?? 100,
      earlyBirdPrice: setting?.earlyBirdPrice ?? 5000,
      regularPrice: setting?.regularPrice ?? 7500,
      earlyBirdDeadline: setting?.earlyBirdDeadline,
      eventDate: setting?.eventDate,
      contactEmail: setting?.contactEmail,
      contactPhone: setting?.contactPhone,
      outfitInspiration: setting?.outfitInspiration || [],
      faqs: setting?.faqs || [],
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  )
}

import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { SettingModel } from "@/models/Setting"
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
  const { totalTickets, earlyBirdPrice, regularPrice, earlyBirdDeadline, eventDate, contactEmail, contactPhone, faqs, outfitInspiration } = body
    await dbConnect()
    let setting = await SettingModel.findOne()
    if (!setting) setting = await SettingModel.create({})
    if (typeof totalTickets === "number" && totalTickets > 0) setting.totalTickets = totalTickets
    if (typeof earlyBirdPrice === "number" && earlyBirdPrice > 0) setting.earlyBirdPrice = earlyBirdPrice
    if (typeof regularPrice === "number" && regularPrice > 0) setting.regularPrice = regularPrice
    if (earlyBirdDeadline) {
      const d = new Date(earlyBirdDeadline)
      if (!Number.isNaN(d.getTime())) setting.earlyBirdDeadline = d
    }
    if (eventDate) {
      const d = new Date(eventDate)
      if (!Number.isNaN(d.getTime())) setting.eventDate = d
    }
    if (typeof contactEmail === 'string') setting.contactEmail = contactEmail
    if (typeof contactPhone === 'string') setting.contactPhone = contactPhone
    if (Array.isArray(faqs)) {
      // basic sanitization: only accept items with question and answer strings
      ;(setting as any).faqs = faqs
        .filter((it: any) => it && typeof it.question === 'string' && typeof it.answer === 'string')
        .map((it: any) => ({ question: it.question, answer: it.answer }))
      setting.markModified('faqs')
    }
    if (Array.isArray(outfitInspiration)) {
      // accept items with title and optional imageUrl (public path under /uploads)
      ;(setting as any).outfitInspiration = outfitInspiration
        .filter((it: any) => it && typeof it.title === 'string' && it.title.trim().length > 0)
        .map((it: any) => ({ title: it.title.trim(), imageUrl: typeof it.imageUrl === 'string' ? it.imageUrl : undefined }))
      setting.markModified('outfitInspiration')
    }
    await setting.save()
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update settings" }, { status: 400 })
  }
}

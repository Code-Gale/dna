import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { EmailQueueModel } from "@/models/EmailQueue"
import { sendMail } from "@/lib/mailer"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    await dbConnect()

    const id = body?.id
    const limit = typeof body?.limit === "number" ? Math.min(50, body.limit) : 10

    let items: any[] = []
    if (id) {
      const one = await EmailQueueModel.findById(id).lean()
      if (one) items = [one]
    } else {
      items = await EmailQueueModel.find({ processed: false }).sort({ createdAt: 1 }).limit(limit).lean()
    }

    const results: any[] = []
    for (const item of items) {
      const attachments = (item.attachments || []).map((a: any) => ({ filename: a.filename, content: Buffer.from(a.contentBase64 || "", "base64"), contentType: a.contentType }))
      try {
        await sendMail({ to: item.to, subject: item.subject, html: item.html || "", attachments })
        await EmailQueueModel.findByIdAndUpdate(item._id, { processed: true, processedAt: new Date(), $inc: { attempts: 1 }, lastError: null })
        results.push({ id: item._id, ok: true })
      } catch (e: any) {
        console.error("Email retry failed for", item._id, e)
        await EmailQueueModel.findByIdAndUpdate(item._id, { $inc: { attempts: 1 }, lastError: e?.message || String(e) })
        results.push({ id: item._id, ok: false, error: e?.message || String(e) })
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results })
  } catch (err) {
    console.error("Email retry worker error:", err)
    return NextResponse.json({ error: "Failed to process email retries" }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { TicketModel } from '@/models/Ticket'
import { sendMail } from '@/lib/mailer'
import { SettingModel } from '@/models/Setting'

export const runtime = 'nodejs'

export async function POST() {
  try {
    await dbConnect()
    const setting = await SettingModel.findOne()
    const eventDate = setting?.eventDate || new Date('2025-12-10T15:00:00+01:00')

    const tickets = await TicketModel.find({ paymentStatus: 'success', reminderSentAt: { $exists: false } })
      .limit(200)
      .lean()

    const grouped = new Map<string, typeof tickets>()
    for (const t of tickets) {
      const key = t.email as string
      if (!grouped.has(key)) grouped.set(key, [] as any)
      grouped.get(key)!.push(t as any)
    }

    let sent = 0
    for (const [email, list] of grouped.entries()) {
      const name = `${list[0].firstName} ${list[0].lastName}`.trim()
      const html = `
        <div style="font-family:Arial,sans-serif">
          <h2>See you soon at Dinner N' Awards Night!</h2>
          <p>Hi ${name || 'Guest'}, this is a reminder for our event.</p>
          <p><strong>Date:</strong> ${new Date(eventDate).toLocaleString()}</p>
          <p><strong>Venue:</strong> Victory House</p>
          <p>Bring your e-ticket QR codes. You can also open your ticket confirmation email to show them.</p>
        </div>
      `
      await sendMail({ to: email, subject: "Reminder: Dinner N' Awards Night", html })
      sent++
      // mark all for this email as reminded
      await TicketModel.updateMany({ email }, { $set: { reminderSentAt: new Date() } })
    }

    return NextResponse.json({ success: true, sent })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to send reminders' }, { status: 500 })
  }
}

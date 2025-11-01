import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { PushSubscriptionModel } from '@/models/PushSubscription'
import { initWebPush } from '@/lib/push'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { title = "Reminder", body = "Event starting soon" } = await request.json().catch(()=>({}))
    await dbConnect()
    const subs = await PushSubscriptionModel.find({}).lean()
    const webpush = initWebPush()
    const payload = JSON.stringify({ title, body })
    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh as string, auth: s.auth as string },
          } as any,
          payload,
        ),
      ),
    )
    return NextResponse.json({ success: true, sent: results.filter(r=>r.status==='fulfilled').length, failed: results.filter(r=>r.status==='rejected').length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Broadcast failed' }, { status: 500 })
  }
}

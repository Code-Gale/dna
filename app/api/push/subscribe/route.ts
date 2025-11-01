import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { PushSubscriptionModel } from '@/models/PushSubscription'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { endpoint, keys } = body || {}
    if (!endpoint || !keys?.p256dh || !keys?.auth) return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    await dbConnect()
    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint },
      { endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent: request.headers.get('user-agent') || '' },
      { upsert: true },
    )
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Subscribe failed' }, { status: 500 })
  }
}

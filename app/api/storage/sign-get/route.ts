import { NextResponse } from 'next/server'
import { getMinio } from '@/lib/minio'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { key } = await request.json()
    if (!key || typeof key !== 'string') return NextResponse.json({ error: 'key required' }, { status: 400 })
    const { client, bucket } = getMinio()
    const url = await client.presignedGetObject(bucket, key, 60 * 60)
    return NextResponse.json({ url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'signing failed' }, { status: 500 })
  }
}

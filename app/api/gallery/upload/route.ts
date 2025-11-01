import { NextResponse } from 'next/server'
import { getMinio } from '@/lib/minio'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as unknown as File
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

    const buf = Buffer.from(await file.arrayBuffer())
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
    const key = `gallery/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
    const { client, bucket } = getMinio()

    // ensure bucket exists
    try { await client.makeBucket(bucket, '') } catch {}

    await client.putObject(bucket, key, buf, buf.length, { 'Content-Type': file.type || 'application/octet-stream' })

    return NextResponse.json({ success: true, key })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}

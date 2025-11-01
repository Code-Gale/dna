import { NextResponse } from 'next/server'
import { getMinio } from '@/lib/minio'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { client, bucket } = getMinio()
    const stream = client.listObjectsV2(bucket, 'gallery/', true)
    const items: any[] = []
    for await (const obj of stream as any) {
      if (!obj?.name) continue
      const url = await client.presignedGetObject(bucket, obj.name, 60 * 60) // 1h
      items.push({ key: obj.name, size: obj.size, url })
    }
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'List failed' }, { status: 500 })
  }
}

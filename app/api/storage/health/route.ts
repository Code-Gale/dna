import { NextResponse } from 'next/server'
import { getMinio } from '@/lib/minio'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { client, bucket } = getMinio()
    let exists = false
    try { exists = await client.bucketExists(bucket) } catch {}
    const region = (await (client as any).getBucketRegion?.(bucket).catch(()=>'')) || ''
    return NextResponse.json({ ok: true, bucket, exists, region })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'MinIO not configured' }, { status: 500 })
  }
}

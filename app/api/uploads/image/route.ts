import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as unknown as File
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

    const buf = Buffer.from(await file.arrayBuffer())
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'outfit')
    await fs.mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, name)
    await fs.writeFile(filePath, buf)

    const url = `/uploads/outfit/${name}`
    return NextResponse.json({ url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'upload failed' }, { status: 500 })
  }
}

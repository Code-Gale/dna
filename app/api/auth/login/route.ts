import { NextResponse } from 'next/server'
import { signAdminJWT } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const ok = email === (process.env.ADMIN_EMAIL || 'admin@example.com') && password === (process.env.ADMIN_PASSWORD || 'admin123')
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  const token = await signAdminJWT({ sub: email, role: 'admin' })
  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 })
  return res
}

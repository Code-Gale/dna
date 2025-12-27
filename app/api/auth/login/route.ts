import { NextResponse } from 'next/server'
import { signAdminJWT } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    const ok = email === adminEmail && password === adminPassword
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const token = await signAdminJWT({ sub: email, role: 'admin' })
    const res = NextResponse.json({ success: true })
    
    // Set cookie with proper settings for production
    const isProduction = process.env.NODE_ENV === 'production'
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return res
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

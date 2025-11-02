import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminJWT } from './lib/auth'

const ADMIN_API_PATHS = [
  '/api/tickets/list',
  '/api/tickets/resend',
  '/api/tickets/resend-by-email',
  '/api/settings/update',
  '/api/push/broadcast',
  '/api/reminders/send',
  '/api/awards/categories',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const needsAuth = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
    || ADMIN_API_PATHS.some((p)=> pathname.startsWith(p))

  if (!needsAuth) return NextResponse.next()

  const token = request.cookies.get('admin_token')?.value
  if (!token) return NextResponse.redirect(new URL('/admin/login', request.url))
  try {
    await verifyAdminJWT(token)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/tickets/:path*', '/api/settings/:path*', '/api/awards/:path*']
}

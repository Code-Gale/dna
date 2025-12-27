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
  try {
    const { pathname } = request.nextUrl

    // Allow login page and public API routes
    if (pathname.startsWith('/admin/login')) {
      return NextResponse.next()
    }

    // Check if route needs authentication
    const needsAuth = pathname.startsWith('/admin') 
      || ADMIN_API_PATHS.some((p) => pathname.startsWith(p))

    if (!needsAuth) {
      return NextResponse.next()
    }

    // Check for admin token
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Verify token
    try {
      await verifyAdminJWT(token)
      return NextResponse.next()
    } catch (error) {
      // Token invalid or expired
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  } catch (error) {
    // Log error in production for debugging
    console.error('Middleware error:', error)
    // Don't block the request, but redirect to login as fallback
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/tickets/:path*',
    '/api/settings/:path*',
    '/api/awards/:path*',
    '/api/push/:path*',
    '/api/reminders/:path*'
  ]
}

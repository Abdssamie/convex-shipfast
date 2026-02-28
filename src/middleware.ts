import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

/**
 * Middleware for handling authentication redirects.
 * 
 * SECURITY NOTE: This middleware uses cookie-based checks for optimistic redirects only.
 * It does NOT validate sessions - that must be done in each protected page/route.
 * See: https://www.better-auth.com/docs/integrations/next#auth-protection
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Legacy redirects - maintain backward compatibility
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  
  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/sign-up', request.url))
  }
  
  // Check for session cookie (optimistic check only - not secure validation)
  const sessionCookie = getSessionCookie(request)
  
  // Protected routes - require session cookie
  const isProtectedRoute = pathname.startsWith('/dashboard')
  
  // Auth routes - redirect if session cookie exists
  const isAuthRoute = ['/sign-in', '/sign-up', '/forgot-password'].some(
    (route) => pathname.startsWith(route)
  )
  
  // Redirect unauthenticated users from protected routes to sign-in
  if (isProtectedRoute && !sessionCookie) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  // Redirect authenticated users from auth pages to dashboard
  if (isAuthRoute && sessionCookie) {
    const redirectTo = request.nextUrl.searchParams.get('redirect')
    const dashboardUrl = new URL(redirectTo || '/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico, sitemap.xml, robots.txt (static files)
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

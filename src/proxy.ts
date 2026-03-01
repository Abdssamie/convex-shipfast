import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let ratelimiter: Ratelimit | undefined | null = undefined

function getRateLimiter() {
  if (ratelimiter !== undefined) return ratelimiter

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      'Upstash Redis credentials are not set. Rate limiting is disabled.'
    )
    ratelimiter = null
    return null
  }

  ratelimiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit',
  })

  return ratelimiter
}

/**
 * Proxy for handling authentication redirects and rate limiting.
 * 
 * SECURITY NOTE: This proxy uses cookie-based checks for optimistic redirects only.
 * It does NOT validate sessions - that must be done in each protected page/route.
 * See: https://www.better-auth.com/docs/integrations/next#auth-protection
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Legacy redirects - maintain backward compatibility
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  
  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/sign-up', request.url))
  }
  
  // Protected routes - require session cookie
  const isProtectedRoute = pathname.startsWith('/dashboard')
  const isOnboardingRoute = pathname.startsWith('/onboarding')
  
  // Apply rate limiting only on protected routes
  if (isProtectedRoute) {
    const limiter = getRateLimiter()
    if (limiter) {
      const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
      try {
        const { success } = await limiter.limit(ip)
        if (!success) {
          return new NextResponse('Too Many Requests', { status: 429 })
        }
      } catch (error) {
        console.error('Rate limiting error:', error)
      }
    }
  }
  
  // Check for session cookie (optimistic check only - not secure validation)
  const sessionCookie = getSessionCookie(request)
  
  // Email verification routes - accessible to all authenticated users
  const isVerificationRoute = pathname.startsWith('/verify-email')
  
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
  
  // Allow onboarding route for authenticated users
  if (isOnboardingRoute && sessionCookie) {
    return NextResponse.next()
  }
  
  // Allow verification routes for authenticated users (don't redirect to dashboard)
  if (isVerificationRoute && sessionCookie) {
    return NextResponse.next()
  }
  
  // Redirect authenticated users from auth pages to onboarding or dashboard
  if (isAuthRoute && sessionCookie) {
    const redirectTo = request.nextUrl.searchParams.get('redirect')
    const dashboardUrl = new URL(redirectTo || '/onboarding', request.url)
    return NextResponse.redirect(dashboardUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)',
  ],
}

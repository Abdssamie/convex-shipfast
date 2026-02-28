import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Check if Upstash is configured
const isUpstashConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN

// Initialize Redis client only if configured
const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// Rate limiter for authentication endpoints (login/signup)
// 5 requests per 15 minutes
export const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null

// Rate limiter for password reset endpoints
// 3 requests per hour
export const passwordResetLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: true,
      prefix: "ratelimit:password-reset",
    })
  : null

// Rate limiter for general API calls
// 100 requests per minute
export const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:api",
    })
  : null

// Helper function to check rate limit
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // If rate limiting is not configured, allow all requests
  if (!limiter) {
    return { success: true }
  }

  try {
    const result = await limiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    // If rate limiting fails, log the error and allow the request
    console.error("Rate limiting error:", error)
    return { success: true }
  }
}

// Export type for rate limit result
export type RateLimitResult = Awaited<ReturnType<typeof checkRateLimit>>

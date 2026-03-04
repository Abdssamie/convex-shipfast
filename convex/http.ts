import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./features/auth/auth";
import { polar } from "./polar";
import { checkRateLimit, authLimiter } from "./rateLimit";

const http = httpRouter();

// Rate-limited auth endpoints
const RATE_LIMITED_PATHS = [
  "/api/auth/sign-in/email",
  "/api/auth/sign-up/email",
  "/api/auth/forget-password",
  "/api/auth/reset-password",
];

// Create a wrapper for the http router to add rate limiting
const createRateLimitedRouter = () => {
  const originalRoute = http.route.bind(http);
  
  // Override the route method to add rate limiting middleware
  (http as any).route = function (options: any) {
    const originalHandler = options.handler;
    
    // Check if this is a rate-limited auth endpoint
    const isRateLimited = RATE_LIMITED_PATHS.some((path) =>
      options.path?.includes(path)
    );

    if (isRateLimited && originalHandler) {
      options.handler = async (request: Request) => {
        // Extract IP address from request headers
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          request.headers.get("x-real-ip") ||
          "unknown";

        // Check rate limit
        const rateLimitResult = await checkRateLimit(authLimiter, ip);

        if (!rateLimitResult.success) {
          return new Response(
            JSON.stringify({
              error: "Too many requests",
              message: "You have exceeded the rate limit. Please try again later.",
              retryAfter: rateLimitResult.reset 
                ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
                : 900,
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "X-RateLimit-Limit": rateLimitResult.limit?.toString() || "5",
                "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "0",
                ...(rateLimitResult.reset && {
                  "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
                  "Retry-After": Math.ceil(
                    (rateLimitResult.reset - Date.now()) / 1000
                  ).toString(),
                }),
              },
            }
          );
        }

        // Rate limit passed, proceed with original handler
        return originalHandler(request);
      };
    }

    return originalRoute.call(this, options);
  };
  
  return http;
};

// Apply rate limiting wrapper
createRateLimitedRouter();

authComponent.registerRoutes(http, createAuth);
// Type assertion needed: Polar's registerRoutes expects HttpRouter but auth component
// modifies the router type. This is safe as both use the same underlying httpRouter.
polar.registerRoutes(http as any);

export default http;

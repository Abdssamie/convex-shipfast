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

type RouteOptions = Parameters<typeof http.route>[0];
type RouteHandler =
  NonNullable<RouteOptions["handler"]> &
  ((request: Request) => Promise<Response>);

// Create a wrapper for the http router to add rate limiting
const createRateLimitedRouter = () => {
  const originalRoute = http.route.bind(http);

  const wrapHandler = (handler: RouteHandler): RouteHandler => {
    const wrapped = async (request: Request) => {
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
      return handler(request);
    };

    return Object.assign(wrapped, { isHttp: true as const });
  };

  // Override the route method to add rate limiting middleware
  const rateLimitedRoute: typeof http.route = (options: RouteOptions) => {
    // Check if this is a rate-limited auth endpoint
    const routePath = "path" in options ? options.path : options.pathPrefix;
    const isRateLimited = RATE_LIMITED_PATHS.some((path) =>
      routePath.includes(path)
    );

    const nextOptions: RouteOptions =
      isRateLimited && options.handler
        ? { ...options, handler: wrapHandler(options.handler as RouteHandler) }
        : options;

    return originalRoute(nextOptions);
  };

  http.route = rateLimitedRoute;

  return http;
};

// Apply rate limiting wrapper
createRateLimitedRouter();

authComponent.registerRoutes(http, createAuth);
// Type assertion needed: Polar's registerRoutes expects HttpRouter but auth component
// modifies the router type. This is safe as both use the same underlying httpRouter.
polar.registerRoutes(http as any);

export default http;

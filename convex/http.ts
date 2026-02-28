import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./features/auth/auth";
import { polar } from "./polar";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);
// Type assertion needed: Polar's registerRoutes expects HttpRouter but auth component
// modifies the router type. This is safe as both use the same underlying httpRouter.
polar.registerRoutes(http as any);

export default http;

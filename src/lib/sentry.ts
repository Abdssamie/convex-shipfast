"use client";

interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
}

interface SentryBreadcrumb {
  type?: string;
  category?: string;
  message?: string;
  level?: "fatal" | "error" | "warning" | "info" | "debug";
  timestamp?: number;
  data?: Record<string, unknown>;
}

interface SentryContext {
  [key: string]: unknown;
}

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development";
const isEnabled = typeof window !== "undefined" && SENTRY_DSN && SENTRY_DSN.length > 0;

// Store breadcrumbs in memory
const breadcrumbs: SentryBreadcrumb[] = [];
const MAX_BREADCRUMBS = 100;

// Store user context
let currentUser: SentryUser | null = null;

// Sample rates for production
const TRACES_SAMPLE_RATE = SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0;
const REPLAYS_SESSION_SAMPLE_RATE = SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0;
const REPLAYS_ON_ERROR_SAMPLE_RATE = SENTRY_ENVIRONMENT === "production" ? 1.0 : 1.0;

function getSentryEndpoint(dsn: string): string {
  const match = dsn.match(/^https:\/\/([^@]+)@([^/]+)\/(.+)$/);
  if (!match) {
    console.error("Invalid Sentry DSN format");
    return "";
  }
  const [, key, host, projectId] = match;
  return `https://${host}/api/${projectId}/store/`;
}

function getSentryAuth(dsn: string): string {
  const match = dsn.match(/^https:\/\/([^@]+)@/);
  if (!match) return "";
  return `Sentry sentry_version=7, sentry_key=${match[1]}, sentry_client=custom-client/1.0.0`;
}

async function sendToSentry(event: Record<string, unknown>): Promise<void> {
  if (!isEnabled || !SENTRY_DSN) return;

  const endpoint = getSentryEndpoint(SENTRY_DSN);
  if (!endpoint) return;

  const authHeader = getSentryAuth(SENTRY_DSN);

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": authHeader,
      },
      body: JSON.stringify(event),
    });
  } catch (e) {
    // Silently fail to avoid infinite loops
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to send to Sentry:", e);
    }
  }
}

function createBaseEvent(): Record<string, unknown> {
  return {
    platform: "javascript",
    environment: SENTRY_ENVIRONMENT,
    timestamp: Date.now() / 1000,
    breadcrumbs: breadcrumbs.slice(-MAX_BREADCRUMBS),
    user: currentUser || undefined,
    contexts: {
      browser: {
        name: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        version: typeof navigator !== "undefined" ? navigator.appVersion : undefined,
      },
      runtime: {
        name: "browser",
      },
    },
    tags: {
      environment: SENTRY_ENVIRONMENT,
    },
  };
}

export function addBreadcrumb(breadcrumb: SentryBreadcrumb): void {
  if (!isEnabled) return;

  const fullBreadcrumb: SentryBreadcrumb = {
    timestamp: Date.now() / 1000,
    level: "info",
    ...breadcrumb,
  };

  breadcrumbs.push(fullBreadcrumb);

  // Keep only the last MAX_BREADCRUMBS
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
}

export function setUser(user: SentryUser | null): void {
  if (!isEnabled) return;
  currentUser = user;
}

export function captureException(
  error: Error,
  context?: SentryContext
): void {
  if (!isEnabled) return;

  const event = {
    ...createBaseEvent(),
    level: "error",
    exception: {
      values: [
        {
          type: error.name || "Error",
          value: error.message,
          stacktrace: error.stack
            ? {
                frames: parseStackTrace(error.stack),
              }
            : undefined,
        },
      ],
    },
    extra: context,
  };

  sendToSentry(event);

  // Add breadcrumb for this exception
  addBreadcrumb({
    type: "error",
    category: "exception",
    message: error.message,
    level: "error",
    data: {
      name: error.name,
    },
  });
}

export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  context?: SentryContext
): void {
  if (!isEnabled) return;

  const event = {
    ...createBaseEvent(),
    level,
    message: {
      formatted: message,
    },
    extra: context,
  };

  sendToSentry(event);

  // Add breadcrumb for this message
  addBreadcrumb({
    type: "default",
    category: "message",
    message,
    level,
  });
}

function parseStackTrace(stack: string): Array<{
  filename: string;
  function: string;
  lineno: number;
  colno: number;
  in_app: boolean;
}> {
  const lines = stack.split("\n").slice(1); // Skip the first line (error message)
  
  const frames = lines
    .map((line) => {
      // Match patterns like "at fe (file:line:col)" or "at file:line:col"
      const match = line.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/);
      
      if (!match) return null;
      
      const [, functionName, filename, lineno, colno] = match;
      
      return {
        filename: filename || "unknown",
        function: functionName || "<anonymous>",
        lineno: parseInt(lineno, 10),
        colno: parseInt(colno, 10),
        in_app: !filename?.includes("node_modules"),
      };
    })
    .filter((frame) => frame !== null);
  
  return frames as Array<{
    filename: string;
    function: string;
    lineno: number;
    colno: number;
    in_app: boolean;
  }>;
}

// Initialize navigation tracking
if (typeof window !== "undefined" && isEnabled) {
  // Track page navigation
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function (...args) {
    addBreadcrumb({
      type: "navigation",
      category: "navigation",
      message: `Navigation to ${args[2]}`,
      data: {
        from: window.location.pathname,
        to: args[2],
      },
    });
    return originalPushState.apply(this, args);
  };

  window.history.replaceState = function (...args) {
    addBreadcrumb({
      type: "navigation",
      category: "navigation",
      message: `Navigation to ${args[2]}`,
      data: {
        from: window.location.pathname,
        to: args[2],
      },
    });
    return originalReplaceState.apply(this, args);
  };

  // Track clicks
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      
      if (tagName === "button" || tagName === "a") {
        addBreadcrumb({
          type: "user",
          category: "ui.click",
          message: `Clicked ${tagName}`,
          data: {
            tag: tagName,
            id: target.id || undefined,
            className: target.className || undefined,
            text: target.textContent?.slice(0, 50) || undefined,
          },
        });
      }
    },
    true
  );

  // Track console errors
  const originalConsoleError = console.error;
  console.error = function (...args) {
    addBreadcrumb({
      type: "default",
      category: "console",
      message: args.join(" "),
      level: "error",
    });
    return originalConsoleError.apply(this, args);
  };
}

// Log initialization status
if (process.env.NODE_ENV === "development") {
  if (isEnabled) {
    console.log(
      `[Sentry] Initialized for ${SENTRY_ENVIRONMENT} environment (sample rate: ${TRACES_SAMPLE_RATE})`
    );
  } else {
    console.log("[Sentry] Not configured - error tracking disabled");
  }
}

export const sentryConfig = {
  isEnabled,
  environment: SENTRY_ENVIRONMENT,
  tracesSampleRate: TRACES_SAMPLE_RATE,
  replaysSessionSampleRate: REPLAYS_SESSION_SAMPLE_RATE,
  replaysOnErrorSampleRate: REPLAYS_ON_ERROR_SAMPLE_RATE,
};

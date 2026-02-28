"use node";

const SENTRY_DSN = process.env.SENTRY_DSN;
const isEnabled = SENTRY_DSN && SENTRY_DSN.length > 0;

function getSentryEndpoint(dsn: string): string {
  const match = dsn.match(/^https:\/\/([^@]+)@.+$/);
  if (!match) throw new Error("Invalid Sentry DSN");
  const projectId = dsn.split("/").pop();
  return `https://${match[1]}/api/${projectId}/store/`;
}

async function sendToSentry(event: Record<string, unknown>) {
  if (!isEnabled || !SENTRY_DSN) return;
  
  const endpoint = getSentryEndpoint(SENTRY_DSN);
  const authHeader = `Sentry ${SENTRY_DSN.split("@")[0]}`;
  
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
    console.error("Failed to send to Sentry:", e);
  }
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!isEnabled) return;
  
  const event = {
    exception: {
      values: [
        {
          type: error.name,
          value: error.message,
          stacktrace: {
            frames: error.stack
              ? error.stack
                  .split("\n")
                  .slice(1)
                  .map((line) => ({
                    filename: line.match(/\((.*):(\d+):(\d+)\)/)?.[1] || "unknown",
                    lineno: parseInt(line.match(/\((.*):(\d+):(\d+)\)/)?.[2] || "0"),
                    colno: parseInt(line.match(/\((.*):(\d+):(\d+)\)/)?.[3] || "0"),
                    function: line.match(/at\s+(.*)/)?.[1] || "unknown",
                  }))
              : [],
          },
        },
      ],
    },
    extra: context,
    environment: process.env.CONVEX_DEPLOYMENT
      ? process.env.CONVEX_DEPLOYMENT.split(":")[0]
      : "development",
    timestamp: Math.floor(Date.now() / 1000),
  };
  
  sendToSentry(event);
}

export function captureMessage(message: string, level: string = "info") {
  if (!isEnabled) return;
  
  const event = {
    message,
    level,
    environment: process.env.CONVEX_DEPLOYMENT
      ? process.env.CONVEX_DEPLOYMENT.split(":")[0]
      : "development",
    timestamp: Math.floor(Date.now() / 1000),
  };
  
  sendToSentry(event);
}

export async function withSentry<T>(
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      captureException(error, context);
    } else {
      captureException(new Error(String(error)), context);
    }
    throw error;
  }
}

export function withSentrySync<T>(
  fn: () => T,
  context?: Record<string, unknown>
): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      captureException(error, context);
    } else {
      captureException(new Error(String(error)), context);
    }
    throw error;
  }
}

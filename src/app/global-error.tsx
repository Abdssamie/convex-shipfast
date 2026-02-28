"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { captureException } from "@/lib/sentry";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Global error:", error);
    }

    // Send to Sentry with global error context
    captureException(error, {
      digest: error.digest,
      errorBoundary: "global",
      level: "fatal",
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Application Error</CardTitle>
              <CardDescription>
                A critical error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {process.env.NODE_ENV === "development" && (
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm font-mono text-muted-foreground break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs font-mono text-muted-foreground mt-2">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={reset} className="w-full">
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                Go home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}

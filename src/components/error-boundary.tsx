"use client";

import React from "react";
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

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={resetError} className="w-full">
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
  );
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // Send to Sentry with component context
    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      react: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

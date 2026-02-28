"use client";

import { ErrorBoundary } from "@/components/error-boundary";

export function RootErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

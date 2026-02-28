import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { inter } from "@/lib/fonts";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { getToken } from "@/lib/auth/server";
import { RootErrorBoundary } from "@/components/root-error-boundary";

export const metadata: Metadata = {
  title: "Shadcn Dashboard",
  description: "A dashboard built with Next.js and shadcn/ui",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let token: string | null = null;
  try {
    token = (await getToken()) ?? null;
  } catch {
    token = null;
  }

  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider initialToken={token}>
          <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
            <SidebarConfigProvider>
              <RootErrorBoundary>
                {children}
              </RootErrorBoundary>
            </SidebarConfigProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

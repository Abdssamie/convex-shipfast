"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer";
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";
import { ErrorBoundary } from "@/components/error-boundary";
import { OnboardingModal } from "@/components/onboarding-modal";
import { useQuery } from "convex/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function RedirectToSignIn() {
  const router = useRouter();
  React.useEffect(() => {
    router.push("/sign-in");
  }, [router]);
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false);
  const { config } = useSidebarConfig();

  const user = useQuery(api.user.getCurrentProfile);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    if (user && user.hasCompletedOnboarding === false) {
      setShowOnboarding(true);
    }
  }, [user]);

  return (
    <ErrorBoundary>
      <AuthLoading>
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
      <Authenticated>
        <SidebarProvider
          style={{
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties}
          className={config.collapsible === "none" ? "sidebar-none-mode" : ""}
        >
          {config.side === "left" ? (
            <>
              <AppSidebar
                variant={config.variant}
                collapsible={config.collapsible}
                side={config.side}
              />
              <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                  <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                      {children}
                    </div>
                  </div>
                </div>
                <SiteFooter />
              </SidebarInset>
            </>
          ) : (
            <>
              <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                  <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                      {children}
                    </div>
                  </div>
                </div>
                <SiteFooter />
              </SidebarInset>
              <AppSidebar
                variant={config.variant}
                collapsible={config.collapsible}
                side={config.side}
              />
            </>
          )}

          {/* Theme Customizer */}
          <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
          <ThemeCustomizer
            open={themeCustomizerOpen}
            onOpenChange={setThemeCustomizerOpen}
          />
          <UpgradeToProButton />

          <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} />
        </SidebarProvider>
      </Authenticated>
    </ErrorBoundary>
  );
}

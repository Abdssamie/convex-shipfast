import { readFileSync } from "node:fs";

test("branding uses site config", () => {
  const brandingFiles = [
    "src/components/site-header.tsx",
    "src/components/site-footer.tsx",
    "src/components/app-sidebar.tsx",
    "src/components/onboarding-modal.tsx",
    "src/components/sidebar-notification.tsx",
    "src/app/(auth)/layout.tsx",
    "src/app/(auth)/sign-in/page.tsx",
    "src/app/(auth)/sign-up/page.tsx",
    "src/app/(auth)/forgot-password/page.tsx",
    "src/app/(auth)/reset-password/page.tsx",
    "src/app/(auth)/reset-password-sent/page.tsx",
    "convex/user.ts",
  ];

  for (const filePath of brandingFiles) {
    const file = readFileSync(filePath, "utf8");
    expect(file).not.toContain("ShadcnStore");
  }
});

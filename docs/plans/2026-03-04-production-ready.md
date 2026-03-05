# Production-Ready Boilerplate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the boilerplate production-ready for internal + public use, with CI, clean branding, a docs framework, and an `npx` scaffold.

**Architecture:** Keep the core app intact while adding a separate docs site (Nextra) and a small CLI package for scaffolding. Fix critical quality issues first, then improve developer onboarding and docs.

**Tech Stack:** Next.js 16, React 19, Convex, Better Auth, Bun, Nextra, GitHub Actions, TypeScript.

---

### Task 1: Fix failing auth email handler tests

**Files:**
- Modify: `convex/features/auth/email.test.ts`

**Step 1: Write the failing test**

Update existing expectations to the current template params.

```ts
expect(sendEmailSpy).toHaveBeenCalledWith({
  flow: "email_verification",
  to: { email: "test@test.com", name: "Test User" },
  params: {
    verificationUrl: "http://verify",
    email: "test@test.com",
    name: "Test User",
  },
  tags: ["better-auth", "email-verification"],
});
```

**Step 2: Run test to verify it fails**

Run: `bun test convex/features/auth/email.test.ts`
Expected: FAIL with previous param names (`url`, `inviteLink`).

**Step 3: Write minimal implementation**

Update all expectations to match the actual payload keys:

- `verificationUrl`, `resetUrl`, `magicLink`
- invitation payload: `inviteUrl`, `inviterName`, `appName`

**Step 4: Run test to verify it passes**

Run: `bun test convex/features/auth/email.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add convex/features/auth/email.test.ts
git commit -m "test(auth): align email handler params"
```

---

### Task 2: Remove `any` in Convex HTTP rate limiting wrapper

**Files:**
- Modify: `convex/http.ts`

**Step 1: Write the failing test**

Add a TypeScript-only check by running typecheck after changes.

**Step 2: Run test to verify it fails**

Run: `bun typecheck`
Expected: FAIL while `any` remains.

**Step 3: Write minimal implementation**

Replace `any` with typed helpers:

```ts
type RouteOptions = Parameters<typeof http.route>[0];
type RouteHandler = NonNullable<RouteOptions["handler"]>;

const wrapHandler = (handler: RouteHandler): RouteHandler => {
  return async (request: Request) => {
    // existing rate limit logic
    return handler(request);
  };
};

const rateLimitedRoute: typeof http.route = (options: RouteOptions) => {
  const isRateLimited = RATE_LIMITED_PATHS.some((path) =>
    options.path?.includes(path)
  );

  const nextOptions: RouteOptions =
    isRateLimited && options.handler
      ? { ...options, handler: wrapHandler(options.handler) }
      : options;

  return originalRoute(nextOptions);
};

http.route = rateLimitedRoute;
```

Remove `(http as any)` and `options: any` usage.

**Step 4: Run test to verify it passes**

Run: `bun typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add convex/http.ts
git commit -m "refactor(convex): type safe rate limit wrapper"
```

---

### Task 3: Replace `any` in Brevo email client

**Files:**
- Modify: `convex/features/email/brevo.ts`

**Step 1: Write the failing test**

Add a new unit test to cover JSON parse failures returning empty body without throwing.

```ts
// in convex/features/email/brevo.test.ts
test("sendBrevoTemplate handles invalid JSON", async () => {
  // mock fetch to return invalid JSON
  // expect ok() to still resolve without throwing
});
```

**Step 2: Run test to verify it fails**

Run: `bun test convex/features/email/brevo.test.ts`
Expected: FAIL (test missing + behavior not implemented).

**Step 3: Write minimal implementation**

Use `unknown` and narrow types:

```ts
type BrevoResponseBody = { message?: string; messageIds?: string[] };

const parseBrevoJson = async (response: Response): Promise<BrevoResponseBody | null> => {
  try {
    return (await response.json()) as BrevoResponseBody;
  } catch {
    return null;
  }
};

let lastError: unknown;
```

Replace `body: any` with `const body = await parseBrevoJson(response);` and guard with `body && typeof body === "object"`.

**Step 4: Run test to verify it passes**

Run: `bun test convex/features/email/brevo.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add convex/features/email/brevo.ts convex/features/email/brevo.test.ts
git commit -m "test(email): type-safe Brevo response parsing"
```

---

### Task 4: Add Convex-side logger and remove direct console.warn usage

**Files:**
- Create: `convex/lib/logger.ts`
- Modify: `convex/features/auth/email.ts`
- Modify: `convex/features/email/betterAuth.ts`

**Step 1: Write the failing test**

Extend the existing auth email handler test to verify logger is called instead of `console.warn`.

```ts
// convex/features/auth/email.test.ts
const loggerWarnSpy = spyOn(logger, "warn");
expect(loggerWarnSpy).toHaveBeenCalled();
```

**Step 2: Run test to verify it fails**

Run: `bun test convex/features/auth/email.test.ts`
Expected: FAIL (logger not used).

**Step 3: Write minimal implementation**

Create a tiny logger with typed methods:

```ts
export const logger = {
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn(message, meta);
    }
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "test") {
      console.error(message, meta);
    }
  },
};
```

Update call sites to use `logger.warn`.

**Step 4: Run test to verify it passes**

Run: `bun test convex/features/auth/email.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add convex/lib/logger.ts convex/features/auth/email.ts convex/features/email/betterAuth.ts convex/features/auth/email.test.ts
git commit -m "refactor(convex): centralize auth email logging"
```

---

### Task 5: Remove hardcoded demo credentials in archived auth UIs

**Files:**
- Modify: `src/app/_archive/auth/sign-in-2/components/login-form-2.tsx`
- Modify: `src/app/_archive/auth/sign-in-3/components/login-form-3.tsx`

**Step 1: Write the failing test**

Add a simple static test to assert no demo credentials remain.

```ts
// tests/no-demo-credentials.test.ts
import { readFileSync } from "node:fs";

test("no hardcoded demo credentials", () => {
  const file = readFileSync("src/app/_archive/auth/sign-in-3/components/login-form-3.tsx", "utf8");
  expect(file).not.toContain("test@example.com");
  expect(file).not.toContain("password");
});
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/no-demo-credentials.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Remove `defaultValue` usage and keep placeholders generic.

**Step 4: Run test to verify it passes**

Run: `bun test tests/no-demo-credentials.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/_archive/auth/sign-in-2/components/login-form-2.tsx src/app/_archive/auth/sign-in-3/components/login-form-3.tsx tests/no-demo-credentials.test.ts
git commit -m "test(auth): remove demo credentials in archived forms"
```

---

### Task 6: Centralize app branding config and replace "ShadcnStore"

**Files:**
- Create: `src/config/site.ts`
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/components/app-sidebar.tsx`
- Modify: `src/components/onboarding-modal.tsx`
- Modify: `src/components/sidebar-notification.tsx`
- Modify: `src/app/(auth)/layout.tsx`
- Modify: `src/app/(auth)/sign-in/page.tsx`
- Modify: `src/app/(auth)/sign-up/page.tsx`
- Modify: `src/app/(auth)/forgot-password/page.tsx`
- Modify: `src/app/(auth)/reset-password/page.tsx`
- Modify: `src/app/(auth)/reset-password-sent/page.tsx`
- Modify: `convex/user.ts`

**Step 1: Write the failing test**

Add a static test to ensure no "ShadcnStore" remains in non-archive app paths.

```ts
// tests/no-shadcnstore-branding.test.ts
import { readFileSync } from "node:fs";

test("branding uses site config", () => {
  const file = readFileSync("src/components/site-header.tsx", "utf8");
  expect(file).not.toContain("ShadcnStore");
});
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/no-shadcnstore-branding.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `src/config/site.ts`:

```ts
export const siteConfig = {
  name: "Convex ShipFast",
  tagline: "Production-ready SaaS boilerplate",
} as const;
```

Replace all hardcoded branding in the listed files with `siteConfig.name` (and `tagline` if needed).

**Step 4: Run test to verify it passes**

Run: `bun test tests/no-shadcnstore-branding.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/config/site.ts src/components/site-header.tsx src/components/site-footer.tsx src/components/app-sidebar.tsx src/components/onboarding-modal.tsx src/components/sidebar-notification.tsx src/app/(auth)/layout.tsx src/app/(auth)/sign-in/page.tsx src/app/(auth)/sign-up/page.tsx src/app/(auth)/forgot-password/page.tsx src/app/(auth)/reset-password/page.tsx src/app/(auth)/reset-password-sent/page.tsx convex/user.ts tests/no-shadcnstore-branding.test.ts
git commit -m "feat(branding): centralize app name"
```

---

### Task 7: Add CI workflow (lint, typecheck, tests)

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Write the failing test**

Add the workflow file with placeholder commands that will fail until updated.

**Step 2: Run test to verify it fails**

Run: `act -j ci` (if available) or rely on GitHub to fail.
Expected: FAIL (placeholder step).

**Step 3: Write minimal implementation**

Add Bun-based CI steps:

```yaml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: "latest"
- run: bun install
- run: bun lint
- run: bun typecheck
- run: bun test
```

**Step 4: Run test to verify it passes**

Run: `act -j ci` (if available)
Expected: PASS

**Step 5: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint typecheck and tests"
```

---

### Task 8: Add Nextra docs app skeleton

**Files:**
- Create: `apps/docs/package.json`
- Create: `apps/docs/next.config.mjs`
- Create: `apps/docs/theme.config.tsx`
- Create: `apps/docs/pages/_app.tsx`
- Create: `apps/docs/pages/index.mdx`
- Create: `apps/docs/pages/setup.mdx`
- Create: `apps/docs/pages/customization.mdx`
- Create: `apps/docs/pages/deployment.mdx`
- Create: `apps/docs/pages/faq.mdx`

**Step 1: Write the failing test**

Add a docs build script and run it before dependencies exist.

**Step 2: Run test to verify it fails**

Run: `bun --cwd apps/docs build`
Expected: FAIL (missing config/deps).

**Step 3: Write minimal implementation**

Add Nextra dependencies and minimal config:

```js
// apps/docs/next.config.mjs
import nextra from "nextra";

const withNextra = nextra({ theme: "nextra-theme-docs" });
export default withNextra({ reactStrictMode: true });
```

Create a basic `theme.config.tsx` with site name and docs nav.

**Step 4: Run test to verify it passes**

Run: `bun --cwd apps/docs install && bun --cwd apps/docs build`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/docs
git commit -m "docs: add Nextra docs app"
```

---

### Task 9: Migrate existing docs into Nextra and remove raw md docs

**Files:**
- Modify: `apps/docs/pages/setup.mdx`
- Modify: `apps/docs/pages/customization.mdx`
- Modify: `apps/docs/pages/deployment.mdx`
- Modify: `apps/docs/pages/faq.mdx`
- Create: `apps/docs/pages/integrations/brevo.mdx`
- Create: `apps/docs/pages/integrations/polar.mdx`
- Delete: `docs/BREVO_SETUP.md`
- Delete: `docs/POLAR_SETUP.md`

**Step 1: Write the failing test**

Add a docs link check by grepping for removed files in README (will fail until updated).

**Step 2: Run test to verify it fails**

Run: `bun --cwd apps/docs build`
Expected: FAIL (missing pages or content).

**Step 3: Write minimal implementation**

Port content from the existing markdown into MDX pages and add sidebar links in `theme.config.tsx`.

**Step 4: Run test to verify it passes**

Run: `bun --cwd apps/docs build`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/docs docs/BREVO_SETUP.md docs/POLAR_SETUP.md
git commit -m "docs: migrate setup guides into Nextra"
```

---

### Task 10: Update root README and add docs scripts

**Files:**
- Modify: `README.md`
- Modify: `package.json`

**Step 1: Write the failing test**

Add a README section that references the new docs command but leave scripts missing.

**Step 2: Run test to verify it fails**

Run: `bun run docs:dev`
Expected: FAIL (missing script).

**Step 3: Write minimal implementation**

Add scripts:

```json
"docs:dev": "bun --cwd apps/docs dev",
"docs:build": "bun --cwd apps/docs build"
```

Update README to include:

- `npx convex-shipfast` command
- docs dev command
- note that marketing site lives in `convex-shipfast-marketing`

**Step 4: Run test to verify it passes**

Run: `bun run docs:dev`
Expected: starts docs dev server

**Step 5: Commit**

```bash
git add README.md package.json
git commit -m "docs: add docs scripts and README links"
```

---

### Task 11: Add `npx` scaffold CLI package

**Files:**
- Create: `packages/create-convex-shipfast/package.json`
- Create: `packages/create-convex-shipfast/tsconfig.json`
- Create: `packages/create-convex-shipfast/src/index.ts`
- Create: `packages/create-convex-shipfast/src/scaffold.ts`
- Create: `packages/create-convex-shipfast/src/prompts.ts`

**Step 1: Write the failing test**

Add a basic CLI smoke test:

```ts
// packages/create-convex-shipfast/tests/cli.test.ts
import { execa } from "execa";

test("cli prints help", async () => {
  const result = await execa("node", ["dist/index.js", "--help"], { cwd: "packages/create-convex-shipfast" });
  expect(result.stdout).toContain("convex-shipfast");
});
```

**Step 2: Run test to verify it fails**

Run: `bun test packages/create-convex-shipfast/tests/cli.test.ts`
Expected: FAIL (no build, no CLI).

**Step 3: Write minimal implementation**

Create a small TypeScript CLI that:

- prompts for project name, package manager, app name
- uses `degit` to fetch `github:your-org/convex-shipfast` into the target folder
- updates `src/config/site.ts` with the chosen app name
- writes `.env.local` from `.env.example` with placeholders
- prints next steps

Add a build script with `tsup` (or similar) to produce `dist/index.js`.

**Step 4: Run test to verify it passes**

Run: `bun --cwd packages/create-convex-shipfast build && bun test packages/create-convex-shipfast/tests/cli.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/create-convex-shipfast
git commit -m "feat(cli): add npx scaffold tool"
```

---

### Task 12: Wire CLI release notes into README (no release automation)

**Files:**
- Modify: `README.md`

**Step 1: Write the failing test**

Add a short README snippet describing `npx convex-shipfast` usage.

**Step 2: Run test to verify it fails**

Run: `bun test tests/readme-links.test.ts` (add a simple check for the command).
Expected: FAIL

**Step 3: Write minimal implementation**

Add a README section:

```md
## Scaffold a New App

```bash
npx convex-shipfast my-app
```
```

**Step 4: Run test to verify it passes**

Run: `bun test tests/readme-links.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md tests/readme-links.test.ts
git commit -m "docs: document npx scaffold command"
```

---

## Final Verification

- Run: `bun lint`
- Run: `bun typecheck`
- Run: `bun test`
- Run: `bun --cwd apps/docs build`

Expected: all PASS.

---

## Notes

- Marketing site work stays in `convex-shipfast-marketing`.
- No release automation or changelog work is included.

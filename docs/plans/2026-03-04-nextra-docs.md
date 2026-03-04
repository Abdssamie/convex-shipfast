# Nextra Docs App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a standalone Nextra docs app in `docs/` using the pages router, remove legacy markdown docs from the docs root, and keep `docs/plans` for internal design/plan documents.

**Architecture:** A separate Next.js + Nextra app lives under `docs/` with its own config and dependencies. The root app remains unchanged and builds independently. Docs are static MDX pages with no runtime data fetching.

**Tech Stack:** Next.js (pages router), Nextra, React, TypeScript, Bun.

---

### Task 1: Scaffold the Nextra docs app

**Files:**
- Delete: `docs/BREVO_SETUP.md`
- Delete: `docs/POLAR_SETUP.md`
- Create: `docs/package.json`
- Create: `docs/next.config.mjs`
- Create: `docs/tsconfig.json`
- Create: `docs/next-env.d.ts`
- Create: `docs/theme.config.tsx`
- Create: `docs/pages/_app.tsx`

**Step 1: Write the failing test**

No automated tests are appropriate for docs scaffolding. Skip to build verification.

**Step 2: Run test to verify it fails**

Skip (no tests).

**Step 3: Write minimal implementation**

```json
{
  "name": "convex-shipfast-docs",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "nextra": "3.0.15",
    "nextra-theme-docs": "3.0.15",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/react": "18.3.1",
    "@types/react-dom": "18.3.1",
    "typescript": "5.5.4"
  }
}
```

```js
import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

export default withNextra({
  reactStrictMode: true,
});
```

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.mdx"],
  "exclude": ["node_modules"]
}
```

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

```tsx
import type { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  project: {
    link: "https://example.com",
  },
  chat: {
    link: "https://example.com",
  },
  docsRepositoryBase: "https://example.com",
  footer: {
    text: "Docs",
  },
};

export default config;
```

```tsx
import "nextra-theme-docs/style.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

**Step 4: Run build to verify it passes**

Run: `bun --cwd docs install`
Expected: dependencies install successfully.

Run: `bun --cwd docs build`
Expected: build completes without errors.

**Step 5: Commit**

```bash
git add docs/package.json docs/next.config.mjs docs/tsconfig.json docs/next-env.d.ts docs/theme.config.tsx docs/pages/_app.tsx docs/BREVO_SETUP.md docs/POLAR_SETUP.md
git commit -m "docs: scaffold Nextra app"
```

### Task 2: Add initial docs pages

**Files:**
- Create: `docs/pages/index.mdx`
- Create: `docs/pages/setup.mdx`
- Create: `docs/pages/customization.mdx`
- Create: `docs/pages/deployment.mdx`
- Create: `docs/pages/faq.mdx`

**Step 1: Write the failing test**

No automated tests for static content. Skip to build verification.

**Step 2: Run test to verify it fails**

Skip (no tests).

**Step 3: Write minimal implementation**

```mdx
# Convex ShipFast

Welcome to the Convex ShipFast docs.

## Get started

- [Setup](/setup)
- [Customization](/customization)
- [Deployment](/deployment)
```

```mdx
# Setup

Step-by-step setup guidance will live here.
```

```mdx
# Customization

Notes on branding, layout, and configuration go here.
```

```mdx
# Deployment

Deployment instructions go here.
```

```mdx
# FAQ

Answers to common questions go here.
```

**Step 4: Run build to verify it passes**

Run: `bun --cwd docs build`
Expected: build completes without errors.

**Step 5: Commit**

```bash
git add docs/pages/index.mdx docs/pages/setup.mdx docs/pages/customization.mdx docs/pages/deployment.mdx docs/pages/faq.mdx
git commit -m "docs: add initial docs pages"
```

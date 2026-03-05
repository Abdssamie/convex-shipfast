# Scaffold, Docs Scripts, and README Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an `npx` scaffold package, update root README, add docs scripts to root `package.json`, and ignore docs build artifacts.

**Architecture:** A minimal CLI in `packages/create-convex-shipfast` uses `degit` to copy the template into a target directory, then creates `.env.local` from `.env.example` if present. Root scripts and README link to the docs app.

**Tech Stack:** Node.js (ESM), degit, Bun, Next.js (docs app).

---

### Task 1: Ignore docs build artifacts

**Files:**
- Modify: `.gitignore`

**Step 1: Write the failing test**

No automated tests for `.gitignore` changes.

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

Add:
```
docs/.next/
docs/node_modules/
```

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

```bash
git add .gitignore
git commit -m "chore(docs): ignore build artifacts"
```

### Task 2: Add docs scripts to root package.json

**Files:**
- Modify: `package.json`

**Step 1: Write the failing test**

No automated tests for script additions.

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

Add scripts:
```json
"docs:dev": "bun --cwd docs dev",
"docs:build": "bun --cwd docs build"
```

**Step 4: Run test to verify it passes**

Run: `bun run docs:build`
Expected: docs build completes without errors.

**Step 5: Commit**

```bash
git add package.json
git commit -m "chore(docs): add docs scripts"
```

### Task 3: Add create-convex-shipfast package

**Files:**
- Create: `packages/create-convex-shipfast/package.json`
- Create: `packages/create-convex-shipfast/src/index.ts`
- Create: `packages/create-convex-shipfast/tsconfig.json`
- Create: `packages/create-convex-shipfast/README.md`
- Create: `packages/create-convex-shipfast/.gitignore`
- Test: `packages/create-convex-shipfast/src/index.test.ts`

**Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { parseArgs } from "./index";

test("parseArgs returns target directory", () => {
  const result = parseArgs(["my-app"]);
  expect(result.targetDir).toBe("my-app");
});
```

**Step 2: Run test to verify it fails**

Run: `bun test packages/create-convex-shipfast/src/index.test.ts`
Expected: FAIL with "parseArgs is not defined".

**Step 3: Write minimal implementation**

`packages/create-convex-shipfast/package.json`
```json
{
  "name": "create-convex-shipfast",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "bin": {
    "create-convex-shipfast": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "bun test"
  },
  "dependencies": {
    "degit": "2.8.4"
  },
  "devDependencies": {
    "@types/node": "^25.0.3",
    "typescript": "^5.9.3",
    "vitest": "^4.0.18"
  }
}
```

`packages/create-convex-shipfast/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

`packages/create-convex-shipfast/src/index.ts`
```ts
#!/usr/bin/env node
import degit from "degit";
import { existsSync } from "node:fs";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";

type ArgsResult = {
  targetDir: string;
};

export const parseArgs = (args: string[]): ArgsResult => {
  const targetDir = args[0] ?? "convex-shipfast";
  return { targetDir };
};

const run = async (): Promise<void> => {
  const { targetDir } = parseArgs(process.argv.slice(2));
  const fullPath = path.resolve(process.cwd(), targetDir);

  if (existsSync(fullPath)) {
    throw new Error(`Target directory already exists: ${targetDir}`);
  }

  await mkdir(fullPath, { recursive: true });
  const emitter = degit("abdssamie/convex-shipfast", { force: true });
  await emitter.clone(fullPath);

  const envExample = path.join(fullPath, ".env.example");
  const envLocal = path.join(fullPath, ".env.local");
  if (existsSync(envExample) && !existsSync(envLocal)) {
    await copyFile(envExample, envLocal);
  }
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
```

`packages/create-convex-shipfast/src/index.test.ts`
```ts
import { expect, test } from "vitest";
import { parseArgs } from "./index";

test("parseArgs returns target directory", () => {
  const result = parseArgs(["my-app"]);
  expect(result.targetDir).toBe("my-app");
});
```

`packages/create-convex-shipfast/README.md`
```md
# create-convex-shipfast

Scaffold a new Convex ShipFast project.

```bash
npx create-convex-shipfast my-app
```
```

`packages/create-convex-shipfast/.gitignore`
```
dist/
```

**Step 4: Run test to verify it passes**

Run: `bun test packages/create-convex-shipfast/src/index.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/create-convex-shipfast
git commit -m "feat: add create-convex-shipfast scaffold"
```

### Task 4: Update root README

**Files:**
- Modify: `README.md`

**Step 1: Write the failing test**

No automated tests for README updates.

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

Add a quickstart section with:
- `npx create-convex-shipfast my-app`
- docs link (`/docs` instructions)
- marketing site note (separate repo)

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update README quickstart"
```

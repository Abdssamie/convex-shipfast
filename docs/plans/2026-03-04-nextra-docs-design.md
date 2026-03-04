# Nextra Docs App (pages router) Design

## Goal
Add a standalone Nextra docs app under `docs/` using the pages router, remove legacy markdown docs from the docs root, and keep `docs/plans` for internal design/plan documents.

## Architecture
- A separate Next.js + Nextra app located in `docs/` with its own `package.json`, `next.config.mjs`, and `tsconfig.json`.
- The root app remains unchanged and builds independently.

## Structure
- Pages: `docs/pages/index.mdx` plus minimal placeholder pages for setup, customization, deployment, and FAQ.
- Theme config: `docs/theme.config.tsx` defines nav, logo text, and footer.
- `docs/plans` is excluded from navigation and remains internal.

## Data & Configuration
- Static MDX pages only; no runtime data fetching.
- Minimal Nextra configuration in `next.config.mjs`.

## Constraints
- Remove `docs/BREVO_SETUP.md` and `docs/POLAR_SETUP.md` from the docs root.
- Keep `docs/plans` for internal workflow requirements.

## Verification
- Run `bun --cwd docs install` and `bun --cwd docs build`.

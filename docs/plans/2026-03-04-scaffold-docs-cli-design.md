# Remaining Production-Ready Tasks Design

## Goal
Finish the remaining production-readiness tasks: update root README, add docs scripts to root `package.json`, ensure docs build artifacts are ignored, and add an `npx` scaffold package (`packages/create-convex-shipfast`).

## Architecture
- Keep the root app unchanged.
- Add a lightweight CLI in `packages/create-convex-shipfast` that uses `degit` to scaffold the template into a target directory.
- Keep the docs app in `docs/` and provide root-level scripts to run it.

## Components & Data Flow
- CLI prompts for project name/target directory, runs `degit`, and creates `.env.local` from `.env.example` if present.
- Root README includes `npx create-convex-shipfast`, docs link, and marketing site mention.
- Root `package.json` gains `docs:dev` and `docs:build` scripts.
- `.gitignore` adds `docs/.next/` and `docs/node_modules/`.

## Error Handling & Testing
- CLI validates target directory, prevents clobbering, and surfaces `degit` errors clearly.
- Add a minimal CLI test (smoke test for argument parsing or dry-run path) without complex infra.

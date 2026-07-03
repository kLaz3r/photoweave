# PhotoWeave — Agent Instructions

## Setup & Commands

- **Package manager**: `pnpm` only (enforced: `pnpm@10.0.0`)
- **Install**: `pnpm install`
- **Dev server**: `pnpm dev` (Next.js + Turbopack on `localhost:3000`)
- **Full check**: `pnpm check` (runs `next lint` then `tsc --noEmit`)
- **Lint only**: `pnpm lint`, fix: `pnpm lint:fix`
- **Format**: `pnpm format:write` (Prettier + Tailwind plugin)
- **Typecheck**: `pnpm typecheck`
- **Build**: `pnpm build`
- **Env**: Copy `.env.example` → `.env`. `SKIP_ENV_VALIDATION=1` to skip env schema validation at build time (Docker, etc.)

No tests or test runners are wired up yet — Vitest, Playwright, and Storybook are installed as devDependencies but have no configs or test files.

## Architecture

- **T3 Stack**: Next.js 15 (App Router), React 19, Tailwind CSS 4, TypeScript
- **Path alias**: `~/` → `src/`
- **All image processing is client-side only** — images never leave the browser. Web Workers render collages off the main thread (`src/lib/collage/collage-worker.ts`), with main-thread fallback when `OffscreenCanvas` is unavailable.
- **DB**: PostgreSQL via Drizzle ORM (`drizzle-orm` + `postgres`). Schema lives in `src/server/db/schema.ts`. Tables are prefixed `photoweave_*` (configured in `drizzle.config.ts`). The database is **not currently used by the app** — all logic is client-side canvas rendering.
- **Entrypoints**:
  - Landing page: `src/app/page.tsx`
  - Collage editor: `src/app/collage/page.tsx`
  - Root layout: `src/app/layout.tsx`
- **Core runtime files** (modify with care):
  - `src/hooks/useCollage.ts` — central orchestration hook
  - `src/lib/collage/collage-generator.ts` — main rendering pipeline
  - `src/lib/collage/worker-bridge.ts` — worker lifecycle + fallback
  - `src/lib/collage/layouts/masonry.ts` + `grid.ts` — layout algorithms
  - `src/lib/theme.ts` — Zustand theme store (`useThemeStore`)
- Theme uses `data-theme` attribute on `<html>` + CSS variables (see `src/styles/globals.css`).

## Conventions

- **`verbatimModuleSyntax`** is enabled → all type-only imports MUST use `import type`. ESLint enforces `consistent-type-imports` with `fixStyle: "inline-type-imports"`.
- **`noUncheckedIndexedAccess`** is enabled → array/record index access returns `T | undefined`.
- Prettier config uses the Tailwind CSS plugin only (default Prettier style).
- `.npmrc` hoists `*eslint*` and `*prettier*` patterns for `pnpm`.
- All client components are `"use client"` at the top of the file.
- Kebab-case for non-component files, PascalCase for component files. (Some files in `lib/` diverge — check neighbors before adding new ones.)
- `api-reference.md` at the repo root describes a **Python/FastAPI backend** (port 8000) with job queues, Redis, etc. This is **not part of this Next.js codebase**. Don't confuse its endpoints with Next.js API routes.

## Gotchas

- `.next` is gitignored and in the ESLint ignores list. Clear it (`rm -rf .next`) if you get stale build errors.
- `next-env.d.ts` is gitignored and auto-generated — don't create it manually.
- Husky is installed but **no `.husky/` hooks are configured** — pre-commit hooks won't run.
- `drizzle-kit push` (`db:push`) applies schema changes directly to the DB. `db:generate` + `db:migrate` is the safe path for tracked migrations.

# AGENTS.md

## Cursor Cloud specific instructions

### Overview

TheyPromised is a single Next.js 15 monolith (App Router) — there is no separate backend service. All API logic lives in `src/app/api/` routes and Server Actions. The cloud Supabase project `bstnociyejtsvqzweuvr` is used for database, auth, and storage.

### Running the app

Standard commands are in `package.json`:

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Unit tests | `npm run test` (Vitest) |
| E2E tests | `npm run test:e2e` (Playwright) |
| Build | `npm run build` |

### Environment variables

A `.env.local` file is required. At minimum, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set — `next.config.ts` throws at startup without them. Copy `.env.local.example` for the full list. Optional services (Stripe, Anthropic, Resend, Upstash, PostHog, Sentry) degrade gracefully when their keys are absent.

### Non-obvious gotchas

- **`next.config.ts` hard-fails** if `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing — the dev server won't even start.
- **Supabase `cases_ref_seq`** can get out of sync with existing case refs. If case creation fails with `duplicate key value violates unique constraint 'idx_cases_ref_unique'`, fix the sequence: `SELECT setval('cases_ref_seq', (SELECT COALESCE(MAX(CAST(SUBSTRING(ref FROM 4) AS INTEGER)), 0) + 1 FROM cases WHERE ref LIKE 'TP-%'), false);`
- **Supabase auth rate limits** apply on the cloud project. Registration attempts are limited; when testing registration flows, use a single email address and avoid repeated attempts.
- The `/cases` and `/cases/[id]` pages have a pre-existing runtime error (`buttonVariants()` called from a Server Component). This is a known code bug, not an environment issue.
- **Lockfile**: `package-lock.json` is used — use `npm` (not pnpm/yarn).

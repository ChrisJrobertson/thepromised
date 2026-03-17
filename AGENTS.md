# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

TheyPromised.app is a UK consumer complaint tracking platform built as a single Next.js 15 monolith (App Router, Server Components). All external services (Supabase, Stripe, Anthropic, Resend) are cloud-hosted SaaS — no Docker, no local databases.

### Running the dev server

```bash
npm run dev
```

Starts on `http://localhost:3000`. The landing page, login, register, and marketing pages all work without authentication. Protected routes (`/dashboard`, `/cases`, `/settings`, etc.) redirect to `/login`.

### Key commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Unit tests | `npm test -- --run` |
| E2E tests | `npm run test:e2e` |
| Production build | `npm run build` |

### Environment variables

Copy `.env.local.example` to `.env.local`. Required for the app to function:

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Stripe**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, and 4 `STRIPE_PRICE_ID_*` vars
- **AI**: `ANTHROPIC_API_KEY`

Optional: `RESEND_API_KEY`, PostHog keys, Sentry keys.

### Gotchas

- **Production build (`npm run build`) requires a valid `SUPABASE_SERVICE_ROLE_KEY`** because static pages like `/companies` and `/sitemap.xml` query Supabase views during prerendering. Dev mode (`npm run dev`) works without it since pages render on-demand.
- **Stripe keys** are lazy-loaded; the dev server starts fine with placeholder values but Stripe features will error when triggered.
- **One pre-existing test failure**: `src/test/unit/letter-templates.test.ts` expects 8 templates but the code has 11. This is an existing mismatch in the repository.
- **Database migrations** are in `supabase/migrations/` (6 SQL files). The second migration (`20260314193000`) references a column `organisation_id` on `profiles` that was never created — skip those ALTER statements when applying manually.
- **Database seeding**: After starting the dev server, seed with `curl -X POST http://localhost:3000/api/seed -H "x-seed-secret: $SEED_SECRET"`. This populates organisations and escalation rules.
- **Supabase project region**: EU West 2 (London) is the appropriate region for this UK-focused app.

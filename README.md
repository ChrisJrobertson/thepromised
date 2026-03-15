# TheyPromised

A UK consumer complaints management platform. Log every interaction, track promises, follow UK-specific escalation paths, and generate professional letters — all with AI assistance.

## Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Database**: Supabase (Postgres + RLS + Auth)
- **Payments**: Stripe (Basic / Pro tiers)
- **Email**: Resend + React Email
- **AI**: Anthropic Claude + HuggingFace
- **Styling**: Tailwind v4 + shadcn/ui
- **Forms**: react-hook-form + Zod

## Getting started

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`.

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration:

```bash
npx supabase db push
# or paste supabase/migrations/20260314170000_initial_schema.sql directly in the SQL editor
```

3. Create the `evidence` Storage bucket (set to private, RLS enabled)

### 4. Set up Stripe

```bash
npx tsx src/lib/stripe/setup.ts
```

Copy the resulting price IDs into `.env.local`.

### 5. Seed the database

Start the dev server, then run:

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "x-seed-secret: YOUR_SEED_SECRET"
```

This seeds:
- **Organisations**: Common UK energy, telecoms, financial, and government bodies
- **Escalation Rules**: Full UK complaints procedures for all 15 categories

### 6. Run locally

```bash
npm run dev
```

## Core features

### Cases
- Multi-step wizard to create a case (organisation → details → first interaction → confirm)
- Cases list with status tabs, search, and sort
- Single case hub with timeline, evidence, letters, and escalation guide tabs

### Interactions
- Detailed interaction logging (channel, direction, contact details, promises, mood)
- Auto-reminders for promise deadlines (1 day before, on the day, 1 day after)
- Quick Log from the header works from any page

### Evidence
- Drag-and-drop file upload to Supabase Storage
- Voice memo recording (Pro only, browser MediaRecorder API)
- Email forward parser — paste an email, log it as an interaction (Basic/Pro)
- Gallery with preview (images, PDFs, audio)

### Escalation engine
- UK-specific escalation paths for 15 categories (energy, broadband, financial services, NHS, DWP, housing, employment, etc.)
- Auto-calculated deadlines from first contact date
- 8-week escalation window alerts via daily cron job
- Advance stages manually with "Mark complete" button

### Letters
- AI-generated complaint letters via Anthropic Claude
- Letter types: initial complaint, escalation, final response request, ombudsman referral, subject access request, letter before action
- PDF download

### Reminders
- Daily digest emails via Resend
- Promise deadline reminders (auto-created on interaction log)
- Escalation window alerts (6-week, 7-week, 8-week warnings)

## Subscription tiers

| Feature | Free | Basic | Pro |
|---------|------|-------|-----|
| Active cases | 1 | Unlimited | Unlimited |
| Interactions | Unlimited | Unlimited | Unlimited |
| PDF export | ✗ | Timeline/Letters | Full case |
| AI analysis | ✗ | ✓ (limited) | ✓ (generous) |
| Email reminders | ✗ | ✓ | ✓ |
| Voice memos | ✗ | ✗ | ✓ |
| Email forward parser | ✗ | ✓ | ✓ |

## Cron job

Set up a daily cron to hit:

```
GET /api/reminders/cron
Authorization: Bearer YOUR_CRON_SECRET
```

On Vercel, add this to `vercel.json` (already configured).

## Database seeding

The seed API endpoint (`POST /api/seed`) inserts:
- Major UK organisations (British Gas, EDF, BT, Sky, HMRC, DWP, Barclays, etc.)
- Complete escalation rules for all 15 complaint categories

## Architecture notes

- All pages are Server Components by default; `"use client"` only where interactivity is needed
- All database access goes through Supabase with RLS — user data is always filtered by `user_id`
- Dates stored in UTC, displayed in `DD/MM/YYYY` UK format using `date-fns` with `enGB` locale
- TypeScript strict mode throughout
- UK English in all user-facing copy (organisation, colour, licence, behaviour)

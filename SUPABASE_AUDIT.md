# Supabase Schema Audit — TheyPromised
## Date: 17 March 2026

**Context:** The Supabase project was originally created for a legacy PI/case-management
application. TheyPromised was deployed on top by adding columns via `ALTER TABLE`. This
audit verifies the previous `cases.ref` fix and audits every other table for legacy
mismatches, RLS gaps, and constraint issues.

---

## Part 1: Cases.ref Fix Verification

- [x] `supabase/migrations/20260317140000_fix_cases_ref_auto_generation.sql` exists
- [x] `CREATE SEQUENCE IF NOT EXISTS cases_ref_seq` present
- [x] `generate_case_ref()` trigger function sets `TP-XXXXX` when ref is NULL/empty
- [x] `trigger_generate_case_ref` BEFORE INSERT trigger confirmed in DB
- [x] `organisation_id` is now NULLABLE (`is_nullable: YES` confirmed)
- [x] Old composite `UNIQUE(organisation_id, ref)` dropped; `idx_cases_ref_unique` on `ref` alone confirmed
- [x] `status` CHECK: `('open','escalated','resolved','closed')` — matches app values
- [x] `priority` CHECK: `('low','medium','high','urgent')` — matches app values
- [x] Status default `'open'`, priority default `'medium'` confirmed
- [x] Legacy row migration applied (all 15 old rows converted: 0 bad_status, 0 bad_priority, 0 null_ref)
- [x] `supabase/migrations/20260317150000_fix_organisations_insert_policy.sql` exists
- [x] `organisations_insert_authenticated` policy confirmed in DB
- [x] `src/types/database.ts` — `ref: string` in Row, `ref?: string` in Insert/Update
- [x] `tests/fixtures/mock-case.ts` — `ref: 'TP-00001'` present
- [x] `npm run build` passes clean (0 errors)

**Verdict: All previous fixes confirmed intact. ✅**

---

## Part 2: Table-by-Table Findings

### `cases`
- **Status: ⚠️ Issues Found (non-critical remaining)**
- Previously fixed: ref trigger, status/priority constraints, organisation_id nullable
- **Remaining issue (CRITICAL — see Part 7):** `organisation_id → organisations.id ON DELETE CASCADE`
  — if an org row is ever removed, ALL linked user cases are silently deleted. Must be SET NULL.
- `type` column (legacy, NOT NULL, default 'OTHER') — app never sets it; default 'OTHER' satisfies NOT NULL.
  Values written by old PI rows still pass the old `cases_type_check`. Not blocking.
- `investigator_id → profiles.id ON DELETE NO ACTION` — legacy FK, not used by TheyPromised.
  Could prevent profile deletion if a legacy row has it set. Acceptable risk.
- Missing index: `cases.user_id` has `idx_cases_user_id` ✅

### `profiles`
- **Status: ⚠️ Issues Found**
- `subscription_status` CHECK allows: `active, cancelled, past_due, trialing, pack_temporary`.
  App sets exactly these values. ✅
- `subscription_tier` has **no CHECK constraint** in the DB (migration was no-op since
  profiles table pre-existed). App sets 'free'/'basic'/'pro'. No constraint failure, acceptable.
- `notification_preferences` default is `'{}'::jsonb` in DB, not the full object the migration
  intended (`{"email_reminders":true,...}`). New users get `{}` → cron job reads `prefs.email_reminders`
  as `undefined` (falsy) → **reminder emails suppressed for all new users**.
  (CRITICAL — see Part 7)
- `organisation_id → organisations.id ON DELETE CASCADE` — if an org is deleted, all profiles
  linked to that org are deleted. TheyPromised users have `organisation_id = NULL` so this
  is not exploitable in practice. Acceptable risk.
- `avatar_url` column exists (legacy); not in TypeScript types; not used by app. Harmless.

### `interactions`
- **Status: ✅ Clean**
- All required NOT NULL columns (`case_id`, `user_id`, `interaction_date`, `channel`, `direction`, `summary`)
  provided by every app INSERT path.
- CHECK constraints:
  - `channel`: app uses `phone,email,letter,webchat,in_person,social_media,app,other` — all valid ✅
  - `direction`: `inbound,outbound` — all valid ✅
  - `mood`: `helpful,neutral,unhelpful,hostile` — all valid ✅
  - `outcome`: `resolved,escalated,promised_callback,promised_action,no_resolution,transferred,disconnected,letter_sent,other` — app uses `letter_sent` and `other` ✅ (fixed in migration 20260316103000)
- FKs: `case_id → cases ON DELETE CASCADE` ✅, `user_id → profiles ON DELETE CASCADE` ✅
- Indexes: `idx_interactions_case_id`, `idx_interactions_date` ✅

### `letters`
- **Status: ✅ Clean**
- `letter_type` CHECK allows 11 values including `adr_referral, section_75_claim, letter_before_action`
  (fixed in migration 20260317100000). App uses all of these. ✅
- `status` CHECK: `draft, sent, acknowledged` — app sets these ✅
- `sent_via` CHECK: `email, post, not_sent` — app sets these ✅
- `delivery_status` column has **no CHECK constraint** — app sets `draft/sent/delivered/opened/bounced/failed`.
  No constraint failure. Acceptable.
- All required NOT NULL columns (`case_id`, `user_id`, `letter_type`, `subject`, `body`) provided ✅
- FKs: `case_id → cases ON DELETE CASCADE` ✅, `user_id → profiles ON DELETE CASCADE` ✅
- Index: `idx_letters_case_id` ✅

### `reminders`
- **Status: ✅ Clean**
- `reminder_type` CHECK allows 8 values including `response_approaching, response_due,
  response_overdue, notification` (added in migration 20260316100000). App uses all these. ✅
- All required NOT NULL columns provided by all INSERT paths ✅
- FKs: `case_id → cases ON DELETE CASCADE` ✅, `user_id → profiles ON DELETE CASCADE` ✅,
  `interaction_id → interactions ON DELETE SET NULL` ✅
- Index: `idx_reminders_user_due` (partial: not sent AND not dismissed) ✅

### `evidence`
- **Status: ✅ Clean**
- `evidence_type` CHECK: `screenshot,email,letter,photo,voice_memo,document,receipt,contract,other`
  — app sets `voice_memo` and `email`, valid ✅
- All required NOT NULL columns (`case_id`, `user_id`, `file_name`, `file_type`, `file_size`, `storage_path`)
  provided by every INSERT path ✅
- FKs: `case_id → cases ON DELETE CASCADE` ✅, `user_id → profiles ON DELETE CASCADE` ✅,
  `interaction_id → interactions ON DELETE SET NULL` ✅
- Index: `idx_evidence_case_id` ✅

### `organisations`
- **Status: ⚠️ Issues Found (non-critical)**
- Legacy `plan` column: NOT NULL, default 'SOLO', CHECK `('SOLO','PROFESSIONAL','AGENCY','ENTERPRISE')`.
  TheyPromised inserts never set `plan`; default 'SOLO' satisfies NOT NULL. ✅
- `category` column: nullable in DB, no CHECK constraint (migration was no-op since table pre-existed).
  App always provides `category`. No failure.
- `name` is NOT NULL with no default — app always provides it ✅
- RLS: `organisations_select_authenticated` allows all authenticated users to read all orgs ✅
  `organisations_insert_authenticated` added by previous fix ✅
  No UPDATE policy for authenticated users (only service_role can update orgs) — acceptable,
  users should not edit the canonical org directory.

### `complaint_packs`
- **Status: 🔴 CRITICAL RLS Issue**
- `status` CHECK: `purchased, in_progress, fulfilled, refunded, cancelled` — app sets these ✅
- **CRITICAL:** "Service role can manage packs" policy has `roles: {public}` (not `{service_role}`).
  Any authenticated user can SELECT/INSERT/UPDATE/DELETE ALL complaint_packs rows, including
  other users' packs. Financial data exposure + pack manipulation risk.
  (CRITICAL — see Part 7)
- "Users can view own packs" SELECT policy is redundant when the PUBLIC policy allows everything.

### `exports`
- **Status: ✅ Clean**
- `export_type` CHECK: `full_case, timeline_only, letters_only` — app sets these ✅
- All required NOT NULL columns provided ✅
- FKs: `case_id → cases ON DELETE CASCADE` ✅, `user_id → profiles ON DELETE CASCADE` ✅

### `escalation_rules`
- **Status: ✅ Clean**
- `deadline_type` CHECK: `from_complaint, from_response, absolute` — used by seed data only ✅
- Read-only from app perspective (SELECT only for authenticated users) ✅

### `user_journeys`
- **Status: ✅ Clean**
- `status` CHECK: `active, completed, abandoned` — app sets these ✅
- All required NOT NULL columns provided ✅
- FKs: `case_id → cases ON DELETE SET NULL` ✅, `user_id → auth.users ON DELETE CASCADE` ✅,
  `template_id → journey_templates ON DELETE NO ACTION` — acceptable (templates should not be deleted)
- Indexes: `user_journeys_user_id_idx`, `user_journeys_case_id_idx` ✅

### `monthly_ai_usage`
- **Status: ⚠️ RLS uses {public} role (minor)**
- All three policies (`Users can view/insert/update own usage`) are scoped to `{public}` instead
  of `{authenticated}`. Since all policies have `auth.uid() = user_id` conditions, unauthenticated
  users (where `auth.uid()` = NULL) cannot match any row. Functionally safe.
- UNIQUE constraint on `(user_id, month_year)` — app uses upsert pattern ✅

### `journey_templates`
- **Status: ✅ Clean**
- Read-only from user perspective. "Authenticated users can read journey templates" scoped to
  `is_active = true` ✅
- Two SELECT policies (`Anyone can read` + `Authenticated users can read`) — "Anyone can read"
  policy with `{public}` makes templates public, which is intentional.

### `b2b_pilots`
- **Status: 🔴 RLS Issue (admin data exposure)**
- "Service role can manage b2b pilots" has `roles: {public}` — any authenticated user can
  read/modify ALL b2b pilot records (admin/commercial data). Not a core user flow but a
  security design flaw.

### `b2b_outreach_emails`
- **Status: 🔴 RLS Issue (admin data exposure)**
- "Service role can manage b2b outreach emails" has `roles: {public}` — any authenticated
  user can read/modify ALL outreach email records.

### `business_enquiries`
- **Status: ✅ Acceptable**
- INSERT-only for public (anyone can submit). No SELECT policy for public (data only
  accessible via service_role). This is intentional.

### `case_journeys` (legacy table, not in migrations)
- **Status: ✅ Not used by app**
- Legacy table from old PI schema. Not referenced anywhere in application code.
- Has correct RLS policies (`user_id = auth.uid()` for all operations).
- Harmless.

---

## Part 3: RLS Policy Summary

| Table | RLS Enabled | SELECT | INSERT | UPDATE | DELETE | Issues |
|-------|-------------|--------|--------|--------|--------|--------|
| cases | ✅ | own rows | own rows | own rows | own rows | Legacy `cases_org_scope` (harmless, evaluates false for TP users) |
| profiles | ✅ | own row | own row | own row | own row | Legacy `profiles_org_scope` (harmless) |
| interactions | ✅ | own rows | own rows | own rows | own rows | None |
| letters | ✅ | own rows | own rows | own rows | own rows | None |
| reminders | ✅ | own rows | own rows | own rows | own rows | None |
| evidence | ✅ | own rows | own rows | own rows | own rows | None |
| exports | ✅ | own rows | own rows | own rows | own rows | None |
| organisations | ✅ | all (public dir) | authenticated | service_role only | service_role only | None after fix |
| complaint_packs | ✅ | **PUBLIC** (all rows) | **PUBLIC** | **PUBLIC** | **PUBLIC** | 🔴 CRITICAL: {public} policy bypasses all isolation |
| escalation_rules | ✅ | all (public dir) | service_role | service_role | service_role | None |
| user_journeys | ✅ | own rows | own rows | own rows | own rows | Some policies on {public} not {authenticated} — functionally safe |
| monthly_ai_usage | ✅ | own rows | own rows | own rows | N/A | {public} role (safe due to auth.uid() condition) |
| journey_templates | ✅ | all (public) | N/A | N/A | N/A | Intentionally public |
| b2b_pilots | ✅ | **PUBLIC** (all rows) | **PUBLIC** | **PUBLIC** | **PUBLIC** | 🔴 Admin data exposure |
| b2b_outreach_emails | ✅ | **PUBLIC** (all rows) | **PUBLIC** | **PUBLIC** | **PUBLIC** | 🔴 Admin data exposure |
| business_enquiries | ✅ | none | PUBLIC (public form) | N/A | N/A | Intentional |
| case_journeys | ✅ | own rows | own rows | own rows | own rows | Legacy table, unused |

---

## Part 4: CHECK Constraint Summary

| Table.Column | Allowed Values | App Values | Match? |
|-------------|----------------|------------|--------|
| cases.status | open, escalated, resolved, closed | open, escalated, resolved, closed | ✅ |
| cases.priority | low, medium, high, urgent | low, medium, high, urgent | ✅ |
| cases.type | DUE_DILIGENCE…OTHER (uppercase) | never set (default 'OTHER') | ✅ |
| cases.outcome_satisfaction | yes, partially, no | yes, partially, no | ✅ |
| cases.outcome_resolution_type | refund, compensation, apology, replacement, service_fix, nothing, other | same | ✅ |
| interactions.channel | phone,email,letter,webchat,in_person,social_media,app,other | same | ✅ |
| interactions.direction | inbound, outbound | inbound, outbound | ✅ |
| interactions.mood | helpful,neutral,unhelpful,hostile | same | ✅ |
| interactions.outcome | resolved,escalated,promised_callback,promised_action,no_resolution,transferred,disconnected,letter_sent,other | same (incl. letter_sent) | ✅ |
| letters.letter_type | 11 values incl. adr_referral, section_75_claim, letter_before_action | same | ✅ |
| letters.status | draft, sent, acknowledged | same | ✅ |
| letters.sent_via | email, post, not_sent | same | ✅ |
| exports.export_type | full_case, timeline_only, letters_only | same | ✅ |
| evidence.evidence_type | screenshot,email,letter,photo,voice_memo,document,receipt,contract,other | voice_memo, email, document, other | ✅ |
| reminders.reminder_type | 8 values incl. response_approaching, response_due, response_overdue, notification | same | ✅ |
| profiles.subscription_status | active,cancelled,past_due,trialing,pack_temporary | same | ✅ |
| complaint_packs.status | purchased,in_progress,fulfilled,refunded,cancelled | purchased, refunded | ✅ |
| b2b_pilots.status | enquiry,contacted,pilot_started,active,churned | same | ✅ |
| user_journeys.status | active, completed, abandoned | same | ✅ |
| organisations.plan | SOLO,PROFESSIONAL,AGENCY,ENTERPRISE | never set (default 'SOLO') | ✅ |

---

## Part 5: Foreign Key Summary

| FK | ON DELETE | Correct? | Issue |
|----|----------|----------|-------|
| cases.organisation_id → organisations | CASCADE | ❌ | **CRITICAL: deletes user cases if org removed. Must be SET NULL** |
| cases.assigned_to → profiles | SET NULL | ✅ | Legacy field |
| cases.investigator_id → profiles | NO ACTION | ⚠️ | Legacy; could block profile deletion. Low risk |
| interactions.case_id → cases | CASCADE | ✅ | Correct |
| interactions.user_id → profiles | CASCADE | ✅ | Correct |
| letters.case_id → cases | CASCADE | ✅ | Correct |
| letters.user_id → profiles | CASCADE | ✅ | Correct |
| reminders.case_id → cases | CASCADE | ✅ | Correct |
| reminders.user_id → profiles | CASCADE | ✅ | Correct |
| reminders.interaction_id → interactions | SET NULL | ✅ | Correct |
| evidence.case_id → cases | CASCADE | ✅ | Correct |
| evidence.user_id → profiles | CASCADE | ✅ | Correct |
| evidence.interaction_id → interactions | SET NULL | ✅ | Correct |
| exports.case_id → cases | CASCADE | ✅ | Correct |
| exports.user_id → profiles | CASCADE | ✅ | Correct |
| profiles.organisation_id → organisations | CASCADE | ⚠️ | Legacy; TP users have NULL here so low risk |
| profiles.pack_access_case_id → cases | SET NULL | ✅ | Correct |
| profiles.pack_source_pack_id → complaint_packs | SET NULL | ✅ | Correct |
| complaint_packs.user_id → profiles | CASCADE | ✅ | Correct |
| complaint_packs.case_id → cases | SET NULL | ✅ | Correct |
| complaint_packs.entitlement_case_id → cases | SET NULL | ✅ | Correct |
| user_journeys.case_id → cases | SET NULL | ✅ | Correct |
| user_journeys.template_id → journey_templates | NO ACTION | ✅ | Acceptable |
| b2b_pilots.organisation_id → organisations | NO ACTION | ⚠️ | Could block org deletion. Low risk |

---

## Part 6: Missing Indexes

| Table.Column | Query Pattern | Status | Priority |
|-------------|---------------|--------|----------|
| cases.user_id | Every dashboard query | `idx_cases_user_id` ✅ | — |
| cases.status | Status filtering | `idx_cases_status` ✅ | — |
| cases.share_token | Public share links | `idx_cases_share_token` + unique ✅ | — |
| interactions.case_id | Case detail page | `idx_interactions_case_id` ✅ | — |
| letters.case_id | Case letters list | `idx_letters_case_id` ✅ | — |
| reminders.user_id + due_date | Reminder bell / cron | `idx_reminders_user_due` ✅ | — |
| evidence.case_id | Evidence list | `idx_evidence_case_id` ✅ | — |
| organisations.name | Org search | `idx_organisations_name_trgm` (GIN trigram) ✅ | — |
| profiles.email | Auth/lookup | `idx_profiles_email` ✅ | — |
| interactions.user_id | Needed for RLS scans | **MISSING** | Medium |
| letters.user_id | Needed for RLS scans | **MISSING** | Medium |
| evidence.user_id | Needed for RLS scans | **MISSING** | Medium |
| reminders.case_id | Reminder-by-case queries | **MISSING** | Low |

> Note: Missing `user_id` indexes on interactions/letters/evidence may cause slow full-table
> scans when RLS evaluates `user_id = auth.uid()` at scale. Not a launch blocker but should
> be added before significant user growth.

---

## Part 7: Critical Fixes Required (ordered by severity)

### C1 — `complaint_packs` RLS: Data exposure + financial manipulation (CRITICAL)
**Problem:** "Service role can manage packs" has `roles: {public}` — any authenticated user
can read, create, update or delete ANY user's complaint_pack row. A malicious user could
set another user's pack status to 'refunded', view all financial transactions, or claim
another user's pack.

**Fix:** Restrict the policy to `service_role` only. Ensure users can INSERT their own packs
via a new scoped INSERT policy (Stripe webhook uses service_role and bypasses RLS, so an
authenticated INSERT policy isn't needed for the current payment flow).

### C2 — `cases.organisation_id ON DELETE CASCADE` (CRITICAL)
**Problem:** Foreign key `cases.organisation_id → organisations.id` has `ON DELETE CASCADE`.
If any organisation row is deleted (e.g. admin deduplication, cleanup), ALL cases linked to
that organisation are silently deleted — permanently losing user complaint history.

**Fix:** Change `ON DELETE CASCADE` to `ON DELETE SET NULL`. Deleting an org nullifies the
`organisation_id` on linked cases (they still exist with `custom_organisation_name` fallback
or null org reference).

### C3 — `profiles.notification_preferences` default `{}` (HIGH — breaks reminder emails)
**Problem:** The `notification_preferences` column has default `'{}'::jsonb` instead of the
intended `'{"email_reminders":true,"email_escalation_alerts":true,"email_promise_alerts":true,"weekly_summary":false,"product_updates":true}'::jsonb`.
The cron job reads `prefs.email_reminders` — with `{}`, this is `undefined` (falsy), so
**no reminder or escalation emails are sent to any new user**.

**Fix:** Alter the column default and backfill all existing rows that have `{}`.

### C4 — `b2b_pilots` + `b2b_outreach_emails` RLS: Admin data exposure (HIGH)
**Problem:** Same `{public}` role issue as C1 but for admin tables. Any authenticated user
can read all B2B pilot records and outreach email data.

**Fix:** Restrict "Service role can manage" policies to `service_role` role.

---

## Part 8: Recommended Fixes (future pass)

- Add `user_id` indexes on `interactions`, `letters`, `evidence` for RLS scan performance
- Add CHECK constraint on `profiles.subscription_tier` to prevent invalid values
- Add CHECK constraint on `letters.delivery_status` for consistency
- Add CHECK constraint on `organisations.category` to enforce valid TheyPromised categories
- Drop `cases.investigator_id → profiles.id NO ACTION` FK (legacy, prevents profile deletion)
- Consider making `organisations` category NOT NULL with a default of 'other'
- Fix `profiles.notification_preferences` to NOT NULL once default is corrected
- Remove legacy `cases_org_scope` and `profiles_org_scope` policies (harmless but confusing)
- Review `case_journeys` legacy table — either document it or drop it once confirmed unused

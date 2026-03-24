# Cursor Prompt 01 — Fix Vitest Failures (4 failures → 0)

> **Scope:** Update 2 test files to match current implementation. NO changes to production code.
> **Run after:** `npm run test` to confirm all green.

---

## Problem

`npm run test` shows 46 passed / 4 failed. The failures are **test drift** — tests written against an earlier version of the code, not actual product bugs.

---

## Fix 1: `src/test/unit/letter-templates.test.ts`

**Root cause:** Test expects `LETTER_TEMPLATES.length` to be `8`. The implementation now has `11` templates (added `adr_referral`, `section_75_claim`, and `custom` since the test was written).

**Action:** Change line:
```typescript
// BEFORE
expect(LETTER_TEMPLATES.length).toBe(8);

// AFTER
expect(LETTER_TEMPLATES.length).toBe(11);
```

Also add coverage for the 3 new templates. After the existing `formal_notice` test, add:

```typescript
it("includes adr_referral with ADR Regulations reference", () => {
  const template = LETTER_TEMPLATES.find((t) => t.type === "adr_referral");
  expect(template).toBeDefined();
  expect(
    template?.legalReferences.some((ref) => ref.includes("Alternative Dispute Resolution"))
  ).toBe(true);
});

it("includes section_75_claim with Consumer Credit Act reference", () => {
  const template = LETTER_TEMPLATES.find((t) => t.type === "section_75_claim");
  expect(template).toBeDefined();
  expect(
    template?.legalReferences.some((ref) => ref.includes("Consumer Credit Act 1974"))
  ).toBe(true);
});

it("includes custom template", () => {
  const template = LETTER_TEMPLATES.find((t) => t.type === "custom");
  expect(template).toBeDefined();
  expect(template?.name).toBe("Custom Letter");
});
```

---

## Fix 2: `src/test/unit/feature-gates.test.ts`

**Root cause:** Tests expect `canUseAI(freeProfile, "suggestions")` returns `false` and `canUseAI(freeProfile, "letters")` returns `false`. But the current `canUseAI` implementation in `src/lib/stripe/feature-gates.ts` returns `true` for free users because:

```typescript
// Current code (lines 26-28 of feature-gates.ts):
const limit = AI_LIMITS[tier][feature];
if (limit === 0) return false;
if (tier === "free") return true; // actual limit enforced per calendar month in API
```

Free tier AI_LIMITS are `{ suggestions: 3, letters: 1, summaries: 0 }` — so `suggestions` has limit 3 (not 0), meaning the function returns `true`. This is **intentional product behaviour** — free users get 3 suggestions + 1 letter/month, with the actual enforcement happening at the API layer.

**Action:** Update the `canUseAI` describe block in `src/test/unit/feature-gates.test.ts`:

```typescript
describe("canUseAI", () => {
  it("allows free users suggestions (3/month, enforced at API layer)", () => {
    expect(canUseAI(makeProfile(), "suggestions")).toBe(true);
  });

  it("allows free users letters (1/month, enforced at API layer)", () => {
    expect(canUseAI(makeProfile(), "letters")).toBe(true);
  });

  it("blocks free users from summaries (limit is 0)", () => {
    expect(canUseAI(makeProfile(), "summaries" as "suggestions")).toBe(false);
  });

  it("allows basic users up to their suggestion limit", () => {
    const profile = makeProfile({ subscription_tier: "basic", ai_credits_used: 5 });
    expect(canUseAI(profile, "suggestions")).toBe(true);
  });

  it("blocks basic users at suggestion limit", () => {
    const profile = makeProfile({ subscription_tier: "basic", ai_suggestions_used: 10 });
    expect(canUseAI(profile, "suggestions")).toBe(false);
  });

  it("allows pro users up to their limit", () => {
    const profile = makeProfile({ subscription_tier: "pro", ai_suggestions_used: 49 });
    expect(canUseAI(profile, "suggestions")).toBe(true);
  });

  it("blocks pro users at their limit", () => {
    const profile = makeProfile({ subscription_tier: "pro", ai_suggestions_used: 50 });
    expect(canUseAI(profile, "suggestions")).toBe(false);
  });
});
```

**Important detail:** The original tests used `ai_credits_used` for basic/pro limit checks, but `canUseAI` checks `ai_suggestions_used` for the `"suggestions"` feature and `ai_letters_used` for `"letters"`. Fix the field names in the test to match what the implementation actually reads:
- For `"suggestions"` → use `ai_suggestions_used`
- For `"letters"` → use `ai_letters_used`
- The `ai_credits_used` fallback only applies when the feature type doesn't match `"suggestions"` or `"letters"`

Also import `canUseAI` at the top — it's currently only imported in the separate `src/test/unit/feature-gates.test.ts` but needs the `"summaries"` type handled. Since `AiFeature` in `feature-gates.ts` only types `"suggestions" | "letters"`, cast `"summaries"` appropriately or skip that test if you prefer — the key fix is changing the free-tier expectations from `false` to `true`.

---

## Verification

After applying both fixes, run:

```bash
npm run test
```

Expected result: **All tests pass (0 failures).**

Do NOT modify any file in `src/lib/`, `src/app/`, or `src/components/`. Only test files change.

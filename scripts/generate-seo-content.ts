/**
 * One-off / CI content generator for SEO tables.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/generate-seo-content.ts --type org --slug british-gas
 *   npx tsx --env-file=.env.local scripts/generate-seo-content.ts --type guide --slug energy-ombudsman-escalation
 *
 * Requires: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const orgContentSchema = z.object({
  your_rights: z.array(
    z.object({
      heading: z.string(),
      body: z.string(),
      legislation_ref: z.string().optional().nullable(),
    }),
  ),
  escalation_steps: z.array(
    z.object({
      step_number: z.number(),
      title: z.string(),
      description: z.string(),
      deadline_days: z.number().nullable().optional(),
      legislation_ref: z.string().optional().nullable(),
    }),
  ),
  faq_items: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
  ),
  common_issues: z.array(
    z.object({
      issue: z.string(),
      description: z.string(),
    }),
  ),
});

const guideContentSchema = z.object({
  content_sections: z.array(
    z.object({
      heading: z.string(),
      body: z.string(),
      legislation_ref: z.string().optional().nullable(),
    }),
  ),
  step_by_step: z.array(
    z.object({
      step_number: z.number(),
      title: z.string(),
      description: z.string(),
      tip: z.string().nullable().optional(),
    }),
  ),
  eligibility_criteria: z
    .array(
      z.object({
        criterion: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
  faq_items: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
  ),
  key_deadlines: z
    .array(
      z.object({
        description: z.string(),
        days: z.number().nullable().optional(),
        from_event: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

function parseArgs() {
  const argv = process.argv.slice(2);
  let type: "org" | "guide" | null = null;
  let slug: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--type" && argv[i + 1]) {
      const v = argv[i + 1];
      if (v === "org" || v === "guide") type = v;
      i++;
    } else if (argv[i] === "--slug" && argv[i + 1]) {
      slug = argv[i + 1];
      i++;
    }
  }
  if (!type || !slug) {
    console.error("Usage: --type org|guide --slug <slug>");
    process.exit(1);
  }
  return { type, slug };
}

async function main() {
  const { type, slug } = parseArgs();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);
  const anthropic = new Anthropic({ apiKey });

  if (type === "org") {
    const { data: row, error } = await supabase
      .from("seo_organisation_pages")
      .select(
        "slug, sector, page_title, ombudsman_name, regulator_name, primary_legislation, complaint_deadline_days, hero_heading, hero_subheading, meta_description",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error || !row) {
      console.error("Org row not found:", error?.message ?? slug);
      process.exit(1);
    }

    const legislationList = (row.primary_legislation ?? []).join(", ");
    const prompt = `You are a UK consumer rights expert. Generate SEO content for a complaint guide page about the organisation described below.

Sector: ${row.sector}
Page title: ${row.page_title}
Regulator: ${row.regulator_name ?? "see sector norms"}
Ombudsman: ${row.ombudsman_name ?? "see sector norms"}
Applicable legislation (you must ground references in these — do not invent section numbers): ${legislationList || "use sector-appropriate UK statutes"}
Typical internal complaint to escalation window (days, if applicable): ${row.complaint_deadline_days ?? "not specified — use sector norms"}

Return ONLY valid JSON (no markdown fences) with this shape:
{
  "your_rights": [{ "heading": string, "body": string, "legislation_ref": string | null }],
  "escalation_steps": [{ "step_number": number, "title": string, "description": string, "deadline_days": number | null, "legislation_ref": string | null }],
  "faq_items": [{ "question": string, "answer": string }],
  "common_issues": [{ "issue": string, "description": string }]
}

Rules:
- 3–5 your_rights items; 4–6 escalation_steps; 6–8 faq_items; 5–7 common_issues.
- Every legislation_ref must name real UK legislation or regulator rules you are confident about; if unsure, use a high-level Act name without a fake section number.
- Answer FAQs as people search on Google (billing, deadlines, ombudsman, compensation).
- British English.`;

    const resp = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = resp.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw.trim());
    } catch {
      console.error("Model did not return valid JSON:\n", raw.slice(0, 2000));
      process.exit(1);
    }

    const content = orgContentSchema.parse(parsedJson);

    const { error: upErr } = await supabase
      .from("seo_organisation_pages")
      .update({
        your_rights: content.your_rights,
        escalation_steps: content.escalation_steps,
        faq_items: content.faq_items,
        common_issues: content.common_issues,
        status: "draft",
        published_at: null,
      })
      .eq("slug", slug);

    if (upErr) {
      console.error("Update failed:", upErr.message);
      process.exit(1);
    }
    console.log("Updated seo_organisation_pages:", slug, "status=draft");
    return;
  }

  const { data: grow, error: gErr } = await supabase
    .from("seo_guide_pages")
    .select(
      "slug, category, sector, page_title, hero_heading, introduction, primary_legislation, meta_description",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (gErr || !grow) {
    console.error("Guide row not found:", gErr?.message ?? slug);
    process.exit(1);
  }

  const leg = (grow.primary_legislation ?? []).join(", ");
  const prompt = `You are a UK consumer rights expert. Generate SEO content for this guide page.

Slug: ${grow.slug}
Category: ${grow.category}
Sector: ${grow.sector ?? "cross-sector"}
Title: ${grow.page_title}
Introduction (keep tone consistent, do not repeat verbatim): ${grow.introduction}
Legislation to ground in (no invented section numbers): ${leg || "use appropriate UK law"}

Return ONLY valid JSON (no markdown fences):
{
  "content_sections": [{ "heading": string, "body": string, "legislation_ref": string | null }],
  "step_by_step": [{ "step_number": number, "title": string, "description": string, "tip": string | null }],
  "eligibility_criteria": [{ "criterion": string, "description": string }],
  "faq_items": [{ "question": string, "answer": string }],
  "key_deadlines": [{ "description": string, "days": number | null, "from_event": string | null }]
}

Rules:
- 4–7 content_sections; 5–8 step_by_step steps; 4–8 faq_items; 2–5 key_deadlines.
- eligibility_criteria can be empty array if not applicable.
- British English.`;

  const resp = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = resp.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw.trim());
  } catch {
    console.error("Model did not return valid JSON:\n", raw.slice(0, 2000));
    process.exit(1);
  }

  const content = guideContentSchema.parse(parsedJson);

  const { error: upErr } = await supabase
    .from("seo_guide_pages")
    .update({
      content_sections: content.content_sections,
      step_by_step: content.step_by_step,
      eligibility_criteria: content.eligibility_criteria ?? [],
      faq_items: content.faq_items,
      key_deadlines: content.key_deadlines ?? [],
      status: "draft",
      published_at: null,
    })
    .eq("slug", slug);

  if (upErr) {
    console.error("Update failed:", upErr.message);
    process.exit(1);
  }
  console.log("Updated seo_guide_pages:", slug, "status=draft");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

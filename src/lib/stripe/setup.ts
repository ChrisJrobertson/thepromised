/**
 * Stripe Products & Prices Setup Script
 *
 * Run once to create products and prices in Stripe:
 *   npx tsx src/lib/stripe/setup.ts
 *
 * Copy the output price IDs into your .env.local:
 *   STRIPE_PRICE_ID_BASIC_MONTHLY=price_...
 *   STRIPE_PRICE_ID_BASIC_ANNUAL=price_...
 *   STRIPE_PRICE_ID_PRO_MONTHLY=price_...
 *   STRIPE_PRICE_ID_PRO_ANNUAL=price_...
 */

import Stripe from "stripe";

async function setup() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY not set in environment");
  }

  const stripe = new Stripe(stripeKey);


  console.log("Creating TheyPromised Stripe products and prices...\n");

  // ── Basic Product ────────────────────────────────────────────────────────────
  const basicProduct = await stripe.products.create({
    name: "TheyPromised Basic",
    description: "Track your complaints and export your case files",
    metadata: { tier: "basic" },
  });
  console.log(`✓ Basic product: ${basicProduct.id}`);

  const basicMonthly = await stripe.prices.create({
    product: basicProduct.id,
    unit_amount: 499, // £4.99
    currency: "gbp",
    recurring: { interval: "month" },
    nickname: "Basic Monthly",
    metadata: { tier: "basic", period: "monthly" },
  });
  console.log(`✓ Basic monthly: ${basicMonthly.id}`);

  const basicAnnual = await stripe.prices.create({
    product: basicProduct.id,
    unit_amount: 3999, // £39.99
    currency: "gbp",
    recurring: { interval: "year" },
    nickname: "Basic Annual",
    metadata: { tier: "basic", period: "annual" },
  });
  console.log(`✓ Basic annual: ${basicAnnual.id}`);

  // ── Pro Product ──────────────────────────────────────────────────────────────
  const proProduct = await stripe.products.create({
    name: "TheyPromised Pro",
    description:
      "AI-powered complaint guidance, letter drafting, and full case exports",
    metadata: { tier: "pro" },
  });
  console.log(`✓ Pro product: ${proProduct.id}`);

  const proMonthly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 999, // £9.99
    currency: "gbp",
    recurring: { interval: "month" },
    nickname: "Pro Monthly",
    metadata: { tier: "pro", period: "monthly" },
  });
  console.log(`✓ Pro monthly: ${proMonthly.id}`);

  const proAnnual = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 7999, // £79.99
    currency: "gbp",
    recurring: { interval: "year" },
    nickname: "Pro Annual",
    metadata: { tier: "pro", period: "annual" },
  });
  console.log(`✓ Pro annual: ${proAnnual.id}`);

  console.log("\n─────────────────────────────────────────────");
  console.log("Add these to your .env.local:\n");
  console.log(`STRIPE_PRICE_ID_BASIC_MONTHLY=${basicMonthly.id}`);
  console.log(`STRIPE_PRICE_ID_BASIC_ANNUAL=${basicAnnual.id}`);
  console.log(`STRIPE_PRICE_ID_PRO_MONTHLY=${proMonthly.id}`);
  console.log(`STRIPE_PRICE_ID_PRO_ANNUAL=${proAnnual.id}`);
  console.log("─────────────────────────────────────────────\n");
}

setup().catch((err) => {
  console.error(err);
  process.exit(1);
});

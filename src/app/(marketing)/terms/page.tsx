import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "TheyPromised terms of service — subscription terms, cancellation policy, and acceptable use.",
};

const LAST_UPDATED = "14 March 2026";

export default function TermsPage() {
  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl space-y-8 px-4">
        <div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-muted-foreground">
          These terms govern your use of TheyPromised.app, operated by SynqForge Ltd
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By creating an account, you
          agree to these terms. Please read them carefully.
        </p>

        {[
          {
            title: "1. The service",
            content: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>TheyPromised provides a complaint tracking platform that helps UK consumers:</p>
                <ul className="space-y-1 ml-4">
                  <li>Log and track interactions with organisations</li>
                  <li>Follow guided escalation procedures based on UK complaints law</li>
                  <li>Generate letters and case files using AI assistance</li>
                  <li>Export professional case documentation</li>
                </ul>
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <strong className="text-amber-900">Important disclaimer:</strong>
                  <p className="mt-1 text-amber-800">TheyPromised provides tools and guidance but is <strong>not a legal service</strong> and we are not solicitors. Escalation guidance is based on publicly available UK complaints procedures. Time limits and procedures change — always verify current requirements with the relevant ombudsman, regulator, or a qualified solicitor before taking legal action.</p>
                </div>
              </div>
            ),
          },
          {
            title: "2. Subscription and billing",
            content: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Free plan:</strong> Available to all users at no cost. Limited to 1 active case and basic features.</p>
                <p><strong className="text-foreground">Paid plans:</strong> Basic (£4.99/month or £39.99/year) and Pro (£9.99/month or £79.99/year). All prices inclusive of VAT where applicable.</p>
                <p><strong className="text-foreground">Billing:</strong> Subscriptions are billed in advance. Annual plans are billed once per year.</p>
                <p><strong className="text-foreground">Cancellation:</strong> You may cancel at any time from your billing settings. Access continues until the end of the current billing period. No refund for unused time beyond the cooling-off period below.</p>
                <p><strong className="text-foreground">14-day cooling-off:</strong> Under the Consumer Contracts Regulations 2013, you have 14 days from first subscription to request a full refund if you have not used paid features. Contact <a className="text-primary underline" href="mailto:support@theypromised.app">support@theypromised.app</a>.</p>
                <p><strong className="text-foreground">Price changes:</strong> We will give you 30 days&apos; notice of any price changes, applied at your next renewal.</p>
              </div>
            ),
          },
          {
            title: "3. Your data",
            content: (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>You own all data you enter into TheyPromised. We are a data processor acting on your instructions.</p>
                <p>You may export all your data at any time from Account Settings. When you delete your account, all case data is permanently deleted within 30 days.</p>
                <p>You grant us a limited licence to process your data for the sole purpose of providing the service to you.</p>
              </div>
            ),
          },
          {
            title: "4. Acceptable use",
            content: (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>You may not use TheyPromised to:</p>
                <ul className="space-y-1 ml-4">
                  <li>Submit false or fabricated complaint information</li>
                  <li>Harass, defame, or threaten any individual or organisation</li>
                  <li>Circumvent or abuse our AI credit limits</li>
                  <li>Resell or redistribute access to the platform</li>
                  <li>Use the service for any unlawful purpose</li>
                </ul>
                <p className="mt-2">We reserve the right to suspend accounts that violate these terms.</p>
              </div>
            ),
          },
          {
            title: "5. AI-generated content",
            content: (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Letters and analyses generated by our AI are provided as a starting point. You are responsible for reviewing and verifying all AI-generated content before use.</p>
                <p>We are not liable for outcomes arising from reliance on AI-generated letters or guidance without independent verification.</p>
                <p>AI credits reset monthly on your billing date. Unused credits do not carry forward.</p>
              </div>
            ),
          },
          {
            title: "6. Limitation of liability",
            content: (
              <p className="text-sm text-muted-foreground">
                To the maximum extent permitted by law, SynqForge Ltd&apos;s liability is limited to
                the amount you paid for the service in the 12 months preceding any claim. We are not
                liable for indirect, consequential, or special damages, including lost outcomes in
                legal or ombudsman proceedings.
              </p>
            ),
          },
          {
            title: "7. Governing law",
            content: (
              <p className="text-sm text-muted-foreground">
                These terms are governed by the laws of England and Wales. Any disputes shall be
                subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            ),
          },
          {
            title: "8. Contact",
            content: (
              <p className="text-sm text-muted-foreground">
                SynqForge Ltd, England, UK.
                <br />
                General enquiries: <a className="text-primary underline" href="mailto:hello@theypromised.app">hello@theypromised.app</a>
                <br />
                Support: <a className="text-primary underline" href="mailto:support@theypromised.app">support@theypromised.app</a>
              </p>
            ),
          },
        ].map(({ title, content }) => (
          <div className="space-y-3" key={title}>
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="rounded-lg border bg-white p-5">{content}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

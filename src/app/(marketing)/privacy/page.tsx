import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "TheyPromised privacy policy — how we collect, use, and protect your data under UK GDPR.",
};

const LAST_UPDATED = "14 March 2026";

export default function PrivacyPage() {
  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl space-y-8 px-4">
        <div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-muted-foreground">
          TheyPromised (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is operated by
          SynqForge Ltd, a company registered in England and Wales. This policy explains
          how we collect, use, and protect your personal data when you use TheyPromised.app.
          We are committed to compliance with UK GDPR and the Data Protection Act 2018.
        </p>

        {[
          {
            title: "1. Data we collect",
            content: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Account information:</strong> Email address, full name, phone number, postal address (used as letter sender address).</p>
                <p><strong className="text-foreground">Case data:</strong> Details of your complaint(s), organisation names, case titles, descriptions, desired outcomes, reference numbers.</p>
                <p><strong className="text-foreground">Interaction logs:</strong> Records of your contacts with organisations — dates, times, channels, summaries, promises, outcomes.</p>
                <p><strong className="text-foreground">Evidence files:</strong> Documents, photographs, audio recordings, and other files you upload to support your case.</p>
                <p><strong className="text-foreground">Generated letters:</strong> Letters created using our AI tools, which incorporate your case data.</p>
                <p><strong className="text-foreground">Payment information:</strong> Handled entirely by Stripe. We do not store card details.</p>
                <p><strong className="text-foreground">Usage data:</strong> Pages visited, features used, session duration, browser and device type. Collected via Vercel Analytics and PostHog (analytics opt-in).</p>
              </div>
            ),
          },
          {
            title: "2. How we use your data",
            content: (
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ To provide and improve the TheyPromised service</li>
                <li>✓ To generate AI-assisted letters and case analysis using your case data</li>
                <li>✓ To send email reminders and alerts you have configured</li>
                <li>✓ To process subscription payments through Stripe</li>
                <li>✓ To comply with legal obligations</li>
                <li>✓ To detect and prevent fraud and abuse</li>
              </ul>
            ),
          },
          {
            title: "3. Third-party processors",
            content: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Supabase</strong> — Database and file storage. Data hosted in the EU (Ireland region). <a className="text-primary underline" href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
                <p><strong className="text-foreground">Stripe</strong> — Payment processing. Your card data is processed by Stripe and never stored on our servers. <a className="text-primary underline" href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
                <p><strong className="text-foreground">Anthropic (Claude API)</strong> — AI letter drafting and case analysis. Your case data is sent to Anthropic to generate content. Anthropic does not use API inputs to train their models. <a className="text-primary underline" href="https://anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
                <p><strong className="text-foreground">Hugging Face</strong> — AI text summarisation and classification. Used for quick summaries of interaction text. <a className="text-primary underline" href="https://huggingface.co/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
                <p><strong className="text-foreground">Resend</strong> — Transactional email delivery. Used to send reminders and notifications. <a className="text-primary underline" href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
                <p><strong className="text-foreground">Vercel</strong> — Hosting and deployment. <a className="text-primary underline" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
                <p><strong className="text-foreground">PostHog</strong> — Product analytics. Anonymised usage data with opt-in analytics. Self-hosted or EU-region option. <a className="text-primary underline" href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
              </div>
            ),
          },
          {
            title: "4. Your rights under UK GDPR",
            content: (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="space-y-1.5 ml-4">
                  <li><strong className="text-foreground">Access</strong> — request a copy of all personal data we hold about you</li>
                  <li><strong className="text-foreground">Rectification</strong> — correct any inaccurate data</li>
                  <li><strong className="text-foreground">Erasure</strong> — request deletion of your account and all associated data</li>
                  <li><strong className="text-foreground">Data portability</strong> — export your data in machine-readable format (available from Account Settings)</li>
                  <li><strong className="text-foreground">Restriction</strong> — restrict processing of your data in certain circumstances</li>
                  <li><strong className="text-foreground">Object</strong> — object to processing based on legitimate interests</li>
                  <li><strong className="text-foreground">Withdraw consent</strong> — for any processing based on consent (e.g. marketing emails)</li>
                </ul>
                <p className="mt-3">To exercise any of these rights, email <a className="text-primary underline" href="mailto:privacy@theypromised.app">privacy@theypromised.app</a>. We will respond within 30 days.</p>
              </div>
            ),
          },
          {
            title: "5. Data retention",
            content: (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>We retain your data for as long as your account is active. When you delete your account:</p>
                <ul className="space-y-1 ml-4">
                  <li>All case data, interactions, letters, and evidence are deleted immediately</li>
                  <li>Payment records are retained for 7 years for tax purposes (as required by HMRC)</li>
                  <li>Anonymised, aggregated analytics data may be retained indefinitely</li>
                </ul>
              </div>
            ),
          },
          {
            title: "6. Cookies",
            content: (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>We use <strong className="text-foreground">essential cookies only</strong> by default:</p>
                <ul className="space-y-1 ml-4">
                  <li>Authentication session cookies (Supabase)</li>
                  <li>CSRF protection</li>
                </ul>
                <p className="mt-2">Analytics cookies (PostHog) are <strong className="text-foreground">opt-in only</strong>. We do not use advertising or third-party tracking cookies.</p>
              </div>
            ),
          },
          {
            title: "7. Contact",
            content: (
              <p className="text-sm text-muted-foreground">
                Data controller: SynqForge Ltd, England, UK.
                <br />
                Privacy questions: <a className="text-primary underline" href="mailto:privacy@theypromised.app">privacy@theypromised.app</a>
                <br />
                You also have the right to lodge a complaint with the UK Information Commissioner&apos;s Office at <a className="text-primary underline" href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
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

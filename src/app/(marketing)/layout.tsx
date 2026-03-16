import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link className="text-lg font-bold text-primary" href="/">
            TheyPromised
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/calculator">Calculator</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/packs">Complaint Packs</Link>
            <Link href="/escalation-guides">Escalation Guides</Link>
            <Link href="/companies">Company Scorecards</Link>
            <Link href="/business">For Business</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link className="text-sm" href="/login">
              Log In
            </Link>
            <Link className="rounded-md bg-teal-600 px-3 py-2 text-sm text-white hover:bg-teal-700" href="/register">
              Start Free
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="mb-3 font-semibold text-slate-800">Product</p>
              <ul className="space-y-1.5 text-slate-600">
                <li><Link className="hover:text-primary" href="/register">Start Free</Link></li>
                <li><Link className="hover:text-primary" href="/pricing">Pricing</Link></li>
                <li><Link className="hover:text-primary" href="/templates">Templates</Link></li>
                <li><Link className="hover:text-primary" href="/calculator">Calculator</Link></li>
                <li><Link className="hover:text-primary" href="/escalation-guides">Escalation Guides</Link></li>
                <li><Link className="hover:text-primary" href="/packs">Complaint Packs</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 font-semibold text-slate-800">Company</p>
              <ul className="space-y-1.5 text-slate-600">
                <li><Link className="hover:text-primary" href="/about">About</Link></li>
                <li><Link className="hover:text-primary" href="/business">For Business</Link></li>
                <li><Link className="hover:text-primary" href="/companies">Company Scorecards</Link></li>
                <li><Link className="hover:text-primary" href="/privacy">Privacy Policy</Link></li>
                <li><Link className="hover:text-primary" href="/terms">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 font-semibold text-slate-800">Support</p>
              <ul className="space-y-1.5 text-slate-600">
                <li>
                  <a className="hover:text-primary" href="mailto:support@theypromised.app">
                    support@theypromised.app
                  </a>
                </li>
                <li><Link className="hover:text-primary" href="/how-it-works">User Guide</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-xs text-slate-500">
            <p>© 2026 SynqForge LTD (Company No. 16808271)</p>
            <p>3rd Floor, 86-90 Paul Street, London, EC2A 4NE</p>
            <p>Your data is encrypted in transit and at rest. We never sell your personal information.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

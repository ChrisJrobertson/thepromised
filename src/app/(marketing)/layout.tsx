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
            <Link href="/how-it-works">How it works</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/escalation-guides">Escalation guides</Link>
            <Link href="/companies">Company scorecards</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/calculator">Calculator</Link>
            <Link href="/about">About</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link className="text-sm" href="/login">
              Log in
            </Link>
            <Link className="rounded-md bg-primary px-3 py-2 text-sm text-white" href="/register">
              Start free
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="font-semibold text-slate-700">TheyPromised</p>
              <p>TheyPromised is a product of SynqForge LTD (Company No. 16808271)</p>
              <p>Registered: 3rd Floor, 86-90 Paul Street, London, EC2A 4NE</p>
              <p className="mt-2">
                Your data is encrypted in transit and at rest. We never sell or share your personal information.
              </p>
            </div>
            <div>
              <div className="flex flex-wrap gap-3">
                <Link className="hover:text-primary" href="/about">About</Link>
                <Link className="hover:text-primary" href="/pricing">Pricing</Link>
                <Link className="hover:text-primary" href="/how-it-works">How it works</Link>
                <Link className="hover:text-primary" href="/escalation-guides">Escalation guides</Link>
                <Link className="hover:text-primary" href="/companies">Company scorecards</Link>
                <Link className="hover:text-primary" href="/templates">Templates</Link>
                <Link className="hover:text-primary" href="/calculator">Calculator</Link>
                <Link className="hover:text-primary" href="/privacy">Privacy</Link>
                <Link className="hover:text-primary" href="/terms">Terms</Link>
                <Link className="hover:text-primary" href="/business">For Business</Link>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t pt-4 text-xs text-slate-400">
            © {new Date().getFullYear()} SynqForge LTD. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

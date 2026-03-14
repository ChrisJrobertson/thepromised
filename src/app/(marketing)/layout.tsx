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
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          <p>TheyPromised is a SynqForge product. Built in the UK for UK consumers.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/about">About</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/escalation-guides">Escalation guides</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

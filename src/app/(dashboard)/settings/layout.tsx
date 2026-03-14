import Link from "next/link";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <aside className="rounded-lg border bg-white p-3">
        <nav className="space-y-1 text-sm">
          <Link className="block rounded px-3 py-2 hover:bg-slate-100" href="/settings/profile">
            Profile
          </Link>
          <Link className="block rounded px-3 py-2 hover:bg-slate-100" href="/settings/billing">
            Billing
          </Link>
          <Link
            className="block rounded px-3 py-2 hover:bg-slate-100"
            href="/settings/notifications"
          >
            Notifications
          </Link>
          <Link className="block rounded px-3 py-2 hover:bg-slate-100" href="/settings/account">
            Account
          </Link>
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}

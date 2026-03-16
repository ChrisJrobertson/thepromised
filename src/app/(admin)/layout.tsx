import Link from "next/link";

import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">TheyPromised Admin</h1>
          <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-slate-900">OWNER</span>
        </div>
        <nav className="flex gap-6 text-sm">
          <Link className="hover:text-teal-400" href="/admin">Overview</Link>
          <Link className="hover:text-teal-400" href="/admin/companies">Companies</Link>
          <Link className="hover:text-teal-400" href="/admin/categories">Categories</Link>
          <Link className="hover:text-teal-400" href="/admin/users">Users</Link>
          <Link className="text-slate-400 hover:text-white" href="/dashboard">← Back to App</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

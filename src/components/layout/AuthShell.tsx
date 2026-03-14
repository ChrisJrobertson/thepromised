type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <aside className="hidden bg-primary px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-lg font-semibold">TheyPromised</p>
          <h1 className="mt-8 text-4xl font-bold leading-tight">
            They promised.
            <br />
            You proved it.
          </h1>
          <p className="mt-4 max-w-md text-sm text-slate-200">
            Track every call, email, and broken promise. Build a clear evidence
            trail and escalate confidently with UK-focused guidance.
          </p>
        </div>
        <p className="text-xs text-slate-200">
          Built in the UK for UK consumers.
        </p>
      </aside>
      <main className="flex items-center justify-center bg-slate-50 px-6 py-10">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

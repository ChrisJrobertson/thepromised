export type RightItem = {
  heading: string;
  body: string;
  legislation_ref?: string | null;
};

export function RightsCard({ item }: { item: RightItem }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-[#1a2744]">{item.heading}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
      {item.legislation_ref ? (
        <p className="mt-3">
          <span className="inline-flex rounded-full border border-[#1a2744]/20 bg-[#1a2744]/5 px-3 py-1 text-xs font-medium text-[#1a2744]">
            {item.legislation_ref}
          </span>
        </p>
      ) : null}
    </article>
  );
}

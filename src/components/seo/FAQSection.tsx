export type FaqItem = {
  question: string;
  answer: string;
};

export function FAQSection({ items, idPrefix }: { items: FaqItem[]; idPrefix: string }) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((faq, i) => {
        const id = `${idPrefix}-faq-${i}`;
        return (
          <details
            className="group rounded-xl border border-slate-200 bg-white open:shadow-sm"
            key={id}
            name={idPrefix}
          >
            <summary className="cursor-pointer list-none px-5 py-4 font-medium text-[#1a2744] marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                {faq.question}
                <span className="text-slate-400 transition group-open:rotate-180">▼</span>
              </span>
            </summary>
            <div className="border-t border-slate-100 px-5 pb-4 pt-2 text-sm leading-relaxed text-slate-600">
              {faq.answer}
            </div>
          </details>
        );
      })}
    </div>
  );
}

"use client";

import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { ComplaintTemplate } from "@/lib/data/complaint-templates";

type CategoryConfig = {
  label: string;
  badgeColour: string;
  pillActive: string;
};

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  energy: {
    label: "Energy",
    badgeColour: "bg-amber-50 text-amber-700 border-amber-200",
    pillActive: "bg-amber-500 text-white border-amber-500",
  },
  broadband_phone: {
    label: "Broadband & Phone",
    badgeColour: "bg-blue-50 text-blue-700 border-blue-200",
    pillActive: "bg-blue-600 text-white border-blue-600",
  },
  financial_services: {
    label: "Banking & Finance",
    badgeColour: "bg-green-50 text-green-700 border-green-200",
    pillActive: "bg-green-600 text-white border-green-600",
  },
  insurance: {
    label: "Insurance",
    badgeColour: "bg-purple-50 text-purple-700 border-purple-200",
    pillActive: "bg-purple-600 text-white border-purple-600",
  },
  transport: {
    label: "Transport",
    badgeColour: "bg-indigo-50 text-indigo-700 border-indigo-200",
    pillActive: "bg-indigo-600 text-white border-indigo-600",
  },
  government_council: {
    label: "Local Council",
    badgeColour: "bg-slate-100 text-slate-700 border-slate-200",
    pillActive: "bg-slate-700 text-white border-slate-700",
  },
  housing: {
    label: "Housing",
    badgeColour: "bg-orange-50 text-orange-700 border-orange-200",
    pillActive: "bg-orange-600 text-white border-orange-600",
  },
  retail: {
    label: "Retail",
    badgeColour: "bg-pink-50 text-pink-700 border-pink-200",
    pillActive: "bg-pink-600 text-white border-pink-600",
  },
  government_hmrc: {
    label: "HMRC & Tax",
    badgeColour: "bg-red-50 text-red-700 border-red-200",
    pillActive: "bg-red-600 text-white border-red-600",
  },
  government_dwp: {
    label: "DWP & Benefits",
    badgeColour: "bg-cyan-50 text-cyan-700 border-cyan-200",
    pillActive: "bg-cyan-600 text-white border-cyan-600",
  },
};

function getCategoryConfig(category: string): CategoryConfig {
  return (
    CATEGORY_CONFIG[category] ?? {
      label: category.replace(/_/g, " "),
      badgeColour: "bg-slate-100 text-slate-700 border-slate-200",
      pillActive: "bg-slate-700 text-white border-slate-700",
    }
  );
}

type TemplatesGridProps = {
  templates: ComplaintTemplate[];
};

export function TemplatesGrid({ templates }: TemplatesGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const filtered =
    activeCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  const pillBase =
    "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap";
  const pillInactive =
    "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900";

  return (
    <div className="space-y-6">
      {/* Category filter pills */}
      <div className="-mx-4 px-4 overflow-x-auto pb-1 md:mx-0 md:px-0">
        <div className="flex gap-2 md:flex-wrap">
          <button
            className={`${pillBase} ${activeCategory === "all" ? "bg-primary text-white border-primary" : pillInactive}`}
            onClick={() => setActiveCategory("all")}
            type="button"
          >
            All ({templates.length})
          </button>
          {categories.map((cat) => {
            const config = getCategoryConfig(cat);
            const count = templates.filter((t) => t.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                className={`${pillBase} ${isActive ? config.pillActive : pillInactive}`}
                key={cat}
                onClick={() => setActiveCategory(cat)}
                type="button"
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        {activeCategory === "all"
          ? `Showing all ${templates.length} templates`
          : `${filtered.length} template${filtered.length !== 1 ? "s" : ""} in ${getCategoryConfig(activeCategory).label}`}
      </p>

      {/* Template grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => {
          const config = getCategoryConfig(template.category);
          return (
            <article
              className="flex flex-col rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
              key={template.id}
            >
              <div className="flex flex-1 flex-col p-5">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold leading-tight text-slate-900">
                    {template.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.badgeColour}`}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Description */}
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {template.description}
                </p>

                {/* Common with */}
                {template.commonWith.length > 0 && (
                  <p className="mt-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-500">Common with:</span>{" "}
                    {template.commonWith.slice(0, 3).join(", ")}
                    {template.commonWith.length > 3 && ` +${template.commonWith.length - 3} more`}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t bg-slate-50/60 px-5 py-3">
                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 min-h-[44px]"
                  href={`/cases/new?template=${template.id}`}
                >
                  <FileText className="h-4 w-4" />
                  Start Complaint
                </Link>
                <Link
                  className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-primary"
                  href={`/templates/${template.slug}`}
                >
                  View template details
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-slate-500">
          <p className="text-lg font-medium">No templates in this category</p>
          <button
            className="mt-2 text-sm text-primary underline"
            onClick={() => setActiveCategory("all")}
            type="button"
          >
            Show all templates
          </button>
        </div>
      )}
    </div>
  );
}

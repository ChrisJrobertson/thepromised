"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Organisation } from "@/types/database";

type OrganisationSearchProps = {
  onSelect: (organisation: Organisation) => void;
};

export function OrganisationSearch({ onSelect }: OrganisationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("organisations")
        .select("*")
        .ilike("name", `%${query}%`)
        .limit(8);
      setResults(data ?? []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="space-y-2">
      <input
        className="w-full rounded-md border px-3 py-2 text-sm"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search organisation name"
        value={query}
      />
      {loading ? <p className="text-xs text-muted-foreground">Searching...</p> : null}
      <ul className="space-y-1">
        {results.map((organisation) => (
          <li key={organisation.id}>
            <button
              className="w-full rounded border p-2 text-left text-sm hover:bg-slate-50"
              onClick={() => onSelect(organisation)}
              type="button"
            >
              {organisation.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

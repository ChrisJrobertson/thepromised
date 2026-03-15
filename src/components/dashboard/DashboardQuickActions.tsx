"use client";

import { useState } from "react";
import { toast } from "sonner";

import { InteractionModal } from "@/components/cases/InteractionModal";
import { createClient } from "@/lib/supabase/client";
import type { Case } from "@/types/database";

export function DashboardQuickActions() {
  const [modalOpen, setModalOpen] = useState(false);
  const [cases, setCases] = useState<Pick<Case, "id" | "title">[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleLogInteraction() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("cases")
        .select("id, title")
        .in("status", ["open", "escalated"])
        .order("updated_at", { ascending: false })
        .limit(20);

      const openCases = (data as Pick<Case, "id" | "title">[] | null) ?? [];

      if (openCases.length === 0) {
        toast.info("No open cases yet", {
          description: "Create a case first, then you can log interactions.",
          action: {
            label: "New Case",
            onClick: () => {
              window.location.href = "/cases/new";
            },
          },
        });
        return;
      }

      setCases(openCases);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
        disabled={loading}
        onClick={handleLogInteraction}
        type="button"
      >
        {loading ? "Loading..." : "Log an Interaction"}
      </button>

      <InteractionModal
        cases={cases}
        onOpenChange={setModalOpen}
        open={modalOpen}
      />
    </>
  );
}

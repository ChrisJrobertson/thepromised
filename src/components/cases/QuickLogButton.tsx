"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { InteractionModal } from "@/components/cases/InteractionModal";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Case } from "@/types/database";

export function QuickLogButton() {
  const [open, setOpen] = useState(false);
  const [cases, setCases] = useState<Pick<Case, "id" | "title">[]>([]);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("cases")
      .select("id, title")
      .in("status", ["open", "escalated"])
      .order("updated_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setCases((data as Pick<Case, "id" | "title">[] | null) ?? []);
      });
  }, [open]);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="mr-1 size-4" /> Log Interaction
      </Button>
      <InteractionModal
        cases={cases}
        onOpenChange={setOpen}
        open={open}
      />
    </>
  );
}

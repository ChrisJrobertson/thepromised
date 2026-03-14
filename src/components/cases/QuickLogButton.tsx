"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { InteractionModal } from "@/components/cases/InteractionModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Case } from "@/types/database";

export function QuickLogButton() {
  const [open, setOpen] = useState(false);
  const [showCasePicker, setShowCasePicker] = useState(false);
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const [cases, setCases] = useState<Pick<Case, "id" | "title">[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");

  const selectedCase = cases.find((c) => c.id === selectedCaseId) ?? null;

  async function handleQuickLogClick() {
    setIsLoadingCases(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("cases")
        .select("id, title")
        .in("status", ["open", "escalated"])
        .order("updated_at", { ascending: false })
        .limit(20);

      const openCases = (data as Pick<Case, "id" | "title">[] | null) ?? [];
      setCases(openCases);

      if (openCases.length === 0) {
        toast.info("Create a case first", {
          action: {
            label: "New Case",
            onClick: () => {
              window.location.href = "/cases/new";
            },
          },
        });
        return;
      }

      if (openCases.length === 1) {
        setSelectedCaseId(openCases[0].id);
        setOpen(true);
        return;
      }

      setSelectedCaseId(openCases[0].id);
      setShowCasePicker(true);
    } finally {
      setIsLoadingCases(false);
    }
  }

  function handleOpenFromPicker() {
    if (!selectedCaseId) return;
    setShowCasePicker(false);
    setOpen(true);
  }

  return (
    <>
      <Button disabled={isLoadingCases} onClick={handleQuickLogClick} size="sm">
        <Plus className="mr-1 size-4" /> Log Interaction
      </Button>

      <Dialog onOpenChange={setShowCasePicker} open={showCasePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Which case?</DialogTitle>
            <DialogDescription>
              Select a case before logging your interaction.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Select onValueChange={setSelectedCaseId} value={selectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((caseItem) => (
                  <SelectItem key={caseItem.id} value={caseItem.id}>
                    {caseItem.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button disabled={!selectedCaseId} onClick={handleOpenFromPicker} type="button">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InteractionModal
        cases={cases}
        onOpenChange={setOpen}
        open={open}
        preselectedCase={selectedCase}
      />
    </>
  );
}

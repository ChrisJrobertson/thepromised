"use client";

import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function LetterActions({ letterId, subject, body }: { letterId: string; subject: string; body: string }) {
  async function downloadPdf() {
    const res = await fetch("/api/export/letter-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letterId }),
    });
    if (!res.ok) {
      toast.error("Could not generate PDF");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyBody() {
    await navigator.clipboard.writeText(body);
    toast.success("Letter copied");
  }

  return (
    <>
      <Button onClick={downloadPdf} size="sm" type="button" variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download PDF
      </Button>
      <Button onClick={copyBody} size="sm" type="button" variant="outline">
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Button>
    </>
  );
}

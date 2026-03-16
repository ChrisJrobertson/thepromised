"use client";

import { Copy, Mail } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { logInteraction } from "@/lib/actions/interactions";
import { createClient } from "@/lib/supabase/client";

type ForwardReplyPanelProps = {
  caseId: string;
  userId: string;
  initialAlias: string | null;
  companyName: string;
};

export function ForwardReplyPanel({
  caseId,
  userId,
  initialAlias,
  companyName,
}: ForwardReplyPanelProps) {
  const [alias, setAlias] = useState(initialAlias);
  const [loadingAlias, setLoadingAlias] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 16));
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (alias) return;
    setLoadingAlias(true);
    void fetch(`/api/cases/${caseId}/inbound-alias`, { method: "POST" })
      .then(async (res) => {
        if (!res.ok) return;
        const payload = (await res.json()) as { alias?: string };
        if (payload.alias) setAlias(payload.alias);
      })
      .finally(() => setLoadingAlias(false));
  }, [alias, caseId]);

  const inboundAddress = alias ? `${alias}@ingest.theypromised.app` : "Generating...";

  async function copyAddress() {
    await navigator.clipboard.writeText(inboundAddress);
    toast.success("Forwarding address copied");
  }

  function handleManualLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const summary = `Inbound reply from ${from || companyName}\nSubject: ${subject || "No subject"}\n\n${body}`;
      const result = await logInteraction({
        case_id: caseId,
        interaction_date: new Date(receivedAt).toISOString(),
        channel: "email",
        direction: "inbound",
        contact_name: from || null,
        summary: summary.slice(0, 2000),
        outcome: "other",
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (file && result.interactionId) {
        const supabase = createClient();
        const storagePath = `${userId}/${caseId}/reply-${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("evidence").upload(storagePath, file);
        if (!uploadError) {
          await supabase.from("evidence").insert({
            case_id: caseId,
            interaction_id: result.interactionId,
            user_id: userId,
            file_name: file.name,
            file_type: file.type || "application/octet-stream",
            file_size: file.size,
            storage_path: storagePath,
            evidence_type: "email",
            description: `Manual reply upload: ${subject || "No subject"}`,
          });
        }
      }

      await fetch(`/api/cases/${caseId}/response-received`, { method: "POST" });
      toast.success("Reply logged and case updated");
      setShowForm(false);
      setBody("");
      setFrom("");
      setSubject("");
      setFile(null);
      window.location.reload();
    });
  }

  return (
    <section className="rounded-lg border bg-white p-4">
      <details open className="group">
        <summary className="cursor-pointer list-none text-sm font-medium">
          📨 Forward company replies to track them
        </summary>
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-700">When the company replies, forward their email to:</p>
          <div className="flex items-center justify-between rounded border bg-slate-50 px-3 py-2 font-mono text-sm">
            <span>{loadingAlias ? "Generating..." : inboundAddress}</span>
            <button className="text-slate-600 hover:text-slate-900" onClick={copyAddress} type="button">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500">The email will be automatically added to your timeline.</p>

          <Button onClick={() => setShowForm((v) => !v)} size="sm" type="button" variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Log a Reply
          </Button>

          {showForm ? (
            <form className="space-y-3 rounded border p-3" onSubmit={handleManualLog}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs">
                  Date received
                  <Input onChange={(e) => setReceivedAt(e.target.value)} type="datetime-local" value={receivedAt} />
                </label>
                <label className="text-xs">
                  From
                  <Input onChange={(e) => setFrom(e.target.value)} placeholder="Name or email" value={from} />
                </label>
              </div>
              <label className="text-xs">
                Subject
                <Input onChange={(e) => setSubject(e.target.value)} placeholder="Subject" value={subject} />
              </label>
              <label className="text-xs">
                Paste email body
                <Textarea className="min-h-[120px]" onChange={(e) => setBody(e.target.value)} value={body} />
              </label>
              <label className="text-xs">
                Upload as evidence (optional)
                <Input onChange={(e) => setFile(e.target.files?.[0] ?? null)} type="file" />
              </label>
              <Button disabled={isPending} type="submit">
                {isPending ? "Logging..." : "Save Reply"}
              </Button>
            </form>
          ) : null}
        </div>
      </details>
    </section>
  );
}

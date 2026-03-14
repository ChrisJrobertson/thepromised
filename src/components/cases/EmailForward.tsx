"use client";

import { Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { extractInteractionEntities, logInteraction } from "@/lib/actions/interactions";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

type EmailForwardProps = {
  caseId: string;
  userId: string;
  profile: Pick<Profile, "subscription_tier">;
};

type ParsedEmail = {
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
};

function parseForwardedEmail(text: string): ParsedEmail {
  const lines = text.split("\n");
  const parsed: ParsedEmail = {
    from: "",
    to: "",
    subject: "",
    date: "",
    body: "",
  };

  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^from:/i.test(line)) {
      parsed.from = line.replace(/^from:\s*/i, "");
      bodyStart = i + 1;
    } else if (/^to:/i.test(line)) {
      parsed.to = line.replace(/^to:\s*/i, "");
      bodyStart = i + 1;
    } else if (/^subject:/i.test(line)) {
      parsed.subject = line.replace(/^subject:\s*/i, "");
      bodyStart = i + 1;
    } else if (/^(date|sent):/i.test(line)) {
      parsed.date = line.replace(/^(date|sent):\s*/i, "");
      bodyStart = i + 1;
    } else if (line === "" && bodyStart > 0) {
      // First blank line after headers = start of body
      parsed.body = lines.slice(i + 1).join("\n").trim();
      break;
    }
  }

  if (!parsed.body) {
    parsed.body = text;
  }

  return parsed;
}

export function EmailForward({ caseId, userId, profile }: EmailForwardProps) {
  if (profile.subscription_tier === "free") {
    return (
      <UpgradePrompt
        description="Paste a forwarded email and we'll log it as an interaction automatically. Available on Basic and Pro plans."
        requiredTier="basic"
        title="Email forwarding requires Basic or Pro"
      />
    );
  }

  return <EmailForwardInner caseId={caseId} userId={userId} />;
}

function EmailForwardInner({
  caseId,
  userId,
}: {
  caseId: string;
  userId: string;
}) {
  const [emailText, setEmailText] = useState("");
  const [parsed, setParsed] = useState<ParsedEmail | null>(null);
  const [contactName, setContactName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [extractedNames, setExtractedNames] = useState<string[]>([]);
  const [extractedReferences, setExtractedReferences] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleParse() {
    if (!emailText.trim()) {
      toast.error("Please paste an email first");
      return;
    }

    const result = parseForwardedEmail(emailText);
    setParsed(result);
    setContactName(result.from || "");
    setReferenceNumber("");
    setExtractedNames([]);
    setExtractedReferences([]);

    setIsParsing(true);
    try {
      const extracted = await extractInteractionEntities(result.body || emailText);
      if (extracted.error) {
        toast.error(extracted.error);
        return;
      }

      const names = extracted.entities?.names ?? [];
      const references = extracted.entities?.references ?? [];
      setExtractedNames(names);
      setExtractedReferences(references);

      if (extracted.contactName) {
        setContactName(extracted.contactName);
      }
      if (extracted.referenceNumber) {
        setReferenceNumber(extracted.referenceNumber);
      }
    } catch {
      toast.error("Could not extract entities from the email");
    } finally {
      setIsParsing(false);
    }
  }

  function handleLog() {
    if (!parsed) return;

    startTransition(async () => {
      // Try to parse date from the email
      let interactionDate = new Date().toISOString();
      if (parsed.date) {
        try {
          const d = new Date(parsed.date);
          if (!isNaN(d.getTime())) {
            interactionDate = d.toISOString();
          }
        } catch {
          // use current date
        }
      }

      const summary = [
        parsed.from ? `From: ${parsed.from}` : null,
        parsed.to ? `To: ${parsed.to}` : null,
        parsed.subject ? `Subject: ${parsed.subject}` : null,
        "",
        parsed.body,
      ]
        .filter((l) => l !== null)
        .join("\n");

      const result = await logInteraction({
        case_id: caseId,
        interaction_date: interactionDate,
        channel: "email",
        direction: parsed.from.toLowerCase().includes("@") ? "inbound" : "outbound",
        summary: summary.length > 20 ? summary : `Email received: ${parsed.subject || "No subject"}. ${parsed.body}`,
        contact_name: contactName.trim() || null,
        reference_number: referenceNumber.trim() || null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Also save email text as evidence
      const supabase = createClient();
      const blob = new Blob([emailText], { type: "text/plain" });
      const filename = `email-${Date.now()}.txt`;
      const storagePath = `${userId}/${caseId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(storagePath, blob, { contentType: "text/plain" });

      if (!uploadError) {
        await supabase.from("evidence").insert({
          case_id: caseId,
          user_id: userId,
          interaction_id: result.interactionId ?? null,
          file_name: filename,
          file_type: "text/plain",
          file_size: blob.size,
          storage_path: storagePath,
          evidence_type: "email",
          description: `Email: ${parsed.subject || "No subject"}`,
        });
      }

      toast.success("Email logged as an interaction");
      setEmailText("");
      setParsed(null);
      setContactName("");
      setReferenceNumber("");
      setExtractedNames([]);
      setExtractedReferences([]);
    });
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">Log a forwarded email</p>
          <p className="text-xs text-muted-foreground">
            Paste your email here and we&apos;ll log it for you
          </p>
        </div>
      </div>

      <Textarea
        className="min-h-[200px] font-mono text-xs"
        onChange={(e) => {
          setEmailText(e.target.value);
          setParsed(null);
          setContactName("");
          setReferenceNumber("");
          setExtractedNames([]);
          setExtractedReferences([]);
        }}
        placeholder="From: billing@example.com
To: you@email.com
Date: 14 March 2026
Subject: Re: Complaint Reference 12345

Dear Customer,

Thank you for your complaint dated...
"
        value={emailText}
      />

      {parsed && (
        <div className="space-y-3 rounded-md border bg-muted/50 p-3 text-xs">
          <p className="font-medium mb-2">Parsed email:</p>
          {parsed.from && <p><span className="text-muted-foreground">From:</span> {parsed.from}</p>}
          {parsed.to && <p><span className="text-muted-foreground">To:</span> {parsed.to}</p>}
          {parsed.subject && <p><span className="text-muted-foreground">Subject:</span> {parsed.subject}</p>}
          {parsed.date && <p><span className="text-muted-foreground">Date:</span> {parsed.date}</p>}
          {parsed.body && (
            <div>
              <span className="text-muted-foreground">Body preview:</span>
              <p className="mt-1 line-clamp-3 text-muted-foreground">{parsed.body}</p>
            </div>
          )}

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">
                Contact name (editable)
              </p>
              <Input
                onChange={(event) => setContactName(event.target.value)}
                placeholder="Contact name"
                value={contactName}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">
                Reference number (editable)
              </p>
              <Input
                onChange={(event) => setReferenceNumber(event.target.value)}
                placeholder="Reference number"
                value={referenceNumber}
              />
            </div>
          </div>

          {(extractedNames.length > 0 || extractedReferences.length > 0) && (
            <div className="space-y-1 rounded-md border bg-background p-2">
              <p className="text-[11px] font-medium text-muted-foreground">
                Extracted entities
              </p>
              {extractedNames.length > 0 && (
                <p>
                  <span className="text-muted-foreground">Names:</span>{" "}
                  {extractedNames.join(", ")}
                </p>
              )}
              {extractedReferences.length > 0 && (
                <p>
                  <span className="text-muted-foreground">References:</span>{" "}
                  {extractedReferences.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {!parsed ? (
          <Button
            disabled={!emailText.trim() || isParsing}
            onClick={handleParse}
            size="sm"
            type="button"
            variant="outline"
          >
            {isParsing ? "Extracting..." : "Parse Email"}
          </Button>
        ) : (
          <>
            <Button
              disabled={isPending || isParsing}
              onClick={handleLog}
              size="sm"
              type="button"
            >
              {isPending ? "Logging..." : isParsing ? "Extracting..." : "Log as Interaction"}
            </Button>
            <Button
              onClick={() => setParsed(null)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { AlertTriangle, CheckCheck, CheckCircle, Eye, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SendLetterButtonProps = {
  letterId: string;
  deliveryStatus: string | null;
  sentToEmail: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  recipientEmail: string | null;
  userEmail: string;
};

function statusBadge(props: {
  deliveryStatus: string | null;
  sentToEmail: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
}) {
  if (props.deliveryStatus === "opened") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-teal-100 px-2 py-1 text-xs text-teal-700">
        <Eye className="h-3.5 w-3.5" /> Opened at{" "}
        {props.openedAt ? new Date(props.openedAt).toLocaleString("en-GB") : "—"}
      </span>
    );
  }
  if (props.deliveryStatus === "delivered") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs text-green-700">
        <CheckCheck className="h-3.5 w-3.5" /> Delivered at{" "}
        {props.deliveredAt ? new Date(props.deliveredAt).toLocaleString("en-GB") : "—"}
      </span>
    );
  }
  if (props.deliveryStatus === "sent") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs text-green-700">
        <CheckCircle className="h-3.5 w-3.5" /> Sent to {props.sentToEmail ?? "recipient"} at{" "}
        {props.sentAt ? new Date(props.sentAt).toLocaleString("en-GB") : "—"}
      </span>
    );
  }
  if (props.deliveryStatus === "bounced") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700">
        <AlertTriangle className="h-3.5 w-3.5" /> Bounced — check email
      </span>
    );
  }
  return null;
}

export function SendLetterButton({
  letterId,
  deliveryStatus,
  sentToEmail,
  sentAt,
  deliveredAt,
  openedAt,
  recipientEmail,
  userEmail,
}: SendLetterButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(deliveryStatus);
  const [sentEmail, setSentEmail] = useState(sentToEmail);
  const [sentTime, setSentTime] = useState(sentAt);

  const badge = statusBadge({
    deliveryStatus: status,
    sentToEmail: sentEmail,
    sentAt: sentTime,
    deliveredAt,
    openedAt,
  });
  if (badge) return badge;

  if (!recipientEmail) {
    return (
      <p className="text-xs text-amber-700">
        No complaint email available. Add one in case settings or download as PDF.
      </p>
    );
  }

  async function sendLetter() {
    setSubmitting(true);
    const res = await fetch(`/api/letters/${letterId}/send`, { method: "POST" });
    setSubmitting(false);

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(body.error ?? "Failed to send letter");
      return;
    }
    const payload = (await res.json()) as {
      sent_to_email?: string;
      sent_at?: string;
    };
    setStatus("sent");
    setSentEmail(payload.sent_to_email ?? recipientEmail);
    setSentTime(payload.sent_at ?? new Date().toISOString());
    setOpen(false);
    toast.success("Letter sent successfully");
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" type="button">
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
        Send via Email
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send this letter?</DialogTitle>
            <DialogDescription>
              This will email your complaint letter directly to:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>📧 {recipientEmail}</p>
            <p>The email will be sent from TheyPromised on your behalf.</p>
            <p>Replies will go to your email address ({userEmail}).</p>
            <p>This interaction will be automatically logged on your case timeline.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline">Cancel</Button>
            <Button disabled={submitting} onClick={sendLetter}>
              {submitting ? "Sending..." : "Confirm and Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

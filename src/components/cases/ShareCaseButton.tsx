"use client";

import { Check, Copy, Link, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ShareCaseButtonProps = {
  caseId: string;
  initialIsShared?: boolean;
  initialShareToken?: string | null;
};

export function ShareCaseButton({
  caseId,
  initialIsShared = false,
  initialShareToken = null,
}: ShareCaseButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isShared, setIsShared] = useState(initialIsShared);
  const [shareUrl, setShareUrl] = useState<string | null>(
    initialIsShared && initialShareToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/shared/${initialShareToken}`
      : null
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleEnableSharing() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/share`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate share link");
        return;
      }
      setShareUrl(data.shareUrl);
      setIsShared(true);
      toast.success("Share link generated");
    } catch {
      toast.error("Failed to generate share link");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisableSharing() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/share`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to disable sharing");
        return;
      }
      setShareUrl(null);
      setIsShared(false);
      toast.success("Sharing disabled");
    } catch {
      toast.error("Failed to disable sharing");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button
        className="gap-2"
        onClick={() => setDialogOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this case</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <strong>Privacy:</strong> Sharing creates a read-only link to your case timeline.
              Your uploaded files, letters, and contact details are <strong>not</strong> included.
            </div>

            {!isShared ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sharing is currently <strong>off</strong>. Enable it to generate a link you can
                  share with others — such as a solicitor, ombudsman adviser, or family member.
                </p>
                <Button
                  className="w-full gap-2"
                  disabled={loading}
                  onClick={handleEnableSharing}
                  type="button"
                >
                  <Link className="h-4 w-4" />
                  {loading ? "Generating link..." : "Enable sharing"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sharing is <strong className="text-green-600">on</strong>. Anyone with this link
                  can view your case timeline (read-only).
                </p>
                <div className="flex gap-2">
                  <Input
                    className="flex-1 text-xs"
                    readOnly
                    value={shareUrl ?? ""}
                  />
                  <Button
                    className="shrink-0 gap-1.5"
                    onClick={handleCopy}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <Button
                  className="w-full"
                  disabled={loading}
                  onClick={handleDisableSharing}
                  type="button"
                  variant="outline"
                >
                  {loading ? "Disabling..." : "Disable sharing"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

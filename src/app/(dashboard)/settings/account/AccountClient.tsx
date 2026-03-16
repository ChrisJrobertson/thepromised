"use client";

import { Download, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type AccountClientProps = {
  lastExportAt: string | null;
};

export function AccountClient({ lastExportAt }: AccountClientProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [exportedAt, setExportedAt] = useState(lastExportAt);

  const canExport =
    !exportedAt || Date.now() - new Date(exportedAt).getTime() >= 24 * 60 * 60 * 1000;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleDeleteAccount() {
    if (confirmDeleteText !== "DELETE") {
      toast.error("Type DELETE to confirm");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        toast.error(`Deletion failed: ${body.error ?? "Unknown error"}`);
      } else {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/?deleted=true");
      }
    });
  }

  async function handleExportData() {
    try {
      const response = await fetch("/api/account/export", { method: "GET" });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        toast.error(body.error ?? "Export failed. Please try again.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "theypromised-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data export downloaded");
      setExportedAt(new Date().toISOString());
    } catch {
      toast.error("Export failed. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Data export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export your data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Download all your data including cases, interactions, letters, and reminders as a JSON file.
          </p>
          {exportedAt ? (
            <p className="text-xs text-muted-foreground">
              Last export: {new Date(exportedAt).toLocaleString("en-GB")}
            </p>
          ) : null}
          <Button disabled={!canExport} onClick={handleExportData} size="sm" type="button" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export My Data
          </Button>
          {!canExport ? <p className="text-xs text-muted-foreground">You can export again in 24 hours.</p> : null}
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sign out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Sign out of TheyPromised on this device.
          </p>
          <Button onClick={handleSignOut} size="sm" type="button" variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      {/* Delete account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-700">Delete account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This action is permanent and cannot be undone. All your cases, interactions,
            evidence, and letters will be permanently deleted.
          </p>
          <Button
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete account
          </Button>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteDialog(false);
            setConfirmEmail("");
          }
        }}
        open={showDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">This will permanently delete your account and all associated data. Your subscription will be cancelled. This cannot be undone.</p>
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <strong>This cannot be undone.</strong> Export your data first if needed.
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Type DELETE to confirm
              </label>
              <Input
                onChange={(e) => setConfirmDeleteText(e.target.value)}
                placeholder="DELETE"
                value={confirmDeleteText}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteDialog(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending || confirmDeleteText !== "DELETE"}
                onClick={handleDeleteAccount}
                type="button"
                variant="destructive"
              >
                {isPending ? "Deleting..." : "Delete account permanently"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

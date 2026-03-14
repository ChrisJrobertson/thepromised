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
import { deleteAccount } from "@/lib/actions/settings";
import { createClient } from "@/lib/supabase/client";

type AccountClientProps = {
  email: string;
};

export function AccountClient({ email }: AccountClientProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleDeleteAccount() {
    if (confirmEmail !== email) {
      toast.error("Email address does not match");
      return;
    }

    startTransition(async () => {
      const result = await deleteAccount();
      if (result.error) {
        toast.error(`Deletion failed: ${result.error}`);
      } else {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/?deleted=true");
      }
    });
  }

  async function handleExportData() {
    try {
      const response = await fetch("/api/export/data", { method: "POST" });
      if (!response.ok) {
        toast.error("Export failed. Please try again.");
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
            Download all your cases, interactions, letters, and account data as a JSON file.
            This is your right under UK GDPR Article 20 (right to data portability).
          </p>
          <Button onClick={handleExportData} size="sm" type="button" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export all data
          </Button>
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
            Permanently delete your account and all associated data. This cannot be undone.
            Your Stripe subscription will be cancelled immediately.
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
            <p className="text-sm text-muted-foreground">
              This will permanently delete:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>All your cases, interactions, and evidence</li>
              <li>All generated letters</li>
              <li>Your Stripe subscription</li>
              <li>Your account and profile</li>
            </ul>
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <strong>This cannot be undone.</strong> Export your data first if needed.
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Type your email address to confirm: <strong>{email}</strong>
              </label>
              <Input
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={email}
                type="email"
                value={confirmEmail}
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
                disabled={isPending || confirmEmail !== email}
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

"use client";

import { formatDistanceToNow } from "date-fns";
import { enGB } from "date-fns/locale";
import {
  Download,
  FileAudio,
  FileText,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteEvidence } from "@/lib/actions/evidence";
import { createClient } from "@/lib/supabase/client";
import type { Evidence } from "@/types/database";

type EvidenceGalleryProps = {
  caseId: string;
  evidence: Evidence[];
};

type FilterType = "all" | "images" | "documents" | "audio";

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "images", label: "Images" },
  { value: "documents", label: "Documents" },
  { value: "audio", label: "Audio" },
];

function isImage(fileType: string) {
  return fileType.startsWith("image/");
}
function isAudio(fileType: string) {
  return fileType.startsWith("audio/");
}

function filterEvidence(evidence: Evidence[], filter: FilterType) {
  if (filter === "all") return evidence;
  if (filter === "images") return evidence.filter((e) => isImage(e.file_type));
  if (filter === "audio") return evidence.filter((e) => isAudio(e.file_type));
  if (filter === "documents")
    return evidence.filter((e) => !isImage(e.file_type) && !isAudio(e.file_type));
  return evidence;
}

export function EvidenceGallery({ caseId, evidence: initialEvidence }: EvidenceGalleryProps) {
  const [evidence, setEvidence] = useState(initialEvidence);
  const [filter, setFilter] = useState<FilterType>("all");
  const [previewItem, setPreviewItem] = useState<Evidence | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Evidence | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = filterEvidence(evidence, filter);

  async function handlePreview(item: Evidence) {
    setPreviewItem(item);
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("evidence")
      .createSignedUrl(item.storage_path, 3600);
    setPreviewUrl(data?.signedUrl ?? null);
  }

  async function handleDownload(item: Evidence) {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("evidence")
      .createSignedUrl(item.storage_path, 60);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = item.file_name;
      a.click();
    }
  }

  function handleDelete(item: Evidence) {
    startTransition(async () => {
      const result = await deleteEvidence(item.id, caseId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setEvidence((prev) => prev.filter((e) => e.id !== item.id));
        setConfirmDelete(null);
        toast.success("Evidence deleted");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} file{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">No evidence yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload files when logging an interaction
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((item) => (
            <div
              className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
              key={item.id}
            >
              <button
                className="w-full"
                onClick={() => handlePreview(item)}
                type="button"
              >
                {isImage(item.file_type) ? (
                  <div className="flex h-28 items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : isAudio(item.file_type) ? (
                  <div className="flex h-28 items-center justify-center bg-purple-50">
                    <FileAudio className="h-8 w-8 text-purple-400" />
                  </div>
                ) : (
                  <div className="flex h-28 items-center justify-center bg-blue-50">
                    <FileText className="h-8 w-8 text-blue-400" />
                  </div>
                )}
              </button>

              <div className="p-2">
                <p className="truncate text-xs font-medium">{item.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {(item.file_size / 1024).toFixed(0)} KB ·{" "}
                  {item.created_at
                    ? formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: enGB,
                      })
                    : ""}
                </p>
              </div>

              {/* Hover actions */}
              <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  className="h-6 w-6 bg-white/90 p-0 shadow"
                  onClick={() => handleDownload(item)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  className="h-6 w-6 bg-white/90 p-0 shadow"
                  onClick={() => setConfirmDelete(item)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog onOpenChange={(open) => { if (!open) { setPreviewItem(null); setPreviewUrl(null); } }} open={!!previewItem}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.file_name}</DialogTitle>
          </DialogHeader>
          {previewUrl && previewItem && (
            <div className="mt-2">
              {isImage(previewItem.file_type) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={previewItem.file_name}
                  className="max-h-[70vh] w-full object-contain rounded"
                  src={previewUrl}
                />
              ) : isAudio(previewItem.file_type) ? (
                <audio className="w-full" controls src={previewUrl} />
              ) : previewItem.file_type === "application/pdf" ? (
                <iframe
                  className="h-[70vh] w-full rounded border"
                  src={previewUrl}
                  title={previewItem.file_name}
                />
              ) : (
                <div className="rounded border p-4 text-center text-sm text-muted-foreground">
                  <p>Preview not available for this file type.</p>
                  <Button
                    className="mt-3"
                    onClick={() => handleDownload(previewItem)}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          )}
          {previewItem?.interaction_id && (
            <p className="mt-2 text-xs text-muted-foreground">
              Linked to interaction recorded on{" "}
              {previewItem.created_at ? new Date(previewItem.created_at).toLocaleDateString("en-GB") : ""}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog onOpenChange={(open) => { if (!open) setConfirmDelete(null); }} open={!!confirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete evidence?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong>{confirmDelete?.file_name}</strong>? This cannot be undone.
          </p>
          <div className="mt-4 flex gap-3 justify-end">
            <Button
              onClick={() => setConfirmDelete(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              type="button"
              variant="destructive"
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

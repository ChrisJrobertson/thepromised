"use client";

import { FileText, Image as ImageIcon, Music, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import type { Evidence } from "@/types/database";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg",
  "audio/mp4",
  "audio/webm",
  "text/plain",
];

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "heic", "pdf", "doc", "docx", "mp3", "m4a", "webm", "txt"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

type UploadState = {
  file: File;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
  preview?: string;
};

type EvidenceUploadProps = {
  caseId: string;
  userId: string;
  interactionId?: string | null;
  onUploaded?: (evidence: Evidence) => void;
};

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (type.startsWith("audio/")) return <Music className="h-5 w-5 text-purple-500" />;
  return <FileText className="h-5 w-5 text-slate-500" />;
}

function getEvidenceType(mimeType: string): Evidence["evidence_type"] {
  if (mimeType.startsWith("image/")) return "photo";
  if (mimeType.startsWith("audio/")) return "voice_memo";
  if (mimeType === "application/pdf") return "document";
  if (mimeType.includes("word")) return "document";
  if (mimeType === "text/plain") return "email";
  return "document";
}

export function EvidenceUpload({
  caseId,
  userId,
  interactionId,
  onUploaded,
}: EvidenceUploadProps) {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`${file.name}: File type not allowed`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name}: File exceeds 10 MB limit`);
      return;
    }

    const id = `${Date.now()}-${file.name}`;
    const ext = file.name.split(".").pop() ?? "bin";
    const storagePath = `${userId}/${caseId}/${id}.${ext}`;

    // Generate preview for images
    let preview: string | undefined;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }

    setUploads((prev) => [
      ...prev,
      { file, progress: 0, status: "uploading", preview },
    ]);

    try {
      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(storagePath, file, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      // Simulate progress (Supabase JS doesn't expose upload progress natively)
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, progress: 80 } : u
        )
      );

      // Create evidence record via server action (we call the DB client-side here
      // since this is a client component — RLS protects the insert)
      const { data: evidenceRecord, error: dbError } = await supabase
        .from("evidence")
        .insert({
          case_id: caseId,
          user_id: userId,
          interaction_id: interactionId ?? null,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          evidence_type: getEvidenceType(file.type),
        })
        .select("*")
        .single();

      if (dbError) throw new Error(dbError.message);

      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, progress: 100, status: "done" } : u
        )
      );

      onUploaded?.(evidenceRecord as Evidence);
      toast.success(`${file.name} uploaded`);
    } catch (err) {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file
            ? {
                ...u,
                status: "error",
                error: err instanceof Error ? err.message : "Upload failed",
              }
            : u
        )
      );
      toast.error(`Failed to upload ${file.name}`);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files) return;
    Array.from(files).forEach(uploadFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, userId, interactionId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <button
        className={`w-full rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-muted-foreground/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        type="button"
      >
        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop files here or click to browse
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, HEIC, PDF, DOC, DOCX, MP3, M4A, WEBM, TXT · Max 10 MB
        </p>
      </button>

      <input
        accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
        className="hidden"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        ref={inputRef}
        type="file"
      />

      {/* Upload list */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, i) => (
            <div
              className="flex items-center gap-3 rounded-md border p-2 text-sm"
              key={i}
            >
              {upload.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={upload.file.name}
                  className="h-10 w-10 rounded object-cover"
                  src={upload.preview}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                  {getFileIcon(upload.file.type)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{upload.file.name}</p>
                {upload.status === "uploading" && (
                  <Progress className="mt-1 h-1.5" value={upload.progress} />
                )}
                {upload.status === "done" && (
                  <p className="text-xs text-green-600">Uploaded</p>
                )}
                {upload.status === "error" && (
                  <p className="text-xs text-red-600">{upload.error}</p>
                )}
              </div>

              <Button
                className="h-6 w-6 p-0"
                onClick={() =>
                  setUploads((prev) => prev.filter((_, j) => j !== i))
                }
                size="sm"
                type="button"
                variant="ghost"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

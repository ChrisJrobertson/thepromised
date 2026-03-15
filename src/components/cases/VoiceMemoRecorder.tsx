"use client";

import { Mic, Square, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { createClient } from "@/lib/supabase/client";
import type { Evidence, Profile } from "@/types/database";

type VoiceMemoRecorderProps = {
  caseId: string;
  userId: string;
  profile: Pick<Profile, "subscription_tier">;
  interactionId?: string | null;
  onSaved?: (evidence: Evidence) => void;
};

export function VoiceMemoRecorder({
  caseId,
  userId,
  profile,
  interactionId,
  onSaved,
}: VoiceMemoRecorderProps) {
  if (profile.subscription_tier !== "pro") {
    return (
      <UpgradePrompt
        description="Voice memo recording is available on the Pro plan. Record what happened while it's fresh — your own words are powerful evidence."
        requiredTier="pro"
        title="Voice memos require Pro"
      />
    );
  }

  return <VoiceMemoRecorderInner {...{ caseId, userId, interactionId, onSaved }} />;
}

function VoiceMemoRecorderInner({
  caseId,
  userId,
  interactionId,
  onSaved,
}: Omit<VoiceMemoRecorderProps, "profile">) {
  const [state, setState] = useState<"idle" | "recording" | "stopped">("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setBlob(audioBlob);
        setAudioUrl(url);
        setState("stopped");
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setState("recording");
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      toast.error("Could not access microphone. Please check your permissions.");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }

  function discard() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setBlob(null);
    setDuration(0);
    setState("idle");
  }

  async function saveMemo() {
    if (!blob) return;
    setIsSaving(true);

    try {
      const supabase = createClient();
      const filename = `voice-memo-${Date.now()}.webm`;
      const storagePath = `${userId}/${caseId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(storagePath, blob, { contentType: "audio/webm" });

      if (uploadError) throw new Error(uploadError.message);

      const { data: evidenceRecord, error: dbError } = await supabase
        .from("evidence")
        .insert({
          case_id: caseId,
          user_id: userId,
          interaction_id: interactionId ?? null,
          file_name: filename,
          file_type: "audio/webm",
          file_size: blob.size,
          storage_path: storagePath,
          evidence_type: "voice_memo",
          description: `Voice memo (${formatDuration(duration)})`,
        })
        .select("*")
        .single();

      if (dbError) throw new Error(dbError.message);

      toast.success("Voice memo saved");
      onSaved?.(evidenceRecord as Evidence);
      discard();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save voice memo"
      );
    } finally {
      setIsSaving(false);
    }
  }

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 text-sm font-medium">
        Record what happened while it&apos;s fresh
      </p>

      {state === "idle" && (
        <Button onClick={startRecording} type="button" variant="outline">
          <Mic className="mr-2 h-4 w-4 text-red-500" />
          Start Recording
        </Button>
      )}

      {state === "recording" && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-mono font-medium text-red-600">
              {formatDuration(duration)}
            </span>
          </div>
          <Button
            onClick={stopRecording}
            size="sm"
            type="button"
            variant="destructive"
          >
            <Square className="mr-2 h-3.5 w-3.5" />
            Stop
          </Button>
        </div>
      )}

      {state === "stopped" && audioUrl && (
        <div className="space-y-3">
          <audio className="w-full" controls src={audioUrl} />
          <div className="flex gap-2">
            <Button
              disabled={isSaving}
              onClick={saveMemo}
              size="sm"
              type="button"
            >
              <Upload className="mr-2 h-3.5 w-3.5" />
              {isSaving ? "Saving..." : "Save Memo"}
            </Button>
            <Button
              disabled={isSaving}
              onClick={discard}
              size="sm"
              type="button"
              variant="outline"
            >
              Discard
            </Button>
            <Button
              onClick={startRecording}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Mic className="mr-1.5 h-3.5 w-3.5" />
              Re-record
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

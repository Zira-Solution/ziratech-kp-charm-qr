"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { GiftDraft } from "../draft";
import { Field, Icon, StudioSection, ghostButton, fieldClass } from "../ui";
import { MAX_RECORD_SECONDS, describeMicError, extensionForMime, formatClock, pickRecorderMime } from "../recorder";

interface Props {
  step: number;
  token: string;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

type Phase = "idle" | "recording" | "uploading";

/** A finished recording that is not on the server yet (kept so a failed upload can be retried). */
interface Pending {
  blob: Blob;
  seconds: number;
  mime: string;
}

export default function VoiceBlock({ step, token, draft, onChange }: Props) {
  const { voice } = draft;
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [supported, setSupported] = useState(true);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    const ok = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined" && !!pickRecorderMime((t) => MediaRecorder.isTypeSupported(t));
    setSupported(ok);
  }, []);

  const releaseMic = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Leaving the page mid-recording must switch the microphone off and drop what was recorded.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const r = recorderRef.current;
      if (r && r.state !== "inactive") {
        r.onstop = null;
        r.stop();
      }
      releaseMic();
    };
  }, [releaseMic]);

  const upload = useCallback(
    async (rec: Pending) => {
      setPhase("uploading");
      setError("");
      try {
        const form = new FormData();
        form.set("audio", rec.blob, `voice.${extensionForMime(rec.mime)}`);
        form.set("durationSec", String(rec.seconds));
        const res = await fetch(`/api/gifts/${token}/voice`, { method: "POST", body: form });
        const data = await res.json().catch(() => ({}));
        if (!mountedRef.current) return;
        if (!res.ok || !data?.voice) {
          setError(data?.error || "Không tải được bản ghi âm. Vui lòng thử lại.");
          return;
        }
        setPending(null);
        onChange({
          voice: { ...voice, audioPath: data.voice.audioPath, audioUrl: data.voice.audioUrl, durationSec: data.voice.durationSec },
        });
      } catch {
        if (mountedRef.current) setError("Mất kết nối khi tải bản ghi âm. Kiểm tra mạng rồi bấm thử lại.");
      } finally {
        if (mountedRef.current) setPhase("idle");
      }
    },
    [token, voice, onChange],
  );

  const start = async () => {
    setError("");
    const mime = pickRecorderMime((t) => MediaRecorder.isTypeSupported(t));
    if (!mime) {
      setSupported(false);
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setError(describeMicError(err));
      return;
    }
    if (!mountedRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    streamRef.current = stream;
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    recorderRef.current = recorder;
    const startedAt = Date.now();

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = () => {
      releaseMic();
      setPhase("idle");
      setError("Quá trình ghi âm bị gián đoạn. Vui lòng thử lại.");
    };
    recorder.onstop = () => {
      releaseMic();
      const seconds = Math.min(MAX_RECORD_SECONDS, Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
      const blob = new Blob(chunks, { type: mime });
      if (blob.size === 0) {
        setPhase("idle");
        setError("Không thu được âm thanh nào. Hãy kiểm tra micro rồi thử lại.");
        return;
      }
      const rec = { blob, seconds, mime };
      setPending(rec);
      void upload(rec);
    };

    recorder.start();
    setElapsed(0);
    setPhase("recording");
    timerRef.current = window.setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(secs);
      if (secs >= MAX_RECORD_SECONDS && recorder.state === "recording") recorder.stop();
    }, 250);
  };

  const stop = () => {
    const r = recorderRef.current;
    if (r && r.state === "recording") r.stop();
  };

  // Only clears the draft. The old file is removed from storage when the card is saved.
  const removeRecording = () => {
    setPending(null);
    setError("");
    onChange({ voice: { ...voice, audioPath: "", audioUrl: "", durationSec: 0 } });
  };

  const hasRecording = !!voice.audioPath;
  const busy = phase !== "idle";

  return (
    <StudioSection id="voice" step={step} title="Lời nhắn bằng giọng nói" hint={`Ghi âm trực tiếp bằng micro, tối đa ${MAX_RECORD_SECONDS / 60} phút. Người nhận sẽ nghe được khi mở thiệp.`}>
      {!supported && (
        <p role="status" className="rounded-xl border border-parchment-border bg-white px-3 py-2 text-xs font-sans text-warm-neutral">
          Trình duyệt này chưa hỗ trợ ghi âm (hoặc trang không chạy trên https). Bạn có thể bỏ qua phần này hoặc thử trên Chrome, Safari bản mới.
        </p>
      )}

      {supported && (
        <div className="space-y-3">
          {phase === "recording" && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-300 bg-white px-4 py-3" role="status" aria-live="polite">
              <span aria-hidden="true" className="h-3 w-3 animate-pulse rounded-full bg-rose-600" />
              <span className="font-mono text-lg text-primary tabular-nums">
                {formatClock(elapsed)} <span className="text-xs text-warm-neutral">/ {formatClock(MAX_RECORD_SECONDS)}</span>
              </span>
              <button
                type="button"
                onClick={stop}
                className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-sans font-bold text-amber-200 hover:bg-primary-container cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container"
              >
                <Icon name="stop" className="text-[18px]" />
                Dừng
              </button>
            </div>
          )}

          {phase === "uploading" && (
            <p role="status" aria-live="polite" className="rounded-xl border border-parchment-border bg-white px-3 py-2 text-xs font-sans text-warm-neutral">
              Đang tải bản ghi âm lên…
            </p>
          )}

          {phase === "idle" && hasRecording && (
            <div className="rounded-2xl liquid-glass-card border border-rose-200/70 p-4 overflow-hidden">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-sans font-bold text-primary">Bản ghi âm · {formatClock(voice.durationSec)}</span>
              </div>
              {voice.audioUrl ? (
                <audio controls preload="metadata" src={voice.audioUrl} className="w-full" />
              ) : (
                <p className="text-xs font-sans text-warm-neutral">Đã lưu bản ghi âm (không tạo được liên kết nghe lại lúc này).</p>
              )}
            </div>
          )}

          {phase === "idle" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={start}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl liquid-glass-btn-primary px-4 py-2.5 text-xs font-sans font-bold text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container shadow-xs"
              >
                <Icon name="mic" className="text-[18px]" />
                {hasRecording ? "Ghi âm lại" : "Bắt đầu ghi âm"}
              </button>
              {pending && error && (
                <button type="button" onClick={() => void upload(pending)} className={ghostButton}>
                  Thử tải lại
                </button>
              )}
              {hasRecording && (
                <button type="button" onClick={removeRecording} className={ghostButton}>
                  Bỏ ghi âm
                </button>
              )}
            </div>
          )}

          {hasRecording && phase === "idle" && (
            <p className="text-[11px] font-sans text-warm-neutral">Ghi âm lại sẽ thay bản cũ sau khi bạn lưu thiệp.</p>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-[11px] font-sans font-bold text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-4">
        <Field label="Lời thoại (không bắt buộc)" htmlFor="voice-note" counter={`${voice.noteText.length}/500`} hint="Chép lại lời bạn nói để người nhận đọc cùng khi nghe.">
          <textarea
            id="voice-note"
            rows={3}
            maxLength={500}
            value={voice.noteText}
            onChange={(e) => onChange({ voice: { ...voice, noteText: e.target.value } })}
            className={`${fieldClass} resize-y`}
          />
        </Field>
      </div>
    </StudioSection>
  );
}

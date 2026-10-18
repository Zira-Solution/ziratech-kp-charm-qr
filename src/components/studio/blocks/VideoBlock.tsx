"use client";

import React, { useRef, useState } from "react";
import { MAX_VIDEO_BYTES } from "@/lib/validation/audio";
import type { GiftDraft } from "../draft";
import { Icon, StudioSection } from "../ui";

interface Props {
  step: number;
  token?: string;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

const FRAMES = [
  {
    id: "16:9" as const,
    label: "Khung ngang 16:9",
    desc: "Chuẩn video ngang, màn ảnh rộng",
    previewRatio: "aspect-video w-10",
  },
  {
    id: "1:1" as const,
    label: "Khung vuông 1:1",
    desc: "Chuẩn vuông kỷ niệm, Instagram",
    previewRatio: "aspect-square w-7",
  },
  {
    id: "9:16" as const,
    label: "Khung dọc 9:16",
    desc: "Chuẩn video dọc, Shorts, Reels",
    previewRatio: "aspect-[9/16] w-6",
  },
];

export default function VideoBlock({ step, token, draft, onChange }: Props) {
  const currentAspect = draft.videoAspectRatio || "16:9";
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_BYTES) {
      setUploadError("Tệp thước phim quá lớn (tối đa 25MB). Hãy nén hoặc chọn clip ngắn hơn.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const activeToken = token || "KP-2010-DEMO";
      const formData = new FormData();
      formData.set("type", "video");
      formData.set("file", file);

      const res = await fetch(`/api/gifts/${activeToken}/media`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không tải được video lên.");
      }

      // Auto-detect video dimensions
      const videoEl = document.createElement("video");
      videoEl.preload = "metadata";
      videoEl.src = data.url;

      videoEl.onloadedmetadata = () => {
        let detectedAspect: "16:9" | "1:1" | "9:16" = "16:9";
        if (videoEl.videoHeight > videoEl.videoWidth * 1.1) {
          detectedAspect = "9:16";
        } else if (Math.abs(videoEl.videoWidth - videoEl.videoHeight) < 40) {
          detectedAspect = "1:1";
        }

        onChange({
          videoUrl: data.url,
          videoAspectRatio: detectedAspect,
        });
      };

      videoEl.onerror = () => {
        onChange({ videoUrl: data.url });
      };
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Tải video thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeVideo = () => {
    onChange({ videoUrl: "" });
  };

  return (
    <StudioSection
      id="video"
      step={step}
      title="Thước phim kỷ niệm"
      hint="Tải video kỷ niệm từ thiết bị và chọn khung hình hiển thị phù hợp."
    >
      <div className="space-y-5 rounded-2xl liquid-glass-subtle border border-rose-200/60 p-4 sm:p-5 shadow-inner">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          className="hidden"
          onChange={handleVideoUpload}
        />

        {uploadError && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50/90 px-3.5 py-2.5 text-xs text-rose-800">
            <span className="font-bold">Lỗi: </span> {uploadError}
          </div>
        )}

        {draft.videoUrl ? (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-black/90 border border-stone-800 flex items-center justify-center p-2 shadow-md">
              <video
                ref={videoPreviewRef}
                src={draft.videoUrl}
                controls
                playsInline
                className="max-h-72 w-auto max-w-full rounded-xl object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                Video đã tải lên thành công và sẵn sàng phát trên thiệp
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-pill border border-rose-200 text-xs font-bold text-primary hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  <Icon name="swap_horiz" className="text-[16px]" />
                  Đổi video khác
                </button>
                <button
                  type="button"
                  onClick={removeVideo}
                  disabled={uploading}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                  title="Xóa video này"
                >
                  <Icon name="delete" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed border-rose-300/80 hover:border-primary/60 bg-rose-50/40 p-7 text-center cursor-pointer transition-all hover:bg-rose-50/70 ${
              uploading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center py-3">
                <span className="w-9 h-9 rounded-full border-3 border-primary border-t-transparent animate-spin mb-2.5" />
                <p className="text-sm font-bold text-primary">Đang tải video lên...</p>
                <p className="text-xs text-slate-500 mt-1">Quá trình này có thể mất vài giây tùy dung lượng tệp</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white shadow-sm border border-rose-200 text-primary mb-2.5">
                  <Icon name="video_file" className="text-[30px]" />
                </div>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  Bấm để chọn video kỷ niệm từ thiết bị
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ định dạng MP4, WebM, MOV (tối đa 25MB)
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3 Compatible Video Frames */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Chọn khung hình hiển thị video
            <span className="ml-1 text-[11px] font-normal text-slate-500">
              (Khóa cố định khi người nhận mở thiệp)
            </span>
          </label>
          <div role="radiogroup" aria-label="Khung hình video" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FRAMES.map((f) => {
              const selected = currentAspect === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange({ videoAspectRatio: f.id })}
                  className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all cursor-pointer border ${
                    selected
                      ? "liquid-glass-card border-[#721a28] ring-2 ring-[#721a28]/25 shadow-xs"
                      : "liquid-glass-card border-rose-200/60 hover:border-[#721a28]/40"
                  }`}
                >
                  <div
                    className={`rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${
                      selected ? "border-[#721a28] bg-rose-50 text-[#721a28]" : "border-slate-300 bg-white text-slate-400"
                    } ${f.previewRatio}`}
                  >
                    <Icon name="play_arrow" className="text-[13px]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-sans text-xs font-bold text-slate-900 truncate">{f.label}</span>
                    <span className="mt-0.5 block text-[11px] font-sans text-slate-500 truncate">{f.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StudioSection>
  );
}

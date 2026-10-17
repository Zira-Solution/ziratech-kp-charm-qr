"use client";

import React from "react";
import { VIDEO_HOSTS, parseHttpsLink } from "@/lib/validation/gift";
import type { GiftDraft } from "../draft";
import { Field, StudioSection, fieldClass } from "../ui";

interface Props {
  step: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

const FRAMES = [
  {
    id: "16:9" as const,
    label: "Khung ngang 16:9",
    desc: "Chuẩn YouTube ngang, màn ảnh rộng",
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
    desc: "Chuẩn YouTube Shorts, TikTok, Reels",
    previewRatio: "aspect-[9/16] w-6",
  },
];

export default function VideoBlock({ step, draft, onChange }: Props) {
  const value = draft.videoUrl.trim();
  const check = value ? parseHttpsLink(value, VIDEO_HOSTS, "Liên kết video") : null;
  const currentAspect = draft.videoAspectRatio || "16:9";

  const handleUrlChange = (url: string) => {
    const isVertical = Boolean(
      url &&
        (url.includes("/shorts") ||
          url.includes("tiktok.com") ||
          url.includes("/reel/") ||
          url.includes("/reels/"))
    );
    if (isVertical) {
      onChange({ videoUrl: url, videoAspectRatio: "9:16" });
    } else if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com")) {
      onChange({ videoUrl: url, videoAspectRatio: "16:9" });
    } else {
      onChange({ videoUrl: url });
    }
  };

  return (
    <StudioSection
      id="video"
      step={step}
      title="Thước phim kỷ niệm"
      hint="Dán liên kết video và chọn 1 trong 3 khung hình tương thích để hiển thị cho người nhận."
    >
      <div className="space-y-5 rounded-2xl liquid-glass-subtle border border-rose-200/60 p-4 sm:p-5 shadow-inner">
        <Field
          label="Liên kết video"
          htmlFor="video-url"
          hint="Nhận liên kết từ YouTube, Vimeo hoặc Google Drive (bắt đầu bằng https://)."
          error={check && !check.ok ? check.error : undefined}
        >
          <input
            id="video-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            maxLength={300}
            value={draft.videoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... hoặc Shorts, Drive"
            aria-invalid={check && !check.ok ? true : undefined}
            className={fieldClass}
          />
        </Field>

        {/* 3 Compatible Video Frames */}
        <div>
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
                  className={`flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selected
                      ? "liquid-glass-card border-[#721a28] ring-2 ring-[#721a28]/25 shadow-sm -translate-y-0.5 bg-rose-50/50"
                      : "liquid-glass-card border-slate-200/80 hover:border-[#721a28]/40 hover:bg-white"
                  }`}
                >
                  <div className="h-14 flex items-center justify-center mb-2">
                    <div
                      className={`${f.previewRatio} rounded border-2 ${
                        selected
                          ? "border-[#721a28] bg-[#721a28]/10"
                          : "border-slate-300 bg-slate-100"
                      } flex items-center justify-center transition-colors`}
                    >
                      <span
                        className={`material-symbols-outlined text-[14px] ${
                          selected ? "text-[#721a28]" : "text-slate-400"
                        }`}
                      >
                        play_arrow
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${selected ? "text-[#721a28]" : "text-slate-800"}`}>
                      {f.label}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      {f.desc}
                    </p>
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

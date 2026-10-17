"use client";

import React, { useRef, useState } from "react";
import { compressImageToDataUrl } from "@/lib/image-compress";
import type { PhotoDraft } from "../draft";
import { Icon, StudioSection, fieldClass } from "../ui";

interface Props {
  id: string;
  step: number;
  title: string;
  hint: string;
  items: PhotoDraft[];
  max: number;
  /** Album photos also carry a date label; highlight photos do not. */
  showDate?: boolean;
  onChange: (items: PhotoDraft[]) => void;
}

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

/** A set of photos: add (compressed in the browser), replace, remove, caption. Used for the album. */
export default function PhotosBlock({ id, step, title, hint, items, max, showDate, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<number | null>(null); // index being replaced, null = adding
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const choose = (index: number | null) => {
    targetRef.current = index;
    inputRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    input.value = ""; // allow choosing the same file again
    if (!file) return;
    setError("");

    if (!file.type.startsWith("image/")) return setError("Vui lòng chọn một tệp ảnh.");
    if (file.size > MAX_SOURCE_BYTES) return setError("Ảnh quá lớn (trên 20MB). Vui lòng chọn ảnh nhỏ hơn.");

    const index = targetRef.current;
    setBusy(true);
    try {
      const url = await compressImageToDataUrl(file);
      if (index !== null && index < items.length) {
        onChange(items.map((p, i) => (i === index ? { ...p, url } : p)));
      } else if (items.length < max) {
        onChange([...items, { url, caption: "", date: "" }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xử lý được ảnh này.");
    } finally {
      setBusy(false);
    }
  };

  const patch = (index: number, change: Partial<PhotoDraft>) =>
    onChange(items.map((p, i) => (i === index ? { ...p, ...change } : p)));

  return (
    <StudioSection id={id} step={step} title={title} hint={hint}>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="sr-only" tabIndex={-1} aria-hidden="true" />

      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full liquid-glass-pill px-3 py-1 text-[11px] font-sans font-bold text-primary border border-rose-200/80">
          {items.length}/{max} ảnh
        </span>
        {items.length < max && (
          <button
            type="button"
            onClick={() => choose(null)}
            disabled={busy}
            className="flex items-center gap-1 rounded-xl liquid-glass-btn-primary px-3 py-1.5 text-xs font-sans font-bold text-white shadow-xs cursor-pointer disabled:opacity-60"
          >
            <Icon name="add_photo_alternate" className="text-[16px]" />
            {busy ? "Đang xử lý ảnh..." : "Thêm ảnh"}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-sans font-bold text-rose-700">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => choose(null)}
          disabled={busy}
          className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-[#721a28]/25 liquid-glass-subtle py-8 text-xs font-sans text-warm-neutral hover:border-[#721a28]/50 cursor-pointer disabled:opacity-60 transition-all"
        >
          <Icon name="photo_library" className="text-[28px] text-[#721a28]" />
          <span className="font-bold text-primary">Chưa có ảnh nào</span>
          <span>Bấm để chọn ảnh từ điện thoại hoặc máy tính</span>
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((photo, i) => (
            <li
              key={i}
              className="relative rounded-2xl liquid-glass-card p-2.5 pb-3.5 shadow-sm border border-rose-200/60 hover:shadow-md transition-shadow overflow-hidden"
            >
              {i === 0 && (
                <span className="absolute top-4 left-4 z-10 px-2.5 py-0.5 rounded-full liquid-glass-btn-primary text-white text-[10px] font-bold shadow-xs">
                  Ảnh bìa thiệp
                </span>
              )}
              <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 border border-black/5">
                <img src={photo.url} alt={`Ảnh số ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                  aria-label={`Xóa ảnh số ${i + 1}`}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 hover:bg-rose-600 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Icon name="close" className="text-[16px]" />
                </button>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  disabled={busy}
                  className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs py-1.5 text-[11px] font-bold text-white hover:bg-black/80 transition-colors cursor-pointer disabled:opacity-60"
                >
                  Đổi ảnh
                </button>
              </div>
              <label className="sr-only" htmlFor={`${id}-caption-${i}`}>
                Lời tựa ảnh số {i + 1}
              </label>
              <input
                id={`${id}-caption-${i}`}
                type="text"
                maxLength={200}
                value={photo.caption}
                onChange={(e) => patch(i, { caption: e.target.value })}
                placeholder="Ghi chú kỷ niệm..."
                className={`${fieldClass} mt-2.5 !py-1.5 !text-xs font-handwriting`}
              />
              {showDate && (
                <>
                  <label className="sr-only" htmlFor={`${id}-date-${i}`}>
                    Ngày của ảnh số {i + 1}
                  </label>
                  <input
                    id={`${id}-date-${i}`}
                    type="text"
                    maxLength={50}
                    value={photo.date}
                    onChange={(e) => patch(i, { date: e.target.value })}
                    placeholder="Ngày (ví dụ: Thu 2026)"
                    className={`${fieldClass} mt-1.5 !py-1.5 !text-xs`}
                  />
                </>
              )}
            </li>
          ))}
        </ul>

      )}
    </StudioSection>
  );
}

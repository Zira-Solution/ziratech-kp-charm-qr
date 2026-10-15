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

export default function VideoBlock({ step, draft, onChange }: Props) {
  const value = draft.videoUrl.trim();
  const check = value ? parseHttpsLink(value, VIDEO_HOSTS, "Liên kết video") : null;

  return (
    <StudioSection
      id="video"
      step={step}
      title="Video"
      hint="Dán liên kết video bạn đã đăng (không cần tải tệp lên)."
    >
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
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          aria-invalid={check && !check.ok ? true : undefined}
          className={fieldClass}
        />
      </Field>
    </StudioSection>
  );
}

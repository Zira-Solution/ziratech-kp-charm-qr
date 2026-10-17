"use client";

import React, { useEffect, useState } from "react";
import { musicPlayerSynth } from "@/components/gift-templates/audio-helper";
import { MUSIC_PRESETS } from "@/components/gift-templates/music-presets";
import { MUSIC_HOSTS, parseHttpsLink } from "@/lib/validation/gift";
import type { GiftDraft, SongDraft } from "../draft";
import { Field, Icon, StudioSection, fieldClass } from "../ui";

interface Props {
  step: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

const SOURCES: Array<{ id: SongDraft["source"]; label: string; hint: string }> = [
  { id: "none", label: "Không dùng nhạc", hint: "Thiệp sẽ im lặng." },
  { id: "preset", label: "Giai điệu có sẵn", hint: "Bốn giai điệu nhẹ nhàng, nghe thử được." },
  { id: "link", label: "Dán liên kết bài hát", hint: "YouTube, Spotify hoặc SoundCloud." },
];

export default function MusicBlock({ step, draft, onChange }: Props) {
  const { song } = draft;
  const [previewing, setPreviewing] = useState<string | null>(null);

  // Never leave a preview playing when the buyer leaves this block or the page.
  useEffect(() => () => musicPlayerSynth.stop(), []);

  const setSong = (patch: Partial<SongDraft>) => onChange({ song: { ...song, ...patch } });

  const chooseSource = (source: SongDraft["source"]) => {
    if (source !== "preset") {
      musicPlayerSynth.stop();
      setPreviewing(null);
    }
    setSong({ source, presetId: source === "preset" ? song.presetId || MUSIC_PRESETS[0].id : song.presetId });
  };

  const togglePreview = (id: string) => {
    if (previewing === id) {
      musicPlayerSynth.stop();
      setPreviewing(null);
    } else {
      musicPlayerSynth.play(id);
      setPreviewing(id);
    }
  };

  const link = song.link.trim();
  const linkCheck = link ? parseHttpsLink(link, MUSIC_HOSTS, "Liên kết nhạc") : null;

  return (
    <StudioSection id="music" step={step} title="Nhạc nền" hint="Chọn nhạc phát khi người nhận mở thiệp.">
      <div role="radiogroup" aria-label="Kiểu nhạc nền" className="grid gap-2 sm:grid-cols-3">
        {SOURCES.map((s) => {
          const selected = song.source === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => chooseSource(s.id)}
              className={`rounded-2xl border p-3 text-left cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container ${
                selected ? "liquid-glass bg-white/95 border-amber-400 ring-2 ring-primary-container/20" : "liquid-glass-card border-white/70 hover:bg-white/80"
              }`}
            >
              <span className="block font-sans text-xs font-bold text-primary">{s.label}</span>
              <span className="mt-0.5 block text-[11px] font-sans text-warm-neutral">{s.hint}</span>
            </button>
          );
        })}
      </div>

      {song.source === "preset" && (
        <ul className="mt-4 space-y-2">
          {MUSIC_PRESETS.map((p) => {
            const selected = song.presetId === p.id;
            const playing = previewing === p.id;
            return (
              <li
                key={p.id}
                className={`flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 ${selected ? "border-primary-container ring-1 ring-primary-container" : "border-parchment-border"}`}
              >
                <button
                  type="button"
                  onClick={() => togglePreview(p.id)}
                  aria-label={`${playing ? "Dừng" : "Nghe thử"} ${p.name}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-amber-300 hover:bg-primary-container cursor-pointer"
                >
                  <Icon name={playing ? "pause" : "play_arrow"} className="text-[20px]" />
                </button>
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="music-preset"
                    checked={selected}
                    onChange={() => setSong({ presetId: p.id })}
                    className="h-4 w-4 accent-primary-container"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-sans text-sm font-bold text-primary">{p.name}</span>
                    <span className="block truncate text-[11px] font-sans text-warm-neutral">{p.mood}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {song.source === "link" && (
        <div className="mt-4 space-y-4">
          <Field
            label="Liên kết bài hát"
            htmlFor="music-link"
            required
            hint="Dán liên kết từ YouTube, Spotify hoặc SoundCloud (bắt đầu bằng https://)."
            error={linkCheck && !linkCheck.ok ? linkCheck.error : undefined}
          >
            <input
              id="music-link"
              type="url"
              inputMode="url"
              autoComplete="off"
              maxLength={300}
              value={song.link}
              onChange={(e) => setSong({ link: e.target.value })}
              placeholder="https://open.spotify.com/track/..."
              aria-invalid={linkCheck && !linkCheck.ok ? true : undefined}
              className={fieldClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tên bài hát" htmlFor="music-title" hint="Không bắt buộc">
              <input id="music-title" type="text" maxLength={100} value={song.title} onChange={(e) => setSong({ title: e.target.value })} className={fieldClass} />
            </Field>
            <Field label="Ca sĩ" htmlFor="music-artist" hint="Không bắt buộc">
              <input id="music-artist" type="text" maxLength={100} value={song.artist} onChange={(e) => setSong({ artist: e.target.value })} className={fieldClass} />
            </Field>
          </div>
        </div>
      )}
    </StudioSection>
  );
}

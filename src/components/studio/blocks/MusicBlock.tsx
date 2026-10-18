"use client";

import React, { useEffect, useRef, useState } from "react";
import { musicPlayerSynth } from "@/components/gift-templates/audio-helper";
import { MUSIC_PRESETS } from "@/components/gift-templates/music-presets";
import { MAX_SONG_BYTES } from "@/lib/validation/audio";
import type { GiftDraft, SongDraft } from "../draft";
import { Field, Icon, StudioSection, fieldClass } from "../ui";
import AudioTrimmerModal from "./AudioTrimmerModal";

interface Props {
  step: number;
  token?: string;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

const SOURCES: Array<{ id: SongDraft["source"]; label: string; hint: string }> = [
  { id: "none", label: "Không dùng nhạc", hint: "Thiệp sẽ im lặng." },
  { id: "preset", label: "Giai điệu có sẵn", hint: "Bốn giai điệu nhẹ nhàng, nghe thử được." },
  { id: "upload", label: "Tải file MP3 / M4A", hint: "Tải bài hát từ máy (tối đa 10MB)." },
];

export default function MusicBlock({ step, token, draft, onChange }: Props) {
  const { song } = draft;
  const [previewingPreset, setPreviewingPreset] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPlayingUpload, setIsPlayingUpload] = useState(false);
  const [fileToTrim, setFileToTrim] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop synthesizer on unmount
  useEffect(() => () => musicPlayerSynth.stop(), []);

  // Stop audio preview when switching sources
  const stopAllAudio = () => {
    musicPlayerSynth.stop();
    setPreviewingPreset(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingUpload(false);
    }
  };

  const setSong = (patch: Partial<SongDraft>) => onChange({ song: { ...song, ...patch } });

  const chooseSource = (source: SongDraft["source"]) => {
    stopAllAudio();
    setUploadError(null);
    setSong({
      source,
      presetId: source === "preset" ? song.presetId || MUSIC_PRESETS[0].id : song.presetId,
    });
  };

  const togglePresetPreview = (id: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingUpload(false);
    }

    if (previewingPreset === id) {
      musicPlayerSynth.stop();
      setPreviewingPreset(null);
    } else {
      musicPlayerSynth.play(id);
      setPreviewingPreset(id);
    }
  };

  const toggleUploadPlayback = () => {
    if (previewingPreset) {
      musicPlayerSynth.stop();
      setPreviewingPreset(null);
    }

    if (!audioRef.current) return;
    if (isPlayingUpload) {
      audioRef.current.pause();
      setIsPlayingUpload(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingUpload(true))
        .catch(() => setIsPlayingUpload(false));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SONG_BYTES) {
      setUploadError("Tệp bài hát quá lớn (tối đa 10MB). Hãy nén hoặc chọn bài hát nhỏ hơn.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadError(null);
    stopAllAudio();
    setFileToTrim(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTrimmerUploaded = (info: {
    path: string;
    url: string;
    fileName: string;
    title: string;
  }) => {
    setFileToTrim(null);
    setSong({
      source: "upload",
      audioPath: info.path,
      audioUrl: info.url,
      fileName: info.fileName,
      title: song.title.trim() || info.title,
    });
  };

  const removeUploadedSong = () => {
    stopAllAudio();
    setSong({ audioPath: undefined, audioUrl: undefined, fileName: undefined });
  };

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
              className={`rounded-2xl p-3 text-left cursor-pointer transition-all overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container ${
                selected
                  ? "liquid-glass-card border-[#721a28] ring-2 ring-[#721a28]/25 shadow-xs"
                  : "liquid-glass-card border-rose-200/60 hover:border-[#721a28]/40"
              }`}
            >
              <span className="block font-sans text-xs font-bold text-primary">{s.label}</span>
              <span className="mt-0.5 block text-[11px] font-sans text-warm-neutral">{s.hint}</span>
            </button>
          );
        })}
      </div>

      {/* Preset Melodies */}
      {song.source === "preset" && (
        <ul className="mt-4 space-y-2">
          {MUSIC_PRESETS.map((p) => {
            const selected = song.presetId === p.id;
            const playing = previewingPreset === p.id;
            return (
              <li
                key={p.id}
                className={`flex items-center gap-3 rounded-2xl liquid-glass-card px-3.5 py-2.5 overflow-hidden transition-all ${
                  selected
                    ? "border-[#721a28] ring-2 ring-[#721a28]/20 shadow-xs"
                    : "border-rose-200/60 hover:border-[#721a28]/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => togglePresetPreview(p.id)}
                  aria-label={`${playing ? "Dừng" : "Nghe thử"} ${p.name}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full liquid-glass-btn-primary text-white hover:scale-105 transition-transform cursor-pointer shadow-xs"
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

      {/* Upload MP3/M4A */}
      {song.source === "upload" && (
        <div className="mt-4 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/webm,audio/ogg,.mp3,.m4a,.wav"
            className="hidden"
            onChange={handleFileUpload}
          />

          {uploadError && (
            <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50/90 px-3.5 py-2.5 text-xs text-rose-800">
              <span className="font-bold">Lỗi: </span> {uploadError}
            </div>
          )}

          {song.audioUrl || song.audioPath ? (
            <div className="rounded-2xl liquid-glass-subtle border border-rose-200/80 p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={toggleUploadPlayback}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl liquid-glass-btn-primary text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label={isPlayingUpload ? "Dừng nghe thử" : "Nghe thử bài hát"}
                  >
                    <Icon name={isPlayingUpload ? "pause" : "play_arrow"} className="text-[24px]" />
                  </button>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-[#721a28] truncate">
                      {song.fileName || "Tệp bài hát đã tải lên"}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      Đã sẵn sàng phát trên thiệp
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-pill border border-rose-200 text-xs font-bold text-primary hover:bg-rose-50 cursor-pointer transition-colors"
                  >
                    <Icon name="content_cut" className="text-[16px]" />
                    Đổi / Cắt bài khác
                  </button>
                  <button
                    type="button"
                    onClick={removeUploadedSong}
                    disabled={uploading}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Xóa bài hát này"
                  >
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              </div>

              {/* Hidden audio element for preview */}
              {song.audioUrl && (
                <audio
                  ref={audioRef}
                  src={song.audioUrl}
                  onEnded={() => setIsPlayingUpload(false)}
                  className="hidden"
                />
              )}
            </div>
          ) : (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed border-rose-300/80 hover:border-primary/60 bg-rose-50/40 p-6 text-center cursor-pointer transition-all hover:bg-rose-50/70 ${
                uploading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <span className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin mb-2" />
                  <p className="text-xs font-bold text-primary">Đang tải bài hát lên...</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Vui lòng chờ trong giây lát</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-rose-200 text-primary mb-2">
                    <Icon name="content_cut" className="text-[26px]" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Bấm để chọn file bài hát MP3 / M4A từ máy
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cắt trực tiếp đoạn nhạc yêu thích trước khi tải lên (tối đa 10MB)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <Field label="Tên bài hát" htmlFor="music-title" hint="Không bắt buộc">
              <input
                id="music-title"
                type="text"
                maxLength={100}
                value={song.title}
                onChange={(e) => setSong({ title: e.target.value })}
                placeholder="VD: Giai điệu mùa thu"
                className={fieldClass}
              />
            </Field>
            <Field label="Ca sĩ" htmlFor="music-artist" hint="Không bắt buộc">
              <input
                id="music-artist"
                type="text"
                maxLength={100}
                value={song.artist}
                onChange={(e) => setSong({ artist: e.target.value })}
                placeholder="VD: Nhạc hòa tấu"
                className={fieldClass}
              />
            </Field>
          </div>
        </div>
      )}

      {fileToTrim && (
        <AudioTrimmerModal
          file={fileToTrim}
          token={token}
          onClose={() => setFileToTrim(null)}
          onUploaded={handleTrimmerUploaded}
        />
      )}
    </StudioSection>
  );
}

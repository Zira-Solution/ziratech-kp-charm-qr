"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { sliceMp3, encodeWav, slicePcmChannels } from "@/lib/media/audio-trim";
import { Icon } from "../ui";

interface AudioTrimmerModalProps {
  file: File;
  token?: string;
  onClose: () => void;
  onUploaded: (info: {
    path: string;
    url: string;
    fileName: string;
    title: string;
  }) => void;
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
}

export default function AudioTrimmerModal({
  file,
  token,
  onClose,
  onUploaded,
}: AudioTrimmerModalProps) {
  const [loadingDecode, setLoadingDecode] = useState(true);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>("");
  const [, startTransition] = useTransition();

  // Audio metadata & data
  const [duration, setDuration] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const rawFileBytesRef = useRef<Uint8Array | null>(null);

  // Trimming bounds
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  // Audition playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Decode audio on mount
  useEffect(() => {
    let cancelled = false;

    async function loadAudio() {
      // Setup preview audio element immediately so playback and duration are available even before full decode
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      const audio = new Audio(url);
      audioPreviewRef.current = audio;

      audio.onloadedmetadata = () => {
        if (!cancelled && audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          setDuration((prev) => (prev > 0 ? prev : audio.duration));
          setEndTime((prev) => (prev > 0 ? prev : Math.min(audio.duration, 45)));
        }
      };

      try {
        setLoadingDecode(true);
        setDecodeError(null);

        const arrayBuf = await file.arrayBuffer();
        if (cancelled) return;

        rawFileBytesRef.current = new Uint8Array(arrayBuf);

        // Native Web Audio decode for accurate waveform visualizer
        try {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioCtx();
          const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
          if (!cancelled) {
            audioBufferRef.current = decoded;
            const dur = decoded.duration;
            setDuration(dur);

            // Generate ~48 waveform bars
            const rawPcm = decoded.getChannelData(0);
            const barCount = 48;
            const step = Math.max(1, Math.floor(rawPcm.length / barCount));
            const bars: number[] = [];
            for (let i = 0; i < barCount; i++) {
              let sum = 0;
              const startSample = i * step;
              const endSample = Math.min(rawPcm.length, startSample + step);
              for (let j = startSample; j < endSample; j++) {
                sum += Math.abs(rawPcm[j]);
              }
              bars.push(sum / Math.max(1, endSample - startSample));
            }
            const maxVal = Math.max(...bars, 0.01);
            const normalized = bars.map((b) => Math.max(0.18, b / maxVal));
            setWaveformBars(normalized);

            const initialEnd = dur > 45 ? 45 : dur;
            setStartTime(0);
            setEndTime(initialEnd);
          }
        } catch {
          // If Web Audio decode fails, don't crash: use pleasant fallback bars and rely on native audio element
          if (!cancelled) {
            const fallbackBars = Array.from({ length: 48 }, (_, i) => 0.2 + 0.5 * Math.abs(Math.sin((i * 3.14) / 8)));
            setWaveformBars(fallbackBars);
            if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
              setDuration(audio.duration);
              setEndTime(Math.min(audio.duration, 45));
            }
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setDecodeError(
            err instanceof Error
              ? `Không thể đọc tệp: ${err.message}`
              : "Không thể đọc tệp âm thanh này."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDecode(false);
        }
      }
    }

    loadAudio();

    return () => {
      cancelled = true;
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [file]);

  // Audio preview playback controller
  useEffect(() => {
    const audio = audioPreviewRef.current;
    if (!audio) return;

    let timer: NodeJS.Timeout | null = null;

    if (isPlaying) {
      audio.currentTime = playbackTime < startTime || playbackTime >= endTime ? startTime : playbackTime;
      audio
        .play()
        .then(() => {
          timer = setInterval(() => {
            if (audio.currentTime >= endTime) {
              audio.pause();
              audio.currentTime = startTime;
              setPlaybackTime(startTime);
              setIsPlaying(false);
            } else {
              setPlaybackTime(audio.currentTime);
            }
          }, 100);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    } else {
      audio.pause();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, startTime, endTime, playbackTime]);

  const togglePreview = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setPlaybackTime(startTime);
      setIsPlaying(true);
    }
  };

  const handleStartChange = (val: number) => {
    const clamped = Math.max(0, Math.min(val, endTime - 1));
    setStartTime(clamped);
    if (playbackTime < clamped || playbackTime > endTime) {
      setPlaybackTime(clamped);
    }
  };

  const handleEndChange = (val: number) => {
    const clamped = Math.min(duration, Math.max(val, startTime + 1));
    setEndTime(clamped);
    if (playbackTime > clamped) {
      setPlaybackTime(startTime);
    }
  };

  const selectPreset = (seconds: number) => {
    if (seconds >= duration) {
      setStartTime(0);
      setEndTime(duration);
    } else {
      setStartTime(0);
      setEndTime(seconds);
    }
    setPlaybackTime(0);
    if (isPlaying) setIsPlaying(false);
  };

  // Upload either trimmed or original
  const executeUpload = async (uploadFile: File, title: string) => {
    const activeToken = token || "KP-2010-DEMO";
    const formData = new FormData();
    formData.set("type", "song");
    formData.set("file", uploadFile);

    const res = await fetch(`/api/gifts/${activeToken}/media`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Lỗi tải lên máy chủ (${res.status}). Vui lòng kiểm tra lại.`);
    }

    onUploaded({
      path: data.path,
      url: data.url,
      fileName: uploadFile.name,
      title,
    });
  };

  // Trim and upload handler
  const handleTrimAndUpload = async () => {
    if (processing) return;
    setProcessing(true);
    setProcessStatus("Đang cắt đoạn nhạc đã chọn...");
    if (isPlaying) setIsPlaying(false);

    try {
      const isMp3 =
        file.name.toLowerCase().endsWith(".mp3") ||
        file.type.includes("mpeg") ||
        file.type.includes("mp3");

      let finalFile: File | null = null;
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const cutSuffix = `_cut_${Math.round(startTime)}s_${Math.round(endTime)}s`;

      const safeDuration = duration > 0 ? duration : 45;
      const safeEnd = endTime > startTime ? endTime : safeDuration;

      // 1. Try lossless MP3 frame slicing if MP3
      if (isMp3 && rawFileBytesRef.current) {
        try {
          const slicedMp3Bytes = sliceMp3(rawFileBytesRef.current, startTime, safeEnd);
          if (slicedMp3Bytes && slicedMp3Bytes.length > 0) {
            const mp3Buffer = slicedMp3Bytes.buffer.slice(
              slicedMp3Bytes.byteOffset,
              slicedMp3Bytes.byteOffset + slicedMp3Bytes.byteLength
            ) as ArrayBuffer;
            finalFile = new File([mp3Buffer], `${baseName}${cutSuffix}.mp3`, {
              type: "audio/mpeg",
            });
          }
        } catch {
          // Fall back to PCM WAV encoding
        }
      }

      // 2. Fall back to PCM slicing & WAV encoding
      if (!finalFile && audioBufferRef.current) {
        try {
          const decoded = audioBufferRef.current;
          const channelList: Float32Array[] = [];
          for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
            channelList.push(decoded.getChannelData(ch));
          }
          const slicedChannels = slicePcmChannels(channelList, decoded.sampleRate, startTime, safeEnd);
          const wavBytes = encodeWav(slicedChannels, decoded.sampleRate);
          const wavBuffer = wavBytes.buffer.slice(
            wavBytes.byteOffset,
            wavBytes.byteOffset + wavBytes.byteLength
          ) as ArrayBuffer;
          finalFile = new File([wavBuffer], `${baseName}${cutSuffix}.wav`, {
            type: "audio/wav",
          });
        } catch {
          // Fall back to original file
        }
      }

      // 3. Fall back to original file if slicing cannot be performed
      if (!finalFile) {
        finalFile = file;
      }

      setProcessStatus("Đang tải đoạn nhạc lên máy chủ...");
      const defaultTitle = baseName.replace(/[_-]/g, " ");
      await executeUpload(finalFile, defaultTitle);
    } catch (err: unknown) {
      setDecodeError(err instanceof Error ? err.message : "Cắt hoặc tải lên thất bại.");
      setProcessing(false);
    }
  };

  // Upload original without trimming
  const handleUploadOriginal = async () => {
    if (processing) return;
    setProcessing(true);
    setProcessStatus("Đang tải toàn bộ bài hát gốc lên...");
    if (isPlaying) setIsPlaying(false);

    try {
      const defaultTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      await executeUpload(file, defaultTitle);
    } catch (err: unknown) {
      setDecodeError(err instanceof Error ? err.message : "Tải bài hát gốc thất bại.");
      setProcessing(false);
    }
  };

  const selectedLength = Math.max(0, endTime - startTime);
  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;
  const playheadPercent = duration > 0 ? (playbackTime / duration) * 100 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trimmer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white/95 border border-rose-200/80 shadow-2xl overflow-hidden p-5 sm:p-6 text-slate-800 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-rose-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-[#721a28] border border-rose-200 shadow-xs">
              <Icon name="content_cut" className="text-[22px]" />
            </div>
            <div>
              <h3 id="trimmer-title" className="font-serif text-base sm:text-lg font-bold text-[#721a28]">
                Cắt giai điệu bài hát
              </h3>
              <p className="text-[11px] sm:text-xs text-warm-neutral">
                Chọn đoạn nhạc hay nhất để phát khi người nhận mở thiệp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng bảng cắt nhạc"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* File information pill */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-rose-50/60 border border-rose-200/60 px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="music_note" className="text-primary text-[18px] shrink-0" />
            <span className="truncate font-semibold text-slate-700">{file.name}</span>
          </div>
          <span className="shrink-0 font-mono text-[11px] text-warm-neutral ml-2">
            {duration > 0 ? formatTime(duration) : "..."}
          </span>
        </div>

        {/* Error message */}
        {decodeError && (
          <div className="mt-3 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs text-rose-800">
            <span className="font-bold">Lỗi: </span> {decodeError}
          </div>
        )}

        {/* Loading state while decoding audio */}
        {loadingDecode && duration === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <span className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
            <div>
              <p className="text-xs font-bold text-primary">Đang nạp file âm thanh...</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Sẵn sàng thanh trượt cắt nhạc trong giây lát</p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => startTransition(handleUploadOriginal)}
                disabled={processing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl liquid-glass-btn-primary text-white text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Icon name="upload" className="text-[16px]" />
                Tải lên ngay bài gốc (không cần cắt)
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Visual Waveform and timeline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 px-0.5">
                <span>00:00</span>
                <span className="font-semibold text-[#721a28]">
                  Đoạn cắt: {formatTime(selectedLength)} ({Math.round(selectedLength)}s)
                </span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Waveform track */}
              <div className="relative h-20 w-full rounded-2xl bg-gradient-to-b from-rose-50/80 to-rose-100/40 border border-rose-200 p-2 flex items-center justify-between gap-[2px] overflow-hidden select-none">
                {/* Highlight active range */}
                <div
                  className="absolute top-0 bottom-0 bg-[#721a28]/10 border-x-2 border-[#721a28] pointer-events-none transition-all duration-75"
                  style={{
                    left: `${startPercent}%`,
                    width: `${Math.max(1, endPercent - startPercent)}%`,
                  }}
                />

                {/* Playhead marker */}
                {isPlaying && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.8)] z-10 pointer-events-none transition-all duration-100"
                    style={{ left: `${playheadPercent}%` }}
                  />
                )}

                {/* Waveform bars */}
                {waveformBars.map((bar, idx) => {
                  const barPercent = (idx / waveformBars.length) * 100;
                  const isInRange = barPercent >= startPercent && barPercent <= endPercent;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex items-center justify-center h-full pointer-events-none"
                    >
                      <div
                        className={`w-full max-w-[4px] rounded-full transition-all duration-150 ${
                          isInRange
                            ? "bg-gradient-to-t from-[#721a28] to-rose-400 opacity-90 shadow-2xs"
                            : "bg-slate-300/80 opacity-40"
                        }`}
                        style={{ height: `${Math.round(bar * 100)}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Interactive dual range slider controls */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Bắt đầu (Giây {Math.round(startTime)}s)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, duration - 1)}
                      step={0.5}
                      value={startTime}
                      onChange={(e) => handleStartChange(parseFloat(e.target.value))}
                      className="w-full accent-[#721a28] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Kết thúc (Giây {Math.round(endTime)}s)
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={duration}
                      step={0.5}
                      value={endTime}
                      onChange={(e) => handleEndChange(parseFloat(e.target.value))}
                      className="w-full accent-[#721a28] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Fine tuning time buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600">Từ:</span>
                    <button
                      type="button"
                      onClick={() => handleStartChange(startTime - 1)}
                      className="px-2 py-0.5 rounded-md border border-rose-200 bg-white hover:bg-rose-50 text-slate-700 font-mono text-[11px] cursor-pointer"
                    >
                      -1s
                    </button>
                    <span className="font-mono font-bold text-[#721a28] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      {formatTime(startTime)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartChange(startTime + 1)}
                      className="px-2 py-0.5 rounded-md border border-rose-200 bg-white hover:bg-rose-50 text-slate-700 font-mono text-[11px] cursor-pointer"
                    >
                      +1s
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600">Đến:</span>
                    <button
                      type="button"
                      onClick={() => handleEndChange(endTime - 1)}
                      className="px-2 py-0.5 rounded-md border border-rose-200 bg-white hover:bg-rose-50 text-slate-700 font-mono text-[11px] cursor-pointer"
                    >
                      -1s
                    </button>
                    <span className="font-mono font-bold text-[#721a28] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      {formatTime(endTime)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEndChange(endTime + 1)}
                      className="px-2 py-0.5 rounded-md border border-rose-200 bg-white hover:bg-rose-50 text-slate-700 font-mono text-[11px] cursor-pointer"
                    >
                      +1s
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500">Gợi ý nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectPreset(30)}
                    className="px-2 py-0.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-[11px] font-semibold text-primary cursor-pointer transition-colors"
                  >
                    30s đầu
                  </button>
                  <button
                    type="button"
                    onClick={() => selectPreset(45)}
                    className="px-2 py-0.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-[11px] font-semibold text-primary cursor-pointer transition-colors"
                  >
                    45s đầu
                  </button>
                  <button
                    type="button"
                    onClick={() => selectPreset(60)}
                    className="px-2 py-0.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-[11px] font-semibold text-primary cursor-pointer transition-colors"
                  >
                    60s đầu
                  </button>
                  <button
                    type="button"
                    onClick={() => selectPreset(duration)}
                    className="px-2 py-0.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-[11px] font-semibold text-primary cursor-pointer transition-colors"
                  >
                    Toàn bài
                  </button>
                </div>
              </div>
            </div>

            {/* Audition Player Control */}
            <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={togglePreview}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl liquid-glass-btn-primary text-white shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label={isPlaying ? "Dừng nghe thử" : "Nghe thử đoạn đã cắt"}
                >
                  <Icon name={isPlaying ? "pause" : "play_arrow"} className="text-[22px]" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">
                    {isPlaying ? "Đang nghe thử đoạn đã chọn" : "Nghe thử đoạn nhạc đã chọn"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {formatTime(playbackTime)} / {formatTime(endTime)}
                  </p>
                </div>
              </div>

              {isPlaying && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#721a28] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#721a28]" />
                  Đang phát
                </span>
              )}
            </div>

            {/* Processing indicator */}
            {processing && (
              <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                <span className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0" />
                <span className="font-semibold">{processStatus}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 border-t border-rose-100">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => startTransition(handleUploadOriginal)}
                  disabled={processing}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-xs font-bold text-primary transition-colors cursor-pointer text-center"
                >
                  Tải cả bài gốc
                </button>

                <button
                  type="button"
                  onClick={() => startTransition(handleTrimAndUpload)}
                  disabled={processing || selectedLength <= 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl liquid-glass-btn-primary text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Icon name="content_cut" className="text-[16px]" />
                  Cắt và tải lên ({Math.round(selectedLength)}s)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

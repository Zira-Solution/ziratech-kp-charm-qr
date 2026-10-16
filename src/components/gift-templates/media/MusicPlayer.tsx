"use client";

import React from "react";
import { toMusicEmbed } from "../../../lib/media/embed";
import type { ViewerGift } from "../normalize";
import { useMusicPlayer } from "./useMusicPlayer";

interface Props {
  song: NonNullable<ViewerGift["song"]>;
  title?: string;
  className?: string;
}

const httpsLink = (link: string | undefined) => {
  if (!link) return undefined;
  try {
    return new URL(link).protocol === "https:" ? link : undefined;
  } catch {
    return undefined;
  }
};

/** A built-in melody: one button, started by the visitor. */
function PresetPlayer({ presetId, name, className }: { presetId: string; name: string; className: string }) {
  const { playing, toggle } = useMusicPlayer(presetId);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? `Tạm dừng nhạc ${name}` : `Phát nhạc ${name}`}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container"
      >
        <span aria-hidden="true" className="material-symbols-outlined leading-none text-[26px]">
          {playing ? "pause" : "play_arrow"}
        </span>
      </button>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{name}</p>
        <p className="text-xs opacity-75">{playing ? "Đang phát" : "Bấm để nghe"}</p>
      </div>
    </div>
  );
}

/**
 * The buyer's music: a built-in melody with a play button, or a YouTube / Spotify / SoundCloud player in
 * a sandboxed frame that the visitor starts themselves (browsers block other sites' sound from starting
 * on its own). The link to the original page is always offered.
 */
export default function MusicPlayer({ song, title, className = "" }: Props) {
  const name = title || song.title || "Nhạc kỷ niệm";

  if (song.source === "preset" && song.presetId) {
    return <PresetPlayer presetId={song.presetId} name={name} className={className} />;
  }

  const embed = toMusicEmbed(song.link);
  const href = httpsLink(song.link);
  return (
    <div className={className}>
      {embed && (
        <iframe
          src={embed.src}
          title={`Nhạc: ${name}`}
          loading="lazy"
          height={embed.height}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
          className="w-full rounded-xl border-0"
        />
      )}
      {href && (
        <p className="mt-2 text-center text-xs opacity-80">
          {embed ? "Không nghe được? " : "Không nhúng được bài này. "}
          <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2">
            Mở bài hát ở trang gốc
          </a>
        </p>
      )}
    </div>
  );
}

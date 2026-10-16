"use client";

import React from "react";
import type { ViewerGift } from "./normalize";
import type { GiftTemplate, SlideDef } from "./template-contract";
import type { GiftTemplateId, RecipientGiftData } from "./types";
import RetroNostalgiaTemplate from "./RetroNostalgiaTemplate";
import StorybookSunsetTemplate from "./StorybookSunsetTemplate";
import VintageScrapbookTemplate from "./VintageScrapbookTemplate";

/**
 * The three original templates (seven fixed pages each) wrapped so the shared viewer can show them
 * while they are moved, one by one, to draw the buyer's own messages. They still fill what the buyer
 * left out with sample content; that goes away as each one is migrated.
 */
const LEGACY_SLIDES: SlideDef[] = [
  { id: "legacy-1", label: "Mở quà", icon: "featured_seasonal_and_gifts" },
  { id: "legacy-2", label: "Thư tay", icon: "mail" },
  { id: "legacy-3", label: "Ảnh", icon: "photo_library" },
  { id: "legacy-4", label: "Video", icon: "movie" },
  { id: "legacy-5", label: "Nhạc", icon: "graphic_eq" },
  { id: "legacy-6", label: "Ghi âm", icon: "mic" },
  { id: "legacy-7", label: "Lời cảm ơn", icon: "favorite" },
];

/** The old shape, with only the fields the card really has (a missing field must not wipe a default). */
export function toLegacyData(gift: ViewerGift): Partial<RecipientGiftData> {
  const data: Partial<RecipientGiftData> = {
    recipientName: gift.recipientName,
    senderName: gift.sender,
    anonymous: gift.anonymous,
  };
  if (gift.addressing) data.addressing = gift.addressing;
  if (gift.letter) {
    data.letterTitle = gift.letter.title;
    data.letterSubtitle = gift.letter.subtitle;
    data.letterContent = gift.letter.content;
    data.letterSignature = gift.letter.signature;
  }
  if (gift.photos.length) {
    data.memoryPhotos = gift.photos;
    data.momentPhotos = gift.photos.slice(0, 2).map((p) => ({ url: p.url, caption: p.caption }));
  }
  if (gift.finalMessage) data.finalMessage = gift.finalMessage;
  if (gift.video) data.videoUrl = gift.video;
  if (gift.anniversary) data.anniversary = gift.anniversary;
  if (gift.timeline.length) data.timeline = gift.timeline;
  if (gift.song) {
    data.song = { title: gift.song.title, artist: gift.song.artist, duration: "--:--", source: gift.song.source, presetId: gift.song.presetId, link: gift.song.link };
  }
  if (gift.voice) {
    data.voiceNote = { audioUrl: gift.voice.audioUrl, audioPath: gift.voice.audioPath, duration: gift.voice.duration, noteText: gift.voice.noteText };
  }
  return data;
}

// The originals declare slightly different prop types (two of them want a complete `data`, but fill the gaps
// themselves), so they are accepted loosely here until each is rewritten.
type LegacyComponent = React.ComponentType<any>;

function wrap(id: GiftTemplateId, Component: LegacyComponent): GiftTemplate {
  return {
    id,
    slides: () => LEGACY_SLIDES,
    render: (_slide, gift, ctx) => (
      <div className="h-full overflow-y-auto px-2 py-14">
      <div className="relative mx-auto min-h-190 w-full max-w-97.5 overflow-hidden rounded-4xl border-4 border-white/80 shadow-[0_20px_50px_rgba(70,40,30,0.18)]">
        <Component
          data={toLegacyData(gift)}
          activeSlide={ctx.index + 1}
          viewMode="story"
          onGoToSlide={(slide: number) => ctx.go(slide - 1)}
          onNextSlide={ctx.next}
          onPrevSlide={ctx.prev}
          onSaveKeepsake={() => undefined} // the old "save offline" button promised something that does not exist
        />
      </div>
      </div>
    ),
  };
}

export const LEGACY_TEMPLATES: Record<GiftTemplateId, GiftTemplate> = {
  "storybook-sunset": wrap("storybook-sunset", StorybookSunsetTemplate),
  "vintage-scrapbook": wrap("vintage-scrapbook", VintageScrapbookTemplate),
  "retro-nostalgia": wrap("retro-nostalgia", RetroNostalgiaTemplate),
};

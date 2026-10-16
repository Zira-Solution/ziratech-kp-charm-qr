"use client";

import React from "react";
import type { GiftTemplate, SlideDef } from "../template-contract";
import { defaultSlides } from "../template-contract";
import { ClosingSlide, LetterSlide, OpenSlide } from "./basic";
import { AnniversarySlide, MusicSlide, PhotosSlide, TimelineSlide, VideoSlide, VoiceSlide } from "./media";
import type { Skin } from "./skin";
import type { ViewerGift } from "../normalize";
import type { TemplateContext } from "../template-contract";

function renderSlide(skin: Skin, slide: SlideDef, gift: ViewerGift, ctx: TemplateContext): React.ReactNode {
  const props = { skin, gift, ctx };
  switch (slide.id) {
    case "open":
      return <OpenSlide {...props} />;
    case "letter":
      return <LetterSlide {...props} />;
    case "photos":
      return <PhotosSlide {...props} />;
    case "video":
      return <VideoSlide {...props} />;
    case "music":
      return <MusicSlide {...props} />;
    case "voice":
      return <VoiceSlide {...props} />;
    case "anniversary":
      return <AnniversarySlide {...props} />;
    case "timeline":
      return <TimelineSlide {...props} />;
    case "closing":
      return <ClosingSlide {...props} />;
    default:
      return null;
  }
}

/** A template is a skin on the shared pages. */
export function makeTemplate(skin: Skin): GiftTemplate {
  return {
    id: skin.id,
    slides: defaultSlides,
    render: (slide, gift, ctx) => (
      // Keyed by page so each page starts fresh (for example the album goes back to its first photo).
      <React.Fragment key={slide.id}>{renderSlide(skin, slide, gift, ctx)}</React.Fragment>
    ),
  };
}

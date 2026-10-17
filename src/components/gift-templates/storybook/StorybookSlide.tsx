"use client";

import React from "react";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import OpenSlide from "./slides/OpenSlide";
import LetterSlide from "./slides/LetterSlide";
import PhotosSlide from "./slides/PhotosSlide";
import VideoSlide from "./slides/VideoSlide";
import MusicSlide from "./slides/MusicSlide";
import VoiceSlide from "./slides/VoiceSlide";
import AnniversarySlide from "./slides/AnniversarySlide";
import TimelineSlide from "./slides/TimelineSlide";
import ClosingSlide from "./slides/ClosingSlide";

interface Props {
  slide: SlideDef;
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

export default function StorybookSlide({ slide, gift, ctx, slides }: Props) {
  switch (slide.id) {
    case "open":
      return <OpenSlide gift={gift} ctx={ctx} slides={slides} />;
    case "letter":
      return <LetterSlide gift={gift} ctx={ctx} slides={slides} />;
    case "photos":
      return <PhotosSlide gift={gift} ctx={ctx} slides={slides} />;
    case "video":
      return <VideoSlide gift={gift} ctx={ctx} slides={slides} />;
    case "music":
      return <MusicSlide gift={gift} ctx={ctx} slides={slides} />;
    case "voice":
      return <VoiceSlide gift={gift} ctx={ctx} slides={slides} />;
    case "anniversary":
      return <AnniversarySlide gift={gift} ctx={ctx} slides={slides} />;
    case "timeline":
      return <TimelineSlide gift={gift} ctx={ctx} slides={slides} />;
    case "closing":
      return <ClosingSlide gift={gift} ctx={ctx} slides={slides} />;
    default:
      return null;
  }
}

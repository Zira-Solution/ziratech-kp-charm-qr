import type { ReactNode } from "react";
import type { ViewerGift } from "../normalize";
import type { GiftTemplateId } from "../types";

/** The kinds of page a card is made of. `finalMessage` has no page of its own: it is shown on the closing page. */
export type SlideKind = "open" | "letter" | "photos" | "video" | "music" | "voice" | "anniversary" | "timeline" | "closing";

export interface PageTitle {
  title: string;
  sub?: string;
}

/**
 * What makes one template different from another. The pages themselves (what goes where, how they
 * scroll, how they fill a portrait or landscape frame) are written once and shared; a skin only says
 * how they look: colours, fonts, frames, titles and the illustration on the picture half.
 * Class strings are Tailwind classes.
 */
export interface Skin {
  id: GiftTemplateId;
  /** Root of every page: background, text colour, font. */
  page: string;
  /** Background behind the picture half. */
  visual: string;
  /** Background of the content half. */
  content: string;
  /** Big title (colour, font, weight). */
  heading: string;
  /** Size of the big title in each frame; defaults suit a plain font. A handwriting font needs larger sizes. */
  headingSize?: { portrait: string; landscape: string };
  /** Line under a title. */
  sub: string;
  /** Running text (colour, font). */
  body: string;
  /** Size of running text in each frame. */
  bodySize?: { portrait: string; landscape: string };
  /** The sheet a letter or a note is written on. */
  paper: string;
  /** Main button. */
  button: string;
  /** Caption under a photo. */
  caption: string;
  /** A photo's frame (polaroid, tape, cassette...). */
  photoFrame: string;
  /** Titles of the pages. */
  title: (kind: SlideKind, gift: ViewerGift) => PageTitle;
  /** The illustration on the picture half of a page. */
  art: (kind: SlideKind, gift: ViewerGift) => ReactNode;
}

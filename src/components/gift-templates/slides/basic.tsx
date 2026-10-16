"use client";

import React from "react";
import SlideLayout from "../SlideLayout";
import type { ViewerGift } from "../normalize";
import type { TemplateContext } from "../template-contract";
import type { Skin, SlideKind } from "./skin";

export interface SlideProps {
  skin: Skin;
  gift: ViewerGift;
  ctx: TemplateContext;
}

/** The page frame every kind of page uses: picture half and content half in the template's colours. */
export function Page({ skin, ctx, visual, children }: { skin: Skin; ctx: TemplateContext; visual: React.ReactNode; children: React.ReactNode }) {
  return (
    <SlideLayout layout={ctx.layout} visual={visual} className={skin.page} visualClassName={skin.visual} contentClassName={skin.content}>
      {children}
    </SlideLayout>
  );
}

/** Running-text classes for the template and the frame. */
export function bodyClass(skin: Skin, ctx: TemplateContext): string {
  const size = skin.bodySize?.[ctx.layout] ?? (ctx.layout === "landscape" ? "text-lg xl:text-xl" : "text-base");
  return `${skin.body} ${size}`;
}

export function Heading({ skin, ctx, kind, gift }: SlideProps & { kind: SlideKind }) {
  const { title, sub } = skin.title(kind, gift);
  const size = skin.headingSize?.[ctx.layout] ?? (ctx.layout === "landscape" ? "text-4xl xl:text-5xl" : "text-3xl");
  return (
    <header>
      <h2 className={`${skin.heading} ${size}`}>{title}</h2>
      {sub && <p className={`${skin.sub} mt-1 ${ctx.layout === "landscape" ? "text-2xl" : "text-xl"}`}>{sub}</p>}
    </header>
  );
}

export function OpenSlide(props: SlideProps) {
  const { skin, gift, ctx } = props;
  return (
    <Page skin={skin} ctx={ctx} visual={skin.art("open", gift)}>
      <Heading {...props} kind="open" />
      {(gift.sender || gift.addressing) && (
        <p className={`${bodyClass(skin, ctx)}`}>
          {gift.sender && <>Từ {gift.sender}</>}
          {gift.sender && gift.addressing && " · "}
          {gift.addressing}
        </p>
      )}
      <div>
        <button type="button" onClick={ctx.next} className={`${skin.button} min-h-12 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}>
          Chạm để mở món quà
          <span aria-hidden="true" className="material-symbols-outlined text-[22px] leading-none">
            arrow_forward
          </span>
        </button>
      </div>
    </Page>
  );
}

export function LetterSlide(props: SlideProps) {
  const { skin, gift, ctx } = props;
  const letter = gift.letter;
  if (!letter) return null;
  return (
    <Page skin={skin} ctx={ctx} visual={skin.art("letter", gift)}>
      <Heading {...props} kind="letter" />
      <article className={skin.paper}>
        <p className={`${bodyClass(skin, ctx)}`}>Gửi {gift.recipientName || "bạn"},</p>
        <p className={`${bodyClass(skin, ctx)} mt-3 whitespace-pre-wrap break-words leading-relaxed`}>{letter.content}</p>
        {letter.signature && <p className={`${skin.sub} mt-4 text-right text-2xl`}>{letter.signature}</p>}
      </article>
    </Page>
  );
}

export function ClosingSlide(props: SlideProps) {
  const { skin, gift, ctx } = props;
  return (
    <Page skin={skin} ctx={ctx} visual={skin.art("closing", gift)}>
      <Heading {...props} kind="closing" />
      {gift.finalMessage && <p className={`${skin.paper} ${bodyClass(skin, ctx)} whitespace-pre-wrap break-words leading-relaxed`}>{gift.finalMessage}</p>}
      {gift.sender && <p className={`${skin.sub} text-2xl`}>— {gift.sender}</p>}
      <div>
        <button type="button" onClick={() => ctx.go(0)} className={`${skin.button} min-h-12 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}>
          <span aria-hidden="true" className="material-symbols-outlined text-[22px] leading-none">
            replay
          </span>
          Xem lại từ đầu
        </button>
      </div>
    </Page>
  );
}

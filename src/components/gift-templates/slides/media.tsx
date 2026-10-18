"use client";

import React, { useState } from "react";
import AnniversaryCounter from "../media/AnniversaryCounter";
import MusicPlayer from "../media/MusicPlayer";
import TimelineList from "../media/TimelineList";
import VideoEmbed from "../media/VideoEmbed";
import VoicePlayer from "../media/VoicePlayer";
import { bodyClass, Heading, Page, type SlideProps } from "./basic";

/** The album: one photo large on the picture half, the others as small pictures to choose from. */
export function PhotosSlide(props: SlideProps) {
  const { skin, gift, ctx } = props;
  const [selected, setSelected] = useState(0);
  const photos = gift.photos;
  const index = Math.min(selected, photos.length - 1);
  const current = photos[index];
  if (!current) return null;

  const visual = (
    <>
      {skin.art("photos", gift)}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <figure className={`${skin.photoFrame} flex max-h-full max-w-full flex-col`}>
          <img src={current.url} alt={current.caption || `Ảnh ${index + 1}`} className="min-h-0 max-w-full flex-1 object-contain" />
        </figure>
      </div>
    </>
  );

  return (
    <Page skin={skin} ctx={ctx} visual={visual}>
      <Heading {...props} kind="photos" />
      {(current.caption || current.date) && (
        <div aria-live="polite">
          {current.caption && <p className={`${skin.caption} ${ctx.layout === "landscape" ? "text-3xl" : "text-2xl"}`}>{current.caption}</p>}
          {current.date && <p className={`${skin.body} text-sm opacity-75`}>{current.date}</p>}
        </div>
      )}
      {photos.length > 1 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((p, i) => (
            <li key={`${p.url.slice(-24)}-${i}`}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={i === index}
                aria-label={p.caption ? `Xem ảnh: ${p.caption}` : `Xem ảnh ${i + 1}`}
                className={`block w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${i === index ? "border-current" : "border-transparent opacity-80 hover:opacity-100"}`}
              >
                <img src={p.url} alt="" aria-hidden="true" className="aspect-square w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}

export function VideoSlide(props: SlideProps) {
  const { skin, gift, ctx } = props;
  if (!gift.video) return null;
  const isDirect =
    !gift.video.includes("youtube.com") &&
    !gift.video.includes("youtu.be") &&
    !gift.video.includes("vimeo.com") &&
    !gift.video.includes("drive.google.com");
  return (
    <Page skin={skin} ctx={ctx} visual={skin.art("video", gift)}>
      <Heading {...props} kind="video" />
      {isDirect ? (
        <video src={gift.video} controls playsInline className="aspect-video w-full rounded-2xl bg-black object-contain shadow-md" />
      ) : (
        <VideoEmbed link={gift.video} />
      )}
    </Page>
  );
}

export function MusicSlide(props: SlideProps) {
  const { skin, gift, ctx } = props;
  const song = gift.song;
  if (!song) return null;
  return (
    <Page skin={skin} ctx={ctx} visual={skin.art("music", gift)}>
      <Heading {...props} kind="music" />
      <div className={skin.paper}>
        {song.source === "link" && (song.title || song.artist) && (
          <p className={`${bodyClass(skin, ctx)} mb-3`}>
            <strong>{song.title}</strong>
            {song.artist && <span className="opacity-75"> · {song.artist}</span>}
          </p>
        )}
        <MusicPlayer song={song} className={skin.body} />
      </div>
    </Page>
  );
}

export function VoiceSlide(props: SlideProps) {
  const { skin, gift, ctx } = props;
  const voice = gift.voice;
  if (!voice) return null;
  return (
    <Page skin={skin} ctx={ctx} visual={skin.art("voice", gift)}>
      <Heading {...props} kind="voice" />
      <div className={skin.paper}>
        <VoicePlayer src={voice.audioUrl} duration={voice.duration} onRefresh={ctx.refreshVoiceUrl} />
        {voice.noteText && <p className={`${bodyClass(skin, ctx)} mt-4 whitespace-pre-wrap break-words leading-relaxed`}>{voice.noteText}</p>}
      </div>
    </Page>
  );
}

export function AnniversarySlide(props: SlideProps) {
  const { skin, gift, ctx } = props;
  const a = gift.anniversary;
  if (!a) return null;
  return (
    <Page skin={skin} ctx={ctx} visual={skin.art("anniversary", gift)}>
      <Heading {...props} kind="anniversary" />
      <AnniversaryCounter date={a.date} label={a.label} className={`${skin.paper} ${skin.body} text-center`} />
    </Page>
  );
}

export function TimelineSlide(props: SlideProps) {
  const { skin, gift, ctx } = props;
  if (gift.timeline.length === 0) return null;
  return (
    <Page skin={skin} ctx={ctx} visual={skin.art("timeline", gift)}>
      <Heading {...props} kind="timeline" />
      <div className={`${skin.paper} ${skin.body}`}>
        <TimelineList items={gift.timeline} />
      </div>
    </Page>
  );
}

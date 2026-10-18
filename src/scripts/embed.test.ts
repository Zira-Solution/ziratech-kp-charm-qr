import { test } from "node:test";
import assert from "node:assert/strict";
import { toMusicEmbed, toVideoEmbed } from "../lib/media/embed.ts";

const YT = "dQw4w9WgXcQ";

test("YouTube links in every common form become the privacy-enhanced embed", () => {
  const expected = `https://www.youtube-nocookie.com/embed/${YT}`;
  for (const link of [
    `https://www.youtube.com/watch?v=${YT}`,
    `https://youtube.com/watch?v=${YT}&t=42s`,
    `https://m.youtube.com/watch?v=${YT}`,
    `https://youtu.be/${YT}`,
    `https://youtu.be/${YT}?si=abc`,
    `https://www.youtube.com/shorts/${YT}`,
    `https://www.youtube.com/embed/${YT}`,
    `https://www.youtube.com/live/${YT}`,
    `https://www.youtube.com/watch?v=${YT}&list=PL1234567890abcdef`, // a video inside a playlist plays as the video
  ]) {
    assert.equal(toVideoEmbed(link), expected, link);
  }
});

test("a YouTube playlist link becomes a playlist embed", () => {
  assert.equal(
    toVideoEmbed("https://www.youtube.com/playlist?list=PLC77007E23FF423C6"),
    "https://www.youtube-nocookie.com/embed?listType=playlist&list=PLC77007E23FF423C6"
  );
});

test("Vimeo links become the player embed", () => {
  const expected = "https://player.vimeo.com/video/76979871";
  for (const link of ["https://vimeo.com/76979871", "https://vimeo.com/channels/staffpicks/76979871", "https://player.vimeo.com/video/76979871?h=abc", "https://vimeo.com/76979871/abcdef1234"]) {
    assert.equal(toVideoEmbed(link), expected, link);
  }
});

test("Google Drive links become the preview embed", () => {
  const id = "1AbCdEfGhIjKlMnOpQrStUvWxYz_-012";
  const expected = `https://drive.google.com/file/d/${id}/preview`;
  for (const link of [`https://drive.google.com/file/d/${id}/view?usp=sharing`, `https://drive.google.com/file/d/${id}/preview`, `https://drive.google.com/open?id=${id}`]) {
    assert.equal(toVideoEmbed(link), expected, link);
  }
});

test("video links that are unsafe, from other sites or without an id give no embed", () => {
  for (const link of [
    "http://www.youtube.com/watch?v=" + YT, // not https
    "https://evil.com/watch?v=" + YT,
    "https://www.youtube.com.evil.com/watch?v=" + YT, // look-alike host
    "https://user:pass@www.youtube.com/watch?v=" + YT,
    "https://www.youtube.com/watch?v=short", // not an 11 character id
    "https://www.youtube.com/watch?v=" + YT + "%22%3E%3Cscript%3E",
    "https://www.youtube.com/",
    "https://vimeo.com/not-a-number",
    "https://drive.google.com/drive/folders/abc", // a folder, not a file
    "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC", // music host is not a video host
    "javascript:alert(1)",
    "",
    "not a url",
  ]) {
    assert.equal(toVideoEmbed(link), null, link);
  }
  for (const odd of [null, undefined, 5, {}] as unknown[]) assert.equal(toVideoEmbed(odd as string), null);
});

test("Spotify links become the embed, with a height that suits the kind", () => {
  const id = "4uLU6hMCjMI75M1A2tKUQC";
  assert.deepEqual(toMusicEmbed(`https://open.spotify.com/track/${id}?si=abc`), { src: `https://open.spotify.com/embed/track/${id}`, height: 152 });
  assert.deepEqual(toMusicEmbed(`https://open.spotify.com/intl-vi/track/${id}`), { src: `https://open.spotify.com/embed/track/${id}`, height: 152 });
  assert.deepEqual(toMusicEmbed(`https://open.spotify.com/playlist/${id}`), { src: `https://open.spotify.com/embed/playlist/${id}`, height: 352 });
  assert.deepEqual(toMusicEmbed(`https://open.spotify.com/album/${id}`), { src: `https://open.spotify.com/embed/album/${id}`, height: 352 });
  assert.equal(toMusicEmbed(`https://open.spotify.com/user/${id}`), null);
  assert.equal(toMusicEmbed("https://open.spotify.com/track/short"), null);
});

test("SoundCloud links become the widget, with the track link encoded and controls limited", () => {
  const e = toMusicEmbed("https://soundcloud.com/some-artist/some-track?utm_source=x#frag");
  assert.ok(e);
  const url = new URL(e.src);
  assert.equal(url.origin + url.pathname, "https://w.soundcloud.com/player/");
  assert.equal(url.searchParams.get("url"), "https://soundcloud.com/some-artist/some-track");
  assert.equal(url.searchParams.get("auto_play"), "false");
  assert.equal(url.searchParams.get("download"), "false");
  assert.equal(e.height, 166);
  assert.equal(toMusicEmbed("https://soundcloud.com/some-artist"), null); // an artist page, not a track
  assert.equal(toMusicEmbed("https://soundcloud.com.evil.com/a/b"), null);
});

test("a YouTube link used as music gives the compact video embed", () => {
  assert.deepEqual(toMusicEmbed(`https://music.youtube.com/watch?v=${YT}`), { src: `https://www.youtube-nocookie.com/embed/${YT}`, height: 220 });
  assert.deepEqual(toMusicEmbed(`https://youtu.be/${YT}`), { src: `https://www.youtube-nocookie.com/embed/${YT}`, height: 220 });
  assert.equal(toMusicEmbed("https://vimeo.com/76979871"), null); // not a music host
});

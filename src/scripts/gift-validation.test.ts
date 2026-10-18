import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanText,
  parseDate,
  parseHttpsLink,
  parsePhotos,
  parseAnniversary,
  parseTimeline,
  parseSong,
  parseVoice,
  parseGiftData,
  MUSIC_HOSTS,
  VIDEO_HOSTS,
  MAX_PHOTO_CHARS,
} from "../lib/validation/gift.ts";
import { DEFAULT_TEMPLATE } from "../components/gift-templates/template-config.ts";

const TOKEN = "KP-2010-ABC123";
const jpeg = (chars: number) => "data:image/jpeg;base64," + "A".repeat(chars);

// ---------------------------------------------------------------- cleanText
test("cleanText keeps characters exactly as typed", () => {
  assert.equal(cleanText(`Tom & Jerry <3 20/10 "q" it's`), `Tom & Jerry <3 20/10 "q" it's`);
});
test("cleanText strips control characters, keeps line breaks, trims and caps length", () => {
  assert.equal(cleanText("  a\u0000b\u0007c\nd  "), "abc\nd");
  assert.equal(cleanText("x".repeat(50), 10), "x".repeat(10));
  assert.equal(cleanText(42), "");
});

// ---------------------------------------------------------------- links
test("parseHttpsLink accepts https links on allowed hosts and subdomains", () => {
  for (const url of [
    "https://www.youtube.com/watch?v=abc",
    "https://youtu.be/abc",
    "https://music.youtube.com/watch?v=abc",
    "https://open.spotify.com/track/xyz",
  ]) {
    const r = parseHttpsLink(url, MUSIC_HOSTS, "Link nhạc");
    assert.equal(r.ok, true, url);
  }
});
test("parseHttpsLink rejects unsafe or look-alike links", () => {
  for (const url of [
    "http://youtu.be/abc", // not https
    "javascript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "https://user:pass@youtu.be/abc", // credentials
    "https://youtube.com.evil.com/x", // look-alike host
    "https://notyoutube.com/x",
    "https://evil.com/?u=https://youtu.be/abc",
    "ftp://youtu.be/abc",
    "not a url",
    "",
    "https://youtu.be/" + "a".repeat(400), // too long
  ]) {
    assert.equal(parseHttpsLink(url, MUSIC_HOSTS, "Link nhạc").ok, false, url);
  }
  assert.equal(parseHttpsLink(123, MUSIC_HOSTS, "Link nhạc").ok, false);
});
test("video and music allowlists are separate", () => {
  assert.equal(parseHttpsLink("https://vimeo.com/123", VIDEO_HOSTS, "Link video").ok, true);
  assert.equal(parseHttpsLink("https://vimeo.com/123", MUSIC_HOSTS, "Link nhạc").ok, false);
  assert.equal(parseHttpsLink("https://open.spotify.com/track/x", VIDEO_HOSTS, "Link video").ok, false);
});

// ---------------------------------------------------------------- dates
test("parseDate accepts real calendar dates only", () => {
  for (const d of ["2024-02-29", "2025-10-20", "1900-01-01", "2100-12-31"]) assert.equal(parseDate(d, "Ngày").ok, true, d);
  for (const d of ["2023-02-29", "2023-13-01", "2023-02-30", "2023-1-1", "1899-12-31", "2101-01-01", "20/10/2025", "", "abc"]) {
    assert.equal(parseDate(d, "Ngày").ok, false, d);
  }
  assert.equal(parseDate(20251020, "Ngày").ok, false);
});

// ---------------------------------------------------------------- photos
test("parsePhotos keeps good photos whole and the text raw", () => {
  const url = jpeg(1000);
  const r = parsePhotos([{ url, caption: "A & B / 20/10", date: "20/10" }, { url: "https://example.com/a.jpg" }], { max: 6 });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value[0].url, url);
    assert.equal(r.value[0].caption, "A & B / 20/10");
    assert.equal(r.value[1].url, "https://example.com/a.jpg");
  }
});
test("parsePhotos rejects instead of truncating", () => {
  assert.equal(parsePhotos([{ url: jpeg(MAX_PHOTO_CHARS) }], { max: 6 }).ok, false); // prefix pushes it over the limit
  assert.equal(parsePhotos([{ url: "data:text/html;base64,PHNjcmlwdD4=" }], { max: 6 }).ok, false);
  assert.equal(parsePhotos([{ url: "http://insecure.example/a.jpg" }], { max: 6 }).ok, false);
  assert.equal(parsePhotos([{ url: "javascript:alert(1)" }], { max: 6 }).ok, false);
  assert.equal(parsePhotos([{ url: "" }], { max: 6 }).ok, false);
  assert.equal(parsePhotos(Array.from({ length: 7 }, () => ({ url: "https://e.com/a.jpg" })), { max: 6 }).ok, false);
  assert.equal(parsePhotos("nope", { max: 6 }).ok, false);
});
test("parsePhotos honours a smaller max and names the item in the error", () => {
  const r = parsePhotos([{ url: "https://e.com/1.jpg" }, { url: "https://e.com/2.jpg" }, { url: "https://e.com/3.jpg" }], {
    max: 2,
    label: "Ảnh nổi bật",
  });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /2/);
  const bad = parsePhotos([{ url: "https://e.com/1.jpg" }, { url: "" }], { max: 6, label: "Ảnh nổi bật" });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.match(bad.error, /Ảnh nổi bật số 2/);
});
test("parsePhotos treats missing input as an empty album", () => {
  assert.deepEqual(parsePhotos(undefined, { max: 6 }), { ok: true, value: [] });
});

// ---------------------------------------------------------------- anniversary + timeline
test("parseAnniversary", () => {
  assert.deepEqual(parseAnniversary(undefined), { ok: true, value: undefined });
  assert.deepEqual(parseAnniversary({ date: "" }), { ok: true, value: undefined });
  assert.deepEqual(parseAnniversary({ date: "2024-02-14", label: "Ngày mình quen nhau" }), {
    ok: true,
    value: { date: "2024-02-14", label: "Ngày mình quen nhau" },
  });
  const def = parseAnniversary({ date: "2024-02-14" });
  assert.equal(def.ok && def.value?.label, "Ngày kỷ niệm");
  assert.equal(parseAnniversary({ date: "2024-02-30" }).ok, false);
});
test("parseTimeline", () => {
  const item = (n: number) => ({ date: "2024-02-0" + n, title: "Mốc " + n, text: "Mô tả & / " + n });
  const ok = parseTimeline([item(1), item(2)]);
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.value[0].text, "Mô tả & / 1");
  assert.equal(parseTimeline([item(1), item(2), item(3), item(4), item(5), item(6)]).ok, false); // > 5
  assert.equal(parseTimeline([{ date: "2024-02-01", title: "", text: "x" }]).ok, false); // no title
  assert.equal(parseTimeline([{ date: "2024-02-31", title: "x", text: "" }]).ok, false); // bad date
  assert.deepEqual(parseTimeline(undefined), { ok: true, value: [] });
  assert.equal(parseTimeline("x").ok, false);
});

// ---------------------------------------------------------------- song
test("parseSong", () => {
  const none = parseSong({ source: "none" });
  assert.equal(none.ok && none.value.source, "none");

  const preset = parseSong({ source: "preset", presetId: "piano" });
  assert.equal(preset.ok && preset.value.presetId, "piano");
  assert.equal(parseSong({ source: "preset", presetId: "../../etc" }).ok, false);

  const link = parseSong({ source: "link", link: "https://youtu.be/abc", title: "Bài của mình", artist: "Ai đó" });
  assert.equal(link.ok && link.value.link, "https://youtu.be/abc");
  assert.equal(parseSong({ source: "link", link: "https://evil.com/x" }).ok, false);
  assert.equal(parseSong({ source: "link" }).ok, false);
  assert.equal(parseSong({ source: "mystery" }).ok, false);
  assert.deepEqual(parseSong(undefined), { ok: true, value: { source: "none", title: "", artist: "", duration: "" } });
});

// ---------------------------------------------------------------- voice
test("parseVoice only accepts a recording that belongs to this card", () => {
  const good = `${TOKEN}/voice-1760000000000.webm`;
  const r = parseVoice({ audioPath: good, durationSec: 75, noteText: "Lời thoại" }, TOKEN);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.audioPath, good);
    assert.equal(r.value.duration, "01:15");
    assert.equal(r.value.noteText, "Lời thoại");
  }
  for (const path of [
    "KP-2010-OTHER9/voice-1760000000000.webm", // another card
    `${TOKEN}/../KP-2010-OTHER9/voice-1760000000000.webm`, // traversal
    `${TOKEN}/voice-1760000000000.exe`, // wrong extension
    `${TOKEN}/photo-1760000000000.webm`, // wrong prefix
    `/${TOKEN}/voice-1760000000000.webm`,
  ]) {
    assert.equal(parseVoice({ audioPath: path, durationSec: 10 }, TOKEN).ok, false, path);
  }
});
test("parseVoice clamps the duration and allows no recording", () => {
  const path = `${TOKEN}/voice-1760000000000.webm`;
  const long = parseVoice({ audioPath: path, durationSec: 9999 }, TOKEN);
  assert.equal(long.ok && long.value.duration, "02:00");
  const none = parseVoice({ noteText: "chỉ có chữ" }, TOKEN);
  assert.equal(none.ok && none.value.audioPath, undefined);
  assert.equal(none.ok && none.value.duration, "00:00");
});

// ---------------------------------------------------------------- whole card
const base = {
  recipientName: "Lan",
  senderName: "An",
  letterContent: "Chúc mừng 20/10 & mãi bên nhau",
};
const VOICE = `${TOKEN}/voice-1760000000000.webm`;
const full = {
  ...base,
  memoryPhotos: [{ url: "https://e.com/a.jpg", caption: "a", date: "" }],
  finalMessage: "Mãi mãi",
  anniversary: { date: "2024-02-14", label: "Ngày yêu" },
  timeline: [{ date: "2024-02-14", title: "Gặp nhau", text: "" }],
  videoUrl: "https://youtu.be/abc",
  song: { source: "preset", presetId: "piano" },
  voiceNote: { audioPath: VOICE, durationSec: 30, noteText: "xin chào" },
};
const parse = (input: unknown) => parseGiftData(input, { token: TOKEN });

test("parseGiftData only requires a recipient name; the letter is optional", () => {
  assert.equal(parse({ ...full, blocks: ["letter"], recipientName: "  " }).ok, false);
  assert.equal(parse(null).ok, false);
  const photosOnly = parse({ recipientName: "Lan", memoryPhotos: full.memoryPhotos, blocks: ["photos"] });
  assert.equal(photosOnly.ok, true);
  if (photosOnly.ok) assert.equal(photosOnly.value.letterContent, undefined);
});

test("parseGiftData needs at least one valid, unique message kind in blocks", () => {
  const empty = parse({ ...full, blocks: [] });
  assert.equal(empty.ok, false);
  if (!empty.ok) assert.match(empty.error, /ít nhất một thông điệp/);
  assert.equal(parse({ ...full, blocks: "letter" }).ok, false);
  assert.equal(parse({ ...full, blocks: ["letter", "letter"] }).ok, false);
  assert.equal(parse({ ...full, blocks: ["letter", "highlight"] }).ok, false);
  assert.equal(parse({ ...full, blocks: ["letter", 3] }).ok, false);
});

test("parseGiftData keeps the order of blocks", () => {
  const r = parse({ ...full, blocks: ["video", "letter", "photos"] });
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(r.value.blocks, ["video", "letter", "photos"]);
});

test("parseGiftData without blocks works out which messages the payload has", () => {
  const r = parse(full);
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(r.value.blocks, ["letter", "photos", "video", "music", "voice", "anniversary", "timeline", "finalMessage"]);
  const letterOnly = parse(base);
  assert.equal(letterOnly.ok, true);
  if (letterOnly.ok) assert.deepEqual(letterOnly.value.blocks, ["letter"]);
  assert.equal(parse({ recipientName: "Lan" }).ok, false); // nothing to send
});

test("parseGiftData keeps only the content of ticked messages", () => {
  const r = parse({ ...full, blocks: ["letter", "video"] });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const v = r.value as unknown as Record<string, unknown>;
  assert.equal(v.letterContent, base.letterContent);
  assert.equal(v.videoUrl, "https://youtu.be/abc");
  assert.deepEqual(v.memoryPhotos, []);
  for (const dropped of ["finalMessage", "anniversary", "timeline", "song", "voiceNote"]) {
    assert.equal(v[dropped], undefined, `${dropped} is dropped`);
  }
});

test("parseGiftData rejects a ticked message that is empty and names it", () => {
  const cases: [string, Record<string, unknown>][] = [
    ["letter", { letterContent: "  " }],
    ["photos", { memoryPhotos: [] }],
    ["voice", { voiceNote: { noteText: "chỉ có chữ" } }],
    ["video", { videoUrl: "" }],
    ["music", { song: { source: "none" } }],
    ["anniversary", { anniversary: { date: "" } }],
    ["timeline", { timeline: [] }],
    ["finalMessage", { finalMessage: "" }],
  ];
  for (const [block, patch] of cases) {
    const r = parse({ ...full, ...patch, blocks: [block] });
    assert.equal(r.ok, false, block);
    if (!r.ok) assert.match(r.error, /đang trống/, block);
  }
  const video = parse({ ...full, videoUrl: "", blocks: ["letter", "video"] });
  if (!video.ok) assert.match(video.error, /Video/);
});

test("parseGiftData falls back to the default template and keeps text exactly as typed", () => {
  const r = parse({ ...base, template: "no-such-template", blocks: ["letter"] });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.template, DEFAULT_TEMPLATE);
    assert.equal(r.value.letterContent, "Chúc mừng 20/10 & mãi bên nhau");
  }
});

test("parseGiftData drops unknown fields, the PIN and old highlight photos", () => {
  const r = parse({
    ...base,
    blocks: ["letter"],
    pinCode: "1234",
    evil: { a: 1 },
    __proto__x: 1,
    momentPhotos: [{ url: "https://e.com/h.jpg", caption: "" }],
    coverIllustrationUrl: "https://e.com/h.jpg",
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    const keys = Object.keys(r.value);
    for (const dropped of ["pinCode", "evil", "momentPhotos", "coverIllustrationUrl"]) assert.equal(keys.includes(dropped), false, dropped);
  }
});

test("parseGiftData rejects bad content of a ticked message with a message", () => {
  const bad = parse({ ...full, videoUrl: "https://evil.com/v", blocks: ["video"] });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.match(bad.error, /video/i);
  assert.equal(parse({ ...full, timeline: "x", blocks: ["timeline"] }).ok, false);
  assert.equal(parse({ ...full, anniversary: { date: "2024-13-40" }, blocks: ["anniversary"] }).ok, false);
  assert.equal(parse({ ...full, voiceNote: { audioPath: "KP-2010-OTHER9/voice-1760000000000.webm" }, blocks: ["voice"] }).ok, false);
});

test("parseGiftData accepts the largest album the limits allow", () => {
  const big = jpeg(390_000);
  const album = Array.from({ length: 6 }, () => ({ url: big, caption: "" }));
  assert.equal(parse({ recipientName: "Lan", memoryPhotos: album, blocks: ["photos"] }).ok, true);
  const seven = Array.from({ length: 7 }, () => ({ url: "https://e.com/a.jpg", caption: "" }));
  assert.equal(parse({ recipientName: "Lan", memoryPhotos: seven, blocks: ["photos"] }).ok, false);
});

test("parseGiftData preserves and cleans messenger settings when template is messenger", () => {
  const res = parse({
    template: "messenger",
    recipientName: "Bé Iu",
    blocks: ["letter"],
    letterContent: "Anh thương em nhiều",
    messenger: {
      wallpaperUrl: "https://example.com/custom.jpg",
      chatWallpaperUrl: "https://example.com/chat-bg.jpg",
      avatarUrl: "https://example.com/avatar.jpg",
      notificationText: "hello bé iu nè ❤️",
      messages: ["Tin 1", "Tin 2"],
      showFloatingHearts: true,
      giftLeadMessage: "Mở quà nha",
      videoUrl: "https://youtu.be/dQw4w9WgXcQ",
      videoLeadMessage: "Anh có video gửi em nè 🎬",
      videoTitle: "Kỷ niệm của tụi mình",
    },
  });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.template, "messenger");
    assert.equal(res.value.messenger?.notificationText, "hello bé iu nè ❤️");
    assert.deepEqual(res.value.messenger?.messages, ["Tin 1", "Tin 2"]);
    assert.equal(res.value.messenger?.wallpaperUrl, "https://example.com/custom.jpg");
    assert.equal(res.value.messenger?.chatWallpaperUrl, "https://example.com/chat-bg.jpg");
    assert.equal(res.value.messenger?.giftLeadMessage, "Mở quà nha");
    assert.equal(res.value.messenger?.videoUrl, "https://youtu.be/dQw4w9WgXcQ");
    assert.equal(res.value.messenger?.videoLeadMessage, "Anh có video gửi em nè 🎬");
    assert.equal(res.value.messenger?.videoTitle, "Kỷ niệm của tụi mình");
  }
});

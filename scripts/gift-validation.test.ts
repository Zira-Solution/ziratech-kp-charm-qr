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
} from "../src/lib/validation/gift.ts";

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

test("parseGiftData requires a recipient name and a letter", () => {
  assert.equal(parseGiftData({ ...base, template: "retro-nostalgia", recipientName: "  " }, { token: TOKEN }).ok, false);
  assert.equal(parseGiftData({ ...base, template: "retro-nostalgia", letterContent: "" }, { token: TOKEN }).ok, false);
  assert.equal(parseGiftData(null, { token: TOKEN }).ok, false);
});
test("parseGiftData falls back to the default template and keeps text exactly as typed", () => {
  const r = parseGiftData({ ...base, template: "no-such-template" }, { token: TOKEN });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.template, "vintage-scrapbook");
    assert.equal(r.value.letterContent, "Chúc mừng 20/10 & mãi bên nhau");
  }
});
test("parseGiftData drops unknown fields and the PIN", () => {
  const r = parseGiftData({ ...base, template: "retro-nostalgia", pinCode: "1234", evil: { a: 1 }, __proto__x: 1 }, { token: TOKEN });
  assert.equal(r.ok, true);
  if (r.ok) {
    const keys = Object.keys(r.value);
    assert.equal(keys.includes("pinCode"), false);
    assert.equal(keys.includes("evil"), false);
  }
});
test("parseGiftData keeps only the blocks the chosen template supports", () => {
  const payload = {
    ...base,
    finalMessage: "Mãi mãi",
    anniversary: { date: "2024-02-14", label: "Ngày yêu" },
    timeline: [{ date: "2024-02-14", title: "Gặp nhau", text: "" }],
    videoUrl: "https://youtu.be/abc",
    song: { source: "preset", presetId: "piano" },
    voiceNote: { audioPath: `${TOKEN}/voice-1760000000000.webm`, durationSec: 30, noteText: "xin chào" },
    momentPhotos: [{ url: "https://e.com/a.jpg", caption: "a" }],
  };
  const vintage = parseGiftData({ ...payload, template: "vintage-scrapbook" }, { token: TOKEN });
  assert.equal(vintage.ok, true);
  if (vintage.ok) {
    const v = vintage.value as unknown as Record<string, unknown>;
    assert.ok(v.anniversary, "vintage keeps the anniversary");
    assert.ok(v.finalMessage, "vintage keeps the final message");
    for (const dropped of ["timeline", "videoUrl", "song", "voiceNote", "momentPhotos"]) {
      assert.equal(dropped in v && v[dropped] !== undefined && (v[dropped] as unknown[]).length !== 0, false, `vintage drops ${dropped}`);
    }
  }

  const storybook = parseGiftData({ ...payload, template: "storybook-sunset" }, { token: TOKEN });
  assert.equal(storybook.ok, true);
  if (storybook.ok) {
    const s = storybook.value as unknown as Record<string, unknown>;
    assert.ok(s.timeline, "storybook keeps the timeline");
    assert.ok(s.voiceNote, "storybook keeps the voice note");
    assert.equal(s.anniversary, undefined, "storybook has no anniversary block");
    assert.equal(s.videoUrl, "https://youtu.be/abc");
  }
});
test("parseGiftData limits highlight photos by template", () => {
  const photos = (n: number) => Array.from({ length: n }, (_, i) => ({ url: `https://e.com/${i}.jpg`, caption: "" }));
  assert.equal(parseGiftData({ ...base, template: "retro-nostalgia", momentPhotos: photos(2) }, { token: TOKEN }).ok, true);
  assert.equal(parseGiftData({ ...base, template: "retro-nostalgia", momentPhotos: photos(3) }, { token: TOKEN }).ok, false);
  assert.equal(parseGiftData({ ...base, template: "storybook-sunset", momentPhotos: photos(2) }, { token: TOKEN }).ok, false);
  const one = parseGiftData({ ...base, template: "storybook-sunset", momentPhotos: photos(1) }, { token: TOKEN });
  assert.equal(one.ok, true);
  if (one.ok) assert.equal(one.value.coverIllustrationUrl, "https://e.com/0.jpg"); // first highlight becomes the cover
});
test("parseGiftData rejects bad blocks with a message", () => {
  const bad = parseGiftData({ ...base, template: "retro-nostalgia", videoUrl: "https://evil.com/v" }, { token: TOKEN });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.match(bad.error, /video/i);
  assert.equal(parseGiftData({ ...base, template: "storybook-sunset", timeline: "x" }, { token: TOKEN }).ok, false);
  assert.equal(parseGiftData({ ...base, template: "vintage-scrapbook", anniversary: { date: "2024-13-40" } }, { token: TOKEN }).ok, false);
});
test("parseGiftData caps the total size of all photos", () => {
  const big = jpeg(390_000);
  const album = Array.from({ length: 6 }, () => ({ url: big, caption: "" }));
  const r = parseGiftData(
    { ...base, template: "retro-nostalgia", memoryPhotos: album, momentPhotos: [{ url: big }, { url: big }] },
    { token: TOKEN }
  );
  assert.equal(r.ok, false); // 8 x 390k = 3.1M > 2.5M
});

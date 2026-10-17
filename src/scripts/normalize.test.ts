import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeGift } from "../components/gift-templates/normalize.ts";
import { DEFAULT_TEMPLATE } from "../components/gift-templates/template-config.ts";

const photo = (n: number) => ({ url: `https://e.com/${n}.jpg`, caption: `ảnh ${n}`, date: "" });

const saved = {
  template: "retro-nostalgia",
  blocks: ["video", "letter", "photos"],
  recipientName: "Lan",
  senderName: "An",
  addressing: "Anh - Em",
  letterTitle: "LỜI NHẮN",
  letterSubtitle: "Gửi em",
  letterContent: "Chúc mừng 20/10",
  letterSignature: "An",
  memoryPhotos: [photo(1), photo(2)],
  videoUrl: "https://youtu.be/abc",
};

test("a saved card keeps its own template, names and the order of its messages", () => {
  const g = normalizeGift(saved);
  assert.equal(g.template, "retro-nostalgia");
  assert.deepEqual(g.blocks, ["video", "letter", "photos"]);
  assert.equal(g.recipientName, "Lan");
  assert.equal(g.sender, "An");
  assert.equal(g.addressing, "Anh - Em");
  assert.equal(g.video, "https://youtu.be/abc");
  assert.equal(g.letter?.content, "Chúc mừng 20/10");
  assert.equal(g.letter?.signature, "An");
  assert.equal(g.photos.length, 2);
});

test("content of messages that were not ticked is left out", () => {
  const g = normalizeGift({ ...saved, blocks: ["letter"], finalMessage: "Mãi mãi", timeline: [{ date: "2024-02-14", title: "x", text: "" }] });
  assert.deepEqual(g.blocks, ["letter"]);
  assert.equal(g.video, undefined);
  assert.equal(g.finalMessage, undefined);
  assert.deepEqual(g.timeline, []);
  assert.deepEqual(g.photos, []);
});

test("an anonymous card hides the sender", () => {
  assert.equal(normalizeGift({ ...saved, anonymous: true }).sender, "");
  assert.equal(normalizeGift({ ...saved, anonymous: true }).anonymous, true);
});

test("a card saved before blocks existed gets its list from its content, with old highlight photos first", () => {
  const old = {
    template: "storybook-sunset",
    recipientName: "Lan",
    senderName: "An",
    letterContent: "Xin chào",
    memoryPhotos: [photo(1), photo(2)],
    momentPhotos: [{ url: "https://e.com/cover.jpg", caption: "Bìa" }],
    finalMessage: "Mãi mãi",
    voiceNote: { audioPath: "KP-2010-ABC123/voice-1760000000000.webm", duration: "00:30", noteText: "alo", audioUrl: "https://signed.example/a" },
  };
  const g = normalizeGift(old);
  assert.deepEqual(g.blocks, ["letter", "photos", "voice", "finalMessage"]);
  assert.equal(g.photos[0].url, "https://e.com/cover.jpg");
  assert.equal(g.photos.length, 3);
  assert.equal(g.voice?.audioUrl, "https://signed.example/a");
  assert.equal(g.voice?.duration, "00:30");
  assert.equal(g.finalMessage, "Mãi mãi");
});

test("old highlight photos are ignored once a card has its own blocks, and an album never exceeds six", () => {
  const withBlocks = normalizeGift({ ...saved, blocks: ["photos"], momentPhotos: [{ url: "https://e.com/h.jpg" }] });
  assert.equal(withBlocks.photos.length, 2);
  const old = normalizeGift({ recipientName: "Lan", memoryPhotos: [1, 2, 3, 4, 5, 6].map(photo), momentPhotos: [{ url: "https://e.com/h.jpg" }] });
  assert.equal(old.photos.length, 6);
  assert.equal(old.photos[0].url, "https://e.com/h.jpg");
});

test("odd entries in blocks are dropped, repeats collapse, and a message with no content never shows", () => {
  const g = normalizeGift({ ...saved, blocks: ["letter", "nope", "letter", "timeline", 5, "voice"] });
  assert.deepEqual(g.blocks, ["letter"]); // timeline and voice have no content, the rest is invalid or repeated
});

test("nothing is invented for missing or broken data", () => {
  for (const input of [null, undefined, "x", 7, [], {}]) {
    const g = normalizeGift(input);
    assert.equal(g.template, DEFAULT_TEMPLATE);
    assert.deepEqual(g.blocks, []);
    assert.equal(g.recipientName, "");
    assert.equal(g.sender, "");
    assert.deepEqual(g.photos, []);
    assert.deepEqual(g.timeline, []);
    for (const key of ["letter", "video", "song", "voice", "anniversary", "finalMessage"] as const) assert.equal(g[key], undefined, key);
  }
});

test("music, anniversary and timeline come through in a safe shape", () => {
  const g = normalizeGift({
    recipientName: "Lan",
    blocks: ["music", "anniversary", "timeline"],
    song: { source: "link", link: "https://open.spotify.com/track/x", title: "Bài", artist: "Ai đó" },
    anniversary: { date: "2024-02-14", label: "Ngày yêu" },
    timeline: [{ date: "2024-02-14", title: "Gặp nhau", text: "Lần đầu" }, null, { title: "thiếu ngày" }],
  });
  assert.deepEqual(g.blocks, ["music", "anniversary", "timeline"]);
  assert.equal(g.song?.source, "link");
  assert.equal(g.song?.link, "https://open.spotify.com/track/x");
  assert.equal(g.anniversary?.label, "Ngày yêu");
  assert.equal(g.timeline.length, 1);
  assert.equal(g.timeline[0].title, "Gặp nhau");
  const preset = normalizeGift({ recipientName: "Lan", blocks: ["music"], song: { source: "preset", presetId: "piano", title: "Piano mùa thu" } });
  assert.equal(preset.song?.presetId, "piano");
});

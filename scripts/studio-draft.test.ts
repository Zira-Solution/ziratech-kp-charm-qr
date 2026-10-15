import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyDraft, draftFromSaved, draftToPayload, daysSince, emptyBlocks } from "../src/components/studio/draft.ts";
import { parseGiftData } from "../src/lib/validation/gift.ts";
import { DEFAULT_TEMPLATE } from "../src/components/gift-templates/template-config.ts";

const TOKEN = "KP-2010-ABC123";

test("an empty draft has no messages ticked and is not a valid card", () => {
  const d = emptyDraft();
  assert.deepEqual(d.blocks, []);
  assert.equal(parseGiftData(draftToPayload(d).giftData, { token: TOKEN }).ok, false);
});

test("a filled draft becomes a valid card and survives a save/reload round trip, order included", () => {
  const d = emptyDraft();
  d.template = "storybook-sunset";
  d.recipientName = "Lan";
  d.senderName = "An";
  d.addressing = "Anh - Em";
  d.blocks = ["video", "letter", "photos", "finalMessage", "timeline", "music"];
  d.letterContent = "Chúc mừng 20/10 & mãi bên nhau";
  d.photos = [{ url: "https://e.com/1.jpg", caption: "Ảnh 1", date: "20/10" }];
  d.finalMessage = "Mãi mãi";
  d.timeline = [{ date: "2024-02-14", title: "Gặp nhau", text: "Lần đầu" }];
  d.videoUrl = "https://youtu.be/abc";
  d.song = { source: "link", presetId: "", link: "https://open.spotify.com/track/x", title: "Bài", artist: "Ai đó" };

  const parsed = parseGiftData(draftToPayload(d).giftData, { token: TOKEN });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const back = draftFromSaved(parsed.value);
  assert.deepEqual(back.blocks, ["video", "letter", "photos", "finalMessage", "timeline", "music"]);
  assert.equal(back.template, "storybook-sunset");
  assert.equal(back.recipientName, "Lan");
  assert.equal(back.letterContent, "Chúc mừng 20/10 & mãi bên nhau");
  assert.equal(back.photos[0].caption, "Ảnh 1");
  assert.equal(back.timeline[0].title, "Gặp nhau");
  assert.equal(back.videoUrl, "https://youtu.be/abc");
  assert.equal(back.song.source, "link");
  assert.equal(back.song.title, "Bài");
});

test("unticking a message keeps what was typed in the draft but it is not saved", () => {
  const d = emptyDraft();
  d.recipientName = "Lan";
  d.letterContent = "Xin chào";
  d.finalMessage = "Mãi mãi";
  d.blocks = ["letter", "finalMessage"];
  d.blocks = d.blocks.filter((b) => b !== "finalMessage");
  assert.equal(d.finalMessage, "Mãi mãi"); // still in the draft, so ticking it again brings it back
  const parsed = parseGiftData(draftToPayload(d).giftData, { token: TOKEN });
  assert.equal(parsed.ok && parsed.value.finalMessage, undefined);
});

test("the payload sends the list of messages, even when it is empty, and no highlight photos", () => {
  const payload = draftToPayload(emptyDraft()).giftData;
  assert.deepEqual(payload.blocks, []);
  assert.equal("momentPhotos" in payload, false);
  const d = emptyDraft();
  d.blocks = ["photos", "letter"];
  assert.deepEqual(draftToPayload(d).giftData.blocks, ["photos", "letter"]);
});

test("a card saved before blocks existed opens with its list worked out and old highlights at the front of the album", () => {
  const d = draftFromSaved({
    template: "retro-nostalgia",
    recipientName: "Lan",
    letterContent: "Xin chào",
    memoryPhotos: [{ url: "https://e.com/1.jpg" }, { url: "https://e.com/2.jpg" }],
    momentPhotos: [{ url: "https://e.com/cover.jpg", caption: "Bìa" }],
    finalMessage: "Mãi mãi",
  });
  assert.deepEqual(d.blocks, ["letter", "photos", "finalMessage"]);
  assert.deepEqual(d.photos.map((p) => p.url), ["https://e.com/cover.jpg", "https://e.com/1.jpg", "https://e.com/2.jpg"]);
  assert.equal(d.photos[0].caption, "Bìa");
});

test("once a card has its own list, old highlight photos are ignored and the album stays at six", () => {
  const six = [1, 2, 3, 4, 5, 6].map((n) => ({ url: `https://e.com/${n}.jpg` }));
  const d = draftFromSaved({ blocks: ["photos"], memoryPhotos: six, momentPhotos: [{ url: "https://e.com/h.jpg" }] });
  assert.equal(d.photos.length, 6);
  assert.equal(d.photos[0].url, "https://e.com/1.jpg");
  const legacy = draftFromSaved({ memoryPhotos: six, momentPhotos: [{ url: "https://e.com/h.jpg" }] });
  assert.equal(legacy.photos.length, 6);
  assert.equal(legacy.photos[0].url, "https://e.com/h.jpg");
});

test("odd entries in a saved list are dropped and repeats collapse", () => {
  const d = draftFromSaved({ blocks: ["letter", "nope", "letter", 4, "video"], letterContent: "x", videoUrl: "https://youtu.be/a" });
  assert.deepEqual(d.blocks, ["letter", "video"]);
});

test("the new PIN is only sent when it is four digits", () => {
  const d = emptyDraft();
  d.unlockPin = "12";
  assert.equal("pinCode" in draftToPayload(d).giftData, false);
  d.unlockPin = "2468";
  assert.equal(draftToPayload(d).giftData.pinCode, "2468");
});

test("draftFromSaved copes with missing or odd data", () => {
  assert.deepEqual(draftFromSaved(null), emptyDraft());
  assert.deepEqual(draftFromSaved("x"), emptyDraft());
  const d = draftFromSaved({
    template: "nope",
    memoryPhotos: [null, { url: "" }, { url: "https://e.com/a.jpg" }],
    voiceNote: { duration: "01:15" },
  });
  assert.equal(d.template, DEFAULT_TEMPLATE);
  assert.equal(d.photos.length, 1);
  assert.equal(d.voice.durationSec, 75);
  assert.deepEqual(d.blocks, ["photos"]);
});

test("daysSince counts whole days and rejects bad dates", () => {
  const today = new Date(2025, 9, 20); // 20 Oct 2025 (local)
  assert.equal(daysSince("2025-10-20", today), 0);
  assert.equal(daysSince("2025-10-10", today), 10);
  assert.equal(daysSince("2024-10-20", today), 365);
  assert.equal(daysSince("2025-10-25", today), -5);
  assert.equal(daysSince("nope", today), null);
});

test("emptyBlocks lists ticked messages that have no content, in the buyer's order", () => {
  const d = emptyDraft();
  d.blocks = ["video", "letter", "photos", "voice", "music", "anniversary", "timeline", "finalMessage"];
  assert.deepEqual(emptyBlocks(d), d.blocks);

  d.letterContent = "Xin chào";
  d.photos = [{ url: "https://e.com/a.jpg", caption: "", date: "" }];
  d.videoUrl = "https://youtu.be/a";
  d.voice.audioPath = "KP-2010-ABC123/voice-1760000000000.webm";
  d.song = { source: "preset", presetId: "piano", link: "", title: "", artist: "" };
  d.anniversaryDate = "2024-02-14";
  d.timeline = [{ date: "2024-02-14", title: "Gặp nhau", text: "" }];
  d.finalMessage = "Mãi mãi";
  assert.deepEqual(emptyBlocks(d), []);
});

test("emptyBlocks ignores messages that are not ticked and treats blank text as empty", () => {
  const d = emptyDraft();
  d.blocks = ["letter", "finalMessage"];
  d.letterContent = "   ";
  d.videoUrl = ""; // not ticked, so not reported
  d.finalMessage = "Mãi mãi";
  assert.deepEqual(emptyBlocks(d), ["letter"]);
});

test("a draft without empty ticked messages passes the server check", () => {
  const d = emptyDraft();
  d.recipientName = "Lan";
  d.blocks = ["letter", "photos"];
  d.letterContent = "Xin chào";
  d.photos = [{ url: "https://e.com/a.jpg", caption: "", date: "" }];
  assert.deepEqual(emptyBlocks(d), []);
  assert.equal(parseGiftData(draftToPayload(d).giftData, { token: TOKEN }).ok, true);
  d.photos = [];
  assert.deepEqual(emptyBlocks(d), ["photos"]);
  assert.equal(parseGiftData(draftToPayload(d).giftData, { token: TOKEN }).ok, false);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyDraft, draftFromSaved, draftToPayload, daysSince } from "../src/components/studio/draft.ts";
import { parseGiftData } from "../src/lib/validation/gift.ts";
import { DEFAULT_TEMPLATE } from "../src/components/gift-templates/template-config.ts";

const TOKEN = "KP-2010-ABC123";

test("an empty draft is not a valid card until a name and a letter are filled", () => {
  const r = parseGiftData(draftToPayload(emptyDraft()).giftData, { token: TOKEN });
  assert.equal(r.ok, false);
});

test("a filled draft becomes a valid card and survives a save/reload round trip", () => {
  const d = emptyDraft();
  d.template = "storybook-sunset";
  d.recipientName = "Lan";
  d.senderName = "An";
  d.addressing = "Anh - Em";
  d.letterContent = "Chúc mừng 20/10 & mãi bên nhau";
  d.photos = [{ url: "https://e.com/1.jpg", caption: "Ảnh 1", date: "20/10" }];
  d.highlights = [{ url: "https://e.com/cover.jpg", caption: "Bìa", date: "" }];
  d.finalMessage = "Mãi mãi";
  d.timeline = [{ date: "2024-02-14", title: "Gặp nhau", text: "Lần đầu" }];
  d.videoUrl = "https://youtu.be/abc";
  d.song = { source: "link", presetId: "", link: "https://open.spotify.com/track/x", title: "Bài", artist: "Ai đó" };

  const parsed = parseGiftData(draftToPayload(d).giftData, { token: TOKEN });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const back = draftFromSaved(parsed.value);
  assert.equal(back.template, "storybook-sunset");
  assert.equal(back.recipientName, "Lan");
  assert.equal(back.letterContent, "Chúc mừng 20/10 & mãi bên nhau");
  assert.equal(back.photos[0].caption, "Ảnh 1");
  assert.equal(back.highlights.length, 0); // highlight photos are no longer saved; T4 removes them from the draft
  assert.equal(back.timeline[0].title, "Gặp nhau");
  assert.equal(back.videoUrl, "https://youtu.be/abc");
  assert.equal(back.song.source, "link");
  assert.equal(back.song.title, "Bài");
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
});

test("daysSince counts whole days and rejects bad dates", () => {
  const today = new Date(2025, 9, 20); // 20 Oct 2025 (local)
  assert.equal(daysSince("2025-10-20", today), 0);
  assert.equal(daysSince("2025-10-10", today), 10);
  assert.equal(daysSince("2024-10-20", today), 365);
  assert.equal(daysSince("2025-10-25", today), -5);
  assert.equal(daysSince("nope", today), null);
});

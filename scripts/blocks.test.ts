import { test } from "node:test";
import assert from "node:assert/strict";
import { BLOCK_IDS, BLOCK_LABELS, DEFAULT_BLOCK_ORDER, deriveBlocks, isBlockId } from "../src/components/gift-templates/blocks.ts";

test("there are eight kinds of message, each with a label and a place in the default order", () => {
  assert.equal(BLOCK_IDS.length, 8);
  assert.deepEqual([...DEFAULT_BLOCK_ORDER].sort(), [...BLOCK_IDS].sort());
  for (const id of BLOCK_IDS) assert.ok(BLOCK_LABELS[id], id);
});

test("isBlockId only accepts the eight known ids", () => {
  for (const id of BLOCK_IDS) assert.equal(isBlockId(id), true);
  for (const bad of ["highlight", "", "Letter", null, undefined, 3, {}]) assert.equal(isBlockId(bad), false);
});

test("deriveBlocks returns nothing for missing or odd input", () => {
  for (const input of [null, undefined, "x", 4, [], {}]) assert.deepEqual(deriveBlocks(input), []);
});

test("deriveBlocks lists only the messages that have content, in the default order", () => {
  const card = {
    finalMessage: "Mãi mãi",
    timeline: [{ date: "2024-02-14", title: "Gặp nhau", text: "" }],
    anniversary: { date: "2024-02-14", label: "Ngày yêu" },
    voiceNote: { audioPath: "KP-2010-ABC123/voice-1760000000000.webm" },
    song: { source: "preset", presetId: "piano" },
    videoUrl: "https://youtu.be/abc",
    memoryPhotos: [{ url: "https://e.com/a.jpg" }],
    letterContent: "Chúc mừng",
  };
  assert.deepEqual(deriveBlocks(card), ["letter", "photos", "video", "music", "voice", "anniversary", "timeline", "finalMessage"]);
});

test("deriveBlocks ignores empty values, a song with no source and a recording with no file", () => {
  const card = {
    letterContent: "   ",
    memoryPhotos: [],
    videoUrl: "",
    song: { source: "none" },
    voiceNote: { noteText: "chỉ có chữ", duration: "00:00" },
    anniversary: { date: "", label: "x" },
    timeline: [],
    finalMessage: "",
  };
  assert.deepEqual(deriveBlocks(card), []);
});

test("deriveBlocks counts old highlight photos as photos", () => {
  assert.deepEqual(deriveBlocks({ momentPhotos: [{ url: "https://e.com/a.jpg", caption: "" }] }), ["photos"]);
});

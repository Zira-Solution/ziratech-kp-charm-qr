import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sniffAudio,
  sniffVideo,
  MAX_VOICE_BYTES,
  MAX_SONG_BYTES,
  MAX_VIDEO_BYTES,
  AUDIO_CONTENT_TYPES,
} from "../lib/validation/audio.ts";

const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(64).fill(0)]);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

test("recognises the audio formats browsers record in, from their first bytes", () => {
  assert.equal(sniffAudio(bytes(0x1a, 0x45, 0xdf, 0xa3)), "webm"); // Chrome / Firefox / Edge
  assert.equal(sniffAudio(bytes(...ascii("OggS"))), "ogg");
  assert.equal(sniffAudio(bytes(0, 0, 0, 0x20, ...ascii("ftypM4A "))), "m4a"); // Safari
  assert.equal(sniffAudio(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WAVE"))), "wav");
  assert.equal(sniffAudio(bytes(...ascii("ID3"), 3, 0)), "mp3");
  assert.equal(sniffAudio(bytes(0xff, 0xfb, 0x90, 0x00)), "mp3");
  assert.equal(sniffAudio(bytes(0, 0, 0, 0, ...ascii("ID3"), 3, 0)), "mp3"); // offset ID3
  assert.equal(sniffAudio(bytes(0, 0, 0xff, 0xfb, 0x90, 0x00)), "mp3"); // offset frame sync
});

test("rejects anything that only pretends to be audio", () => {
  assert.equal(sniffAudio(bytes(0x89, ...ascii("PNG"))), null); // image
  assert.equal(sniffAudio(bytes(...ascii("<html><script>"))), null); // markup
  assert.equal(sniffAudio(bytes(...ascii("MZ"))), null); // Windows executable
  assert.equal(sniffAudio(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("AVI "))), null); // RIFF but not WAVE
  assert.equal(sniffAudio(new Uint8Array([])), null);
  assert.equal(sniffAudio(new Uint8Array([0x1a, 0x45])), null); // too short
});

test("every recognised format has a content type and the size cap is 2 MB", () => {
  for (const ext of ["webm", "ogg", "m4a", "wav", "mp3"] as const) {
    assert.match(AUDIO_CONTENT_TYPES[ext], /^audio\//);
  }
  assert.equal(MAX_VOICE_BYTES, 2 * 1024 * 1024);
});

test("recognises video formats and checks video limits", () => {
  assert.equal(sniffVideo(bytes(0x1a, 0x45, 0xdf, 0xa3)), "webm");
  assert.equal(sniffVideo(bytes(0, 0, 0, 0x18, ...ascii("ftypisom"))), "mp4");
  assert.equal(sniffVideo(bytes(0, 0, 0, 0x18, ...ascii("ftypqt  "))), "mov");
  assert.equal(sniffVideo(bytes(0, 0, 0, 0x18, ...ascii("moov...."))), "mov");
  assert.equal(sniffVideo(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("AVI "))), null);
  assert.equal(sniffVideo(new Uint8Array([0, 1, 2])), null);
  assert.equal(MAX_SONG_BYTES, 10 * 1024 * 1024);
  assert.equal(MAX_VIDEO_BYTES, 25 * 1024 * 1024);
});


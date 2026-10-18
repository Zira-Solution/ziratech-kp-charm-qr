import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMp3Frames, sliceMp3, encodeWav, slicePcmChannels } from "../lib/media/audio-trim.ts";
import { sniffAudio } from "../lib/validation/audio.ts";

function createMockMp3(frameCount: number, includeId3 = false): Uint8Array {
  // MPEG-1 Layer 3, 128kbps, 44100Hz -> 417 bytes per frame
  const frameLen = 417;
  const id3Len = includeId3 ? 10 + 128 : 0;
  const total = id3Len + frameCount * frameLen;
  const buf = new Uint8Array(total);

  if (includeId3) {
    buf[0] = 0x49; // 'I'
    buf[1] = 0x44; // 'D'
    buf[2] = 0x33; // '3'
    buf[3] = 3;
    buf[4] = 0;
    buf[5] = 0;
    // 128 synchsafe: 0, 0, 1, 0
    buf[6] = 0;
    buf[7] = 0;
    buf[8] = 1;
    buf[9] = 0;
  }

  let offset = id3Len;
  for (let i = 0; i < frameCount; i++) {
    buf[offset] = 0xff;
    buf[offset + 1] = 0xfb; // MPEG 1 Layer III
    buf[offset + 2] = 0x90; // 128kbps, 44100Hz
    buf[offset + 3] = 0x00;
    // Fill dummy payload
    buf[offset + 4] = (i + 1) & 0xff;
    offset += frameLen;
  }

  return buf;
}

test("parses MP3 frames accurately with and without ID3 header", () => {
  const mp3NoId3 = createMockMp3(10, false);
  const frames1 = parseMp3Frames(mp3NoId3);
  assert.equal(frames1.length, 10);
  assert.equal(frames1[0].length, 417);
  assert.ok(Math.abs(frames1[0].duration - 1152 / 44100) < 0.0001);

  const mp3WithId3 = createMockMp3(5, true);
  const frames2 = parseMp3Frames(mp3WithId3);
  assert.equal(frames2.length, 5);
  assert.equal(frames2[0].offset, 10 + 128);
});

test("slices MP3 frames strictly within the requested time interval", () => {
  // 100 frames ≈ 2.61 seconds (each frame ~0.0261s)
  const mp3 = createMockMp3(100, false);
  const frameDuration = 1152 / 44100;

  // Slice from 1.0s to 1.5s
  const sliced = sliceMp3(mp3, 1.0, 1.5);
  assert.ok(sliced !== null);
  assert.equal(sniffAudio(sliced), "mp3");

  const slicedFrames = parseMp3Frames(sliced);
  assert.ok(slicedFrames.length > 0);
  // Expected frames: roughly (1.5 - 1.0) / 0.0261 ≈ 19-20 frames
  assert.ok(slicedFrames.length >= 18 && slicedFrames.length <= 22);
});

test("returns null when start/end times are invalid or no frames match", () => {
  const mp3 = createMockMp3(10, false);
  assert.equal(sliceMp3(mp3, 2.0, 1.0), null);
  assert.equal(sliceMp3(mp3, 100.0, 105.0), null);
  assert.equal(sliceMp3(new Uint8Array([1, 2, 3]), 0, 1), null);
});

test("encodes PCM channels to valid 16-bit WAV recognized by sniffAudio", () => {
  const sampleRate = 44100;
  const durationSec = 0.5;
  const numSamples = Math.floor(sampleRate * durationSec);
  const leftChannel = new Float32Array(numSamples);
  const rightChannel = new Float32Array(numSamples);

  // Generate a simple 440Hz sine wave
  for (let i = 0; i < numSamples; i++) {
    const val = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
    leftChannel[i] = val;
    rightChannel[i] = val;
  }

  const wavBytes = encodeWav([leftChannel, rightChannel], sampleRate);
  assert.equal(wavBytes.length, 44 + numSamples * 2 * 2);
  assert.equal(sniffAudio(wavBytes), "wav");
});

test("slices PCM channels correctly", () => {
  const channel = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
  const sliced = slicePcmChannels([channel], 1, 1.0, 4.0);
  assert.equal(sliced[0].length, 3);
  assert.ok(Math.abs(sliced[0][0] - 0.2) < 1e-6);
  assert.ok(Math.abs(sliced[0][1] - 0.3) < 1e-6);
  assert.ok(Math.abs(sliced[0][2] - 0.4) < 1e-6);
});

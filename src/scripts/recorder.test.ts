import { test } from "node:test";
import assert from "node:assert/strict";
import { pickRecorderMime, extensionForMime, formatClock, describeMicError, MAX_RECORD_SECONDS } from "../components/studio/recorder.ts";

test("pickRecorderMime takes the first format the browser supports", () => {
  assert.equal(pickRecorderMime(() => true), "audio/webm;codecs=opus"); // Chrome, Edge
  assert.equal(pickRecorderMime((t) => t === "audio/mp4"), "audio/mp4"); // Safari
  assert.equal(pickRecorderMime((t) => t.startsWith("audio/ogg")), "audio/ogg;codecs=opus"); // Firefox
  assert.equal(pickRecorderMime(() => false), null);
});

test("extensionForMime maps a recorded type to the upload extension", () => {
  assert.equal(extensionForMime("audio/webm;codecs=opus"), "webm");
  assert.equal(extensionForMime("audio/mp4"), "m4a");
  assert.equal(extensionForMime("audio/ogg;codecs=opus"), "ogg");
  assert.equal(extensionForMime(""), "webm");
});

test("formatClock", () => {
  assert.equal(formatClock(0), "00:00");
  assert.equal(formatClock(75), "01:15");
  assert.equal(formatClock(MAX_RECORD_SECONDS), "02:00");
  assert.equal(formatClock(-5), "00:00");
  assert.equal(formatClock(59.9), "00:59");
});

test("describeMicError explains the common failures", () => {
  assert.match(describeMicError({ name: "NotAllowedError" }), /cho phép/);
  assert.match(describeMicError({ name: "NotFoundError" }), /Không tìm thấy micro/);
  assert.match(describeMicError({ name: "NotReadableError" }), /ứng dụng khác/);
  assert.match(describeMicError(new Error("boom")), /Không bật được micro/);
  assert.match(describeMicError(undefined), /Không bật được micro/);
});

test("the recorder cap matches the server's voice limit", async () => {
  const { MAX_VOICE_SECONDS } = await import("../lib/validation/gift.ts");
  assert.equal(MAX_RECORD_SECONDS, MAX_VOICE_SECONDS);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { MUSIC_PRESETS } from "../components/gift-templates/music-presets.ts";
import { PRESET_VOICES } from "../components/gift-templates/audio-helper.ts";
import { parseSong } from "../lib/validation/gift.ts";

test("every preset the server accepts can actually be played, and vice versa", () => {
  const presetIds = MUSIC_PRESETS.map((p) => p.id).sort();
  assert.deepEqual(Object.keys(PRESET_VOICES).sort(), presetIds);
});

test("preset voices are sane (audible notes, gentle volume, steady tempo)", () => {
  for (const [id, v] of Object.entries(PRESET_VOICES)) {
    assert.ok(v.notes.length >= 6, `${id}: enough notes to loop`);
    for (const hz of v.notes) assert.ok(hz >= 80 && hz <= 2200, `${id}: ${hz}Hz in a comfortable range`);
    assert.ok(v.stepMs >= 250 && v.stepMs <= 900, `${id}: tempo`);
    assert.ok(v.volume > 0 && v.volume <= 0.12, `${id}: quiet enough to sit under the card`);
    assert.ok(v.decay > 0.5 && v.decay <= 3, `${id}: decay`);
  }
});

test("the server accepts every built-in preset and fills in its name", () => {
  for (const p of MUSIC_PRESETS) {
    const r = parseSong({ source: "preset", presetId: p.id });
    assert.equal(r.ok, true, p.id);
    if (r.ok) assert.equal(r.value.title, p.name);
  }
});

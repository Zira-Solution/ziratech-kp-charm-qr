// Built-in background melodies (synthesised in the browser with Web Audio, so there is no audio file
// to host and no copyright to clear). The notes live in audio-helper.ts; only ids and labels are here
// so the server can validate a chosen id.

export interface MusicPreset {
  id: string;
  name: string;
  mood: string;
}

export const MUSIC_PRESETS: MusicPreset[] = [
  { id: "lofi", name: "Lofi nhẹ nhàng", mood: "Thư giãn, ấm áp" },
  { id: "piano", name: "Piano mùa thu", mood: "Trầm lắng, hoài niệm" },
  { id: "musicbox", name: "Hộp nhạc", mood: "Ngọt ngào, trong trẻo" },
  { id: "guitar", name: "Guitar mộc", mood: "Mộc mạc, gần gũi" },
];

export const getMusicPreset = (id: unknown): MusicPreset | undefined =>
  MUSIC_PRESETS.find((p) => p.id === id);

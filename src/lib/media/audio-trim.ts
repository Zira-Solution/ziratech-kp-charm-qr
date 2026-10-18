/**
 * Pure audio trimming and format encoding utilities.
 * Supports lossless MP3 frame slicing and PCM-to-WAV conversion.
 * Framework-free and unit-tested directly with node:test.
 */

const MPEG1_L3_BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const MPEG2_L3_BITRATES = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];

const SAMPLE_RATES: Record<number, number[]> = {
  3: [44100, 48000, 32000], // MPEG 1
  2: [22050, 24000, 16000], // MPEG 2
  0: [11025, 12000, 8000],  // MPEG 2.5
};

export interface Mp3FrameInfo {
  offset: number;
  length: number;
  duration: number;
}

/**
 * Parses all valid MP3 Layer III frames from a Uint8Array.
 */
export function parseMp3Frames(bytes: Uint8Array): Mp3FrameInfo[] {
  const frames: Mp3FrameInfo[] = [];
  let offset = 0;

  // Check and skip ID3v2 header if present
  if (
    bytes.length >= 10 &&
    bytes[0] === 0x49 &&
    bytes[1] === 0x44 &&
    bytes[2] === 0x33 // "ID3"
  ) {
    const hasFooter = (bytes[5] & 0x10) !== 0;
    const tagSize =
      ((bytes[6] & 0x7f) << 21) |
      ((bytes[7] & 0x7f) << 14) |
      ((bytes[8] & 0x7f) << 7) |
      (bytes[9] & 0x7f);
    offset = 10 + tagSize + (hasFooter ? 10 : 0);
  }

  while (offset < bytes.length - 4) {
    // Search for frame sync: 11 bits set (0xFF then 0xE0..)
    if (bytes[offset] !== 0xff || (bytes[offset + 1] & 0xe0) !== 0xe0) {
      offset++;
      continue;
    }

    const b1 = bytes[offset + 1];
    const b2 = bytes[offset + 2];

    const versionId = (b1 >> 3) & 0x03; // 3: MPEG 1, 2: MPEG 2, 0: MPEG 2.5
    const layerId = (b1 >> 1) & 0x03;   // 1: Layer III

    if (versionId === 1 || layerId !== 1) {
      offset++;
      continue;
    }

    const bitrateIdx = (b2 >> 4) & 0x0f;
    const srIdx = (b2 >> 2) & 0x03;
    const padding = (b2 >> 1) & 0x01;

    if (bitrateIdx === 0 || bitrateIdx === 15 || srIdx === 3) {
      offset++;
      continue;
    }

    const bitrates = versionId === 3 ? MPEG1_L3_BITRATES : MPEG2_L3_BITRATES;
    const sampleRates = SAMPLE_RATES[versionId];
    if (!sampleRates) {
      offset++;
      continue;
    }

    const bitrate = bitrates[bitrateIdx];
    const sampleRate = sampleRates[srIdx];
    if (!bitrate || !sampleRate) {
      offset++;
      continue;
    }

    const isMpeg1 = versionId === 3;
    const factor = isMpeg1 ? 144 : 72;
    const samplesPerFrame = isMpeg1 ? 1152 : 576;
    const frameLength = Math.floor((factor * bitrate * 1000) / sampleRate) + padding;

    if (frameLength <= 4 || offset + frameLength > bytes.length) {
      offset++;
      continue;
    }

    const duration = samplesPerFrame / sampleRate;
    frames.push({
      offset,
      length: frameLength,
      duration,
    });

    offset += frameLength;
  }

  return frames;
}

/**
 * Losslessly slices an MP3 file between startSec and endSec.
 * Returns a new Uint8Array containing only the selected frames, or null if cannot slice.
 */
export function sliceMp3(bytes: Uint8Array, startSec: number, endSec: number): Uint8Array | null {
  if (startSec < 0) startSec = 0;
  if (endSec <= startSec) return null;

  const frames = parseMp3Frames(bytes);
  if (frames.length === 0) return null;

  let currentTime = 0;
  const selectedFrames: Mp3FrameInfo[] = [];

  for (const f of frames) {
    const frameStart = currentTime;
    const frameEnd = currentTime + f.duration;

    // Frame overlaps with [startSec, endSec]
    if (frameEnd > startSec && frameStart < endSec) {
      selectedFrames.push(f);
    }

    currentTime = frameEnd;
    if (currentTime > endSec + 0.1) break;
  }

  if (selectedFrames.length === 0) return null;

  const totalBytes = selectedFrames.reduce((sum, f) => sum + f.length, 0);
  const result = new Uint8Array(totalBytes);
  let writeOffset = 0;

  for (const f of selectedFrames) {
    result.set(bytes.subarray(f.offset, f.offset + f.length), writeOffset);
    writeOffset += f.length;
  }

  return result;
}

/**
 * Slices raw audio channels between startSec and endSec.
 */
export function slicePcmChannels(
  channels: Float32Array[],
  sampleRate: number,
  startSec: number,
  endSec: number
): Float32Array[] {
  if (channels.length === 0) return [];
  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = Math.min(channels[0].length, Math.floor(endSec * sampleRate));

  if (endSample <= startSample) return [];

  return channels.map((c) => c.slice(startSample, endSample));
}

/**
 * Encodes PCM float samples into standard 16-bit PCM RIFF WAV format.
 */
export function encodeWav(channels: Float32Array[], sampleRate: number): Uint8Array {
  const numChannels = channels.length;
  if (numChannels === 0) return new Uint8Array(44);

  const numSamples = channels[0].length;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const totalSize = 44 + dataSize;

  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  // "RIFF" chunk descriptor
  buffer[0] = 0x52; // 'R'
  buffer[1] = 0x49; // 'I'
  buffer[2] = 0x46; // 'F'
  buffer[3] = 0x46; // 'F'
  view.setUint32(4, 36 + dataSize, true);
  buffer[8] = 0x57; // 'W'
  buffer[9] = 0x41; // 'A'
  buffer[10] = 0x56; // 'V'
  buffer[11] = 0x45; // 'E'

  // "fmt " sub-chunk
  buffer[12] = 0x66; // 'f'
  buffer[13] = 0x6d; // 'm'
  buffer[14] = 0x74; // 't'
  buffer[15] = 0x20; // ' '
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true);  // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample = 16

  // "data" sub-chunk
  buffer[36] = 0x64; // 'd'
  buffer[37] = 0x61; // 'a'
  buffer[38] = 0x74; // 't'
  buffer[39] = 0x61; // 'a'
  view.setUint32(40, dataSize, true);

  // Interleave and write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, Math.floor(intSample), true);
      offset += 2;
    }
  }

  return buffer;
}

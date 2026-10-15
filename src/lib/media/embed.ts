/**
 * Turns a link the buyer pasted into the address a page may put in an <iframe>.
 *
 * The embed address is built from the id taken out of the link, never from the link itself, so a pasted
 * link cannot smuggle its own host, path or query into the frame. Anything that is not https, carries
 * credentials, comes from another site or has no usable id gives `null`; the caller then shows a plain
 * "open the link" button instead.
 *
 * Pure functions (no framework imports), tested by `npm test`.
 *
 * Sources for the address shapes:
 *  - YouTube embed      https://developers.google.com/youtube/player_parameters  (…/embed/VIDEO_ID, playlists via listType=playlist&list=)
 *  - YouTube privacy    https://support.google.com/youtube/answer/171780          (youtube-nocookie.com domain)
 *  - Vimeo player       https://help.vimeo.com/hc/en-us/articles/12426260232977-About-Player-parameters  (player.vimeo.com/video/ID)
 *  - Spotify embed      https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed   (open.spotify.com/embed/<type>/<id>)
 *  - SoundCloud widget  https://developers.soundcloud.com/docs/api/html5-widget  (w.soundcloud.com/player/?url=…)
 *
 * Not confirmed by those pages, so treat as unverified and keep the "open the link" fallback:
 *  - Google Drive `/file/d/ID/preview` (only third-party guides describe it)
 *  - Vimeo private-video hashes (dropped: only the id is used)
 *  - Spotify types other than `track`, and the iframe heights (inferred from the track example)
 *  - SoundCloud accepting a public page link as `url` (the official example uses an api.soundcloud.com link)
 */

export interface MusicEmbed {
  src: string;
  /** Suggested iframe height in pixels. */
  height: number;
}

const hostIs = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

function parse(link: unknown): URL | null {
  if (typeof link !== "string") return null;
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  return url;
}

const segments = (url: URL) => url.pathname.split("/").filter(Boolean);

// ---------------------------------------------------------------- YouTube
const NOCOOKIE = "https://www.youtube-nocookie.com/embed";
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_LIST = /^[A-Za-z0-9_-]{10,64}$/;

function youtube(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  const [first, second] = segments(url);
  let id = "";

  if (host === "youtu.be") {
    id = first ?? "";
  } else if (hostIs(host, "youtube.com")) {
    if (url.pathname === "/watch") id = url.searchParams.get("v") ?? "";
    else if (first === "shorts" || first === "embed" || first === "live") id = second ?? "";
    else if (first === "playlist") {
      const list = url.searchParams.get("list") ?? "";
      return YOUTUBE_LIST.test(list) ? `${NOCOOKIE}?listType=playlist&list=${list}` : null;
    }
  } else {
    return null;
  }
  return YOUTUBE_ID.test(id) ? `${NOCOOKIE}/${id}` : null;
}

// ---------------------------------------------------------------- Vimeo
const VIMEO_ID = /^\d{4,12}$/;

function vimeo(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (!hostIs(host, "vimeo.com")) return null;
  const id = segments(url).find((s) => VIMEO_ID.test(s));
  return id ? `https://player.vimeo.com/video/${id}` : null;
}

// ---------------------------------------------------------------- Google Drive
const DRIVE_ID = /^[A-Za-z0-9_-]{10,100}$/;

function drive(url: URL): string | null {
  if (url.hostname.toLowerCase() !== "drive.google.com") return null;
  const [first, second, id] = segments(url);
  const fileId = first === "file" && second === "d" ? id : first === "open" ? url.searchParams.get("id") : null;
  return fileId && DRIVE_ID.test(fileId) ? `https://drive.google.com/file/d/${fileId}/preview` : null;
}

/** An address for a video link (YouTube, Vimeo, Google Drive), or null when it cannot be embedded. */
export function toVideoEmbed(link: unknown): string | null {
  const url = parse(link);
  if (!url) return null;
  return youtube(url) ?? vimeo(url) ?? drive(url);
}

// ---------------------------------------------------------------- music
const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;
const SPOTIFY_TYPES = ["track", "album", "playlist", "episode", "show", "artist"];
const SPOTIFY_COMPACT = ["track", "episode"];

function spotify(url: URL): MusicEmbed | null {
  if (url.hostname.toLowerCase() !== "open.spotify.com") return null;
  const parts = segments(url);
  if (parts[0]?.startsWith("intl-")) parts.shift(); // locale prefix, e.g. /intl-vi/track/…
  const [type, id] = parts;
  if (!SPOTIFY_TYPES.includes(type) || !SPOTIFY_ID.test(id ?? "")) return null;
  return { src: `https://open.spotify.com/embed/${type}/${id}`, height: SPOTIFY_COMPACT.includes(type) ? 152 : 352 };
}

const SOUNDCLOUD_PART = /^[A-Za-z0-9_.~%-]+$/;

function soundcloud(url: URL): MusicEmbed | null {
  const host = url.hostname.toLowerCase();
  if (host !== "soundcloud.com" && host !== "www.soundcloud.com") return null;
  const parts = segments(url);
  if (parts.length < 2 || !parts.every((p) => SOUNDCLOUD_PART.test(p))) return null; // an artist page is not a track

  const widget = new URL("https://w.soundcloud.com/player/");
  widget.searchParams.set("url", `https://soundcloud.com/${parts.join("/")}`);
  for (const key of ["auto_play", "buying", "sharing", "download"]) widget.searchParams.set(key, "false");
  return { src: widget.toString(), height: 166 };
}

/** An address for a music link (YouTube, Spotify, SoundCloud), or null when it cannot be embedded. */
export function toMusicEmbed(link: unknown): MusicEmbed | null {
  const url = parse(link);
  if (!url) return null;

  const video = youtube(url);
  if (video) return { src: video, height: 220 };
  return spotify(url) ?? soundcloud(url);
}

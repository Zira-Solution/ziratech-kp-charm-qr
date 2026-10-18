import type { ViewerGift } from "./normalize";
import {
  parseAddressing,
  formatSalutation,
  getDefaultLetterContent,
  getDefaultLetterSubtitle,
  getDefaultVoiceNote,
  getDefaultFinalMessage,
} from "./addressing";

/**
 * Compresses and inlines an image to a Base64 data URL via Canvas.
 * Keeps file size lightweight (~100KB per image) while preserving HD crispness.
 */
async function fetchImageAsDataUrl(url: string, maxWidth = 1280, quality = 0.82): Promise<string> {
  if (url.startsWith("data:")) return url;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load ${url}`));
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    if (w > maxWidth) {
      h = Math.round((h * maxWidth) / w);
      w = maxWidth;
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return url;
    ctx.drawImage(img, 0, 0, w, h);

    const isPng = url.toLowerCase().endsWith(".png") && !url.includes("sunset_couple") && !url.includes("bg");
    return canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality);
  } catch (err) {
    console.warn("Could not inline image into HTML keepsake:", url, err);
    // If running in browser with relative URL, convert to absolute URL so it works when opened
    if (typeof window !== "undefined" && url.startsWith("/")) {
      return `${window.location.origin}${url}`;
    }
    return url;
  }
}

/**
 * Packages the entire 7-slide Keepsake Storybook into a single, self-contained HTML file.
 * The recipient can open it offline on any device (iOS, Android, PC, Mac) without needing internet or server.
 */
export async function exportHtmlKeepsake(gift: ViewerGift): Promise<string> {
  const pronouns = parseAddressing(gift.addressing);
  const recipient = gift.recipientName || pronouns.Recipient;
  const sender = gift.sender || "";
  const finalMsg = gift.finalMessage || getDefaultFinalMessage(pronouns);

  // Pre-inline key template graphics
  const [
    bgUrl,
    sunsetCoupleUrl,
    giftBoxUrl,
    envelopeUrl,
    binderClipUrl,
    stampUrl,
    heartUrl,
    heart2Url,
    penUrl,
    musicNotesUrl,
  ] = await Promise.all([
    fetchImageAsDataUrl("/thamkhao/bg.jpg", 1440, 0.85),
    fetchImageAsDataUrl("/thamkhao/sunset_couple_clean.jpg", 1440, 0.85),
    fetchImageAsDataUrl("/thamkhao/gift_box.png", 640),
    fetchImageAsDataUrl("/thamkhao/envelope.png", 800),
    fetchImageAsDataUrl("/thamkhao/binder_clip.png", 200),
    fetchImageAsDataUrl("/thamkhao/element_page_2.png", 320),
    fetchImageAsDataUrl("/thamkhao/heart.png", 160),
    fetchImageAsDataUrl("/thamkhao/heart_2.png", 160),
    fetchImageAsDataUrl("/thamkhao/pen.png", 300),
    fetchImageAsDataUrl("/thamkhao/music_notes.png", 160),
  ]);

  // Inline album photos
  const inlinedPhotos = await Promise.all(
    (gift.photos || []).map(async (p) => ({
      ...p,
      url: await fetchImageAsDataUrl(p.url, 1080, 0.85),
    }))
  );

  const letterTitle = gift.letter?.title || "LỜI NHẮN";
  const letterSubtitle = gift.letter?.subtitle || getDefaultLetterSubtitle(pronouns);
  const letterContent = gift.letter?.content || getDefaultLetterContent(pronouns);
  const letterSig = gift.letter?.signature || sender;
  const salutationText = formatSalutation(gift.recipientName, pronouns.recipient);

  const videoUrl = gift.video || "https://youtu.be/dQw4w9WgXcQ";
  const songTitle = gift.song?.title || "Giai điệu kỷ niệm";
  const songArtist = gift.song?.artist || "K&P Melody";
  const voiceDuration = gift.voice?.duration || "02:34";
  const voiceNote = gift.voice?.noteText || getDefaultVoiceNote(pronouns);

  const photosJson = JSON.stringify(inlinedPhotos);

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Thiệp Kỷ Niệm 20/10 — ${recipient}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #12100e;
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #2e1d1b;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .font-handwriting { font-family: 'Dancing Script', cursive; }
    .font-serif { font-family: 'Playfair Display', Georgia, serif; }

    /* Main viewport container */
    #app {
      position: relative;
      width: 100%;
      height: 100%;
      max-width: 480px;
      margin: 0 auto;
      overflow: hidden;
      background-color: #fdebd8;
      box-shadow: 0 0 50px rgba(0,0,0,0.5);
    }
    @media (min-width: 768px) {
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at center, #2b1f1d 0%, #110d0c 100%);
      }
      #app {
        height: min(94vh, 920px);
        max-width: 440px;
        border-radius: 40px;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 12px #261b19;
      }
    }

    /* Slides container & transitions */
    .slides-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      touch-action: pan-y;
    }
    .slide {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      opacity: 0;
      pointer-events: none;
      transform: translateX(100%);
      transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
      background-size: cover;
      background-position: center;
      padding: 16px 16px 28px 16px;
    }
    .slide.active {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
      z-index: 2;
    }
    .slide.prev {
      opacity: 0;
      pointer-events: none;
      transform: translateX(-100%);
    }

    /* Glass Top Bar */
    .top-bar {
      position: absolute;
      top: 14px;
      left: 14px;
      right: 14px;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
    }
    .glass-btn {
      pointer-events: auto;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.85);
      box-shadow: 0 4px 16px rgba(44, 24, 16, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #1c3f50;
      transition: transform 0.15s ease, background-color 0.2s ease;
    }
    .glass-btn:active { transform: scale(0.92); }
    .glass-pill {
      pointer-events: auto;
      padding: 5px 14px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.85);
      font-size: 11px;
      font-weight: 700;
      color: #1c3f50;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 16px rgba(44, 24, 16, 0.12);
    }

    /* Chapter Menu Modal */
    #menu-modal {
      position: absolute;
      inset: 0;
      background: rgba(18, 12, 10, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 50;
      display: none;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 16px;
    }
    #menu-modal.open { display: flex; }
    .menu-card {
      width: 100%;
      max-width: 300px;
      background: rgba(255, 254, 250, 0.96);
      border-radius: 24px;
      padding: 16px;
      border: 1px solid rgba(235, 220, 205, 0.9);
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
      animation: menuIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes menuIn {
      from { opacity: 0; transform: translateY(-10px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      color: #2e1d1b;
      cursor: pointer;
      margin-bottom: 4px;
      transition: background-color 0.15s ease;
    }
    .menu-item:hover, .menu-item.active {
      background-color: #c13d28;
      color: #fff;
    }

    /* Bottom Nav Bar */
    .bottom-nav {
      position: absolute;
      bottom: 12px;
      left: 16px;
      right: 16px;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
    }
    .nav-btn {
      pointer-events: auto;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.95);
      box-shadow: 0 4px 16px rgba(44, 24, 16, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #1c3f50;
      transition: transform 0.15s ease;
    }
    .nav-btn:active { transform: scale(0.9); }
    .dots-row {
      display: flex;
      align-items: center;
      gap: 6px;
      pointer-events: auto;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 9999px;
      background: rgba(44, 24, 16, 0.25);
      transition: all 0.25s ease;
      cursor: pointer;
    }
    .dot.active {
      width: 22px;
      background: #c13d28;
    }

    /* Slide 1: Gift Box */
    .gift-box-img {
      width: 200px;
      height: auto;
      margin: 0 auto;
      filter: drop-shadow(0 16px 24px rgba(44, 24, 16, 0.2));
      animation: floatBox 3.5s ease-in-out infinite alternate;
    }
    @keyframes floatBox {
      0% { transform: translateY(0px) rotate(0deg); }
      100% { transform: translateY(-10px) rotate(1.5deg); }
    }
    .btn-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 13px 32px;
      border-radius: 9999px;
      background: #c13d28;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 10px 24px rgba(193, 61, 40, 0.35);
      cursor: pointer;
      transition: transform 0.15s ease, background-color 0.2s ease;
    }
    .btn-cta:active { transform: scale(0.96); }

    /* Slide 2: Lined Paper */
    .lined-paper {
      position: relative;
      background: #fffefb;
      border: 1px solid #ebdccd;
      border-radius: 18px;
      padding: 24px 18px 18px 18px;
      box-shadow: 0 14px 32px rgba(44, 24, 16, 0.14);
      max-height: 52vh;
      overflow-y: auto;
      background-image: repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, #ebdccd 31px, #ebdccd 32px);
      line-height: 32px;
    }

    /* Slide 3: Photo Stack */
    .photo-frame {
      background: #fff;
      padding: 10px 10px 32px 10px;
      border-radius: 12px;
      box-shadow: 0 12px 30px rgba(44, 24, 16, 0.2);
      transform: rotate(-1.5deg);
      max-width: 320px;
      margin: 0 auto;
      cursor: pointer;
    }
    .photo-img {
      width: 100%;
      height: 240px;
      object-fit: cover;
      border-radius: 8px;
    }

    /* Slide 4: Video Lightbox Modal */
    #video-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(12px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    #video-modal.open { display: flex; }
    .video-wrapper {
      position: relative;
      width: 100%;
      max-width: 440px;
      background: #000;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .video-aspect-16-9 { aspect-ratio: 16 / 9; }
    .video-aspect-1-1 { aspect-ratio: 1 / 1; }
    .video-aspect-9-16 { aspect-ratio: 9 / 16; }

    /* Slide 5: Cassette Player */
    .cassette-box {
      background: #2b1d19;
      border-radius: 22px;
      padding: 18px;
      box-shadow: 0 18px 36px rgba(0,0,0,0.3);
      border: 2px solid #5a3d35;
      color: #fff;
      max-width: 340px;
      margin: 0 auto;
      width: 100%;
    }
    .reel {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 4px dashed rgba(255,255,255,0.7);
      margin: 0 auto;
    }
    .reel.spinning {
      animation: spinReel 2.5s linear infinite;
    }
    @keyframes spinReel {
      100% { transform: rotate(360deg); }
    }

    /* Slide 6: Voice Message */
    .voice-card {
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(235, 220, 205, 0.9);
      border-radius: 22px;
      padding: 20px;
      box-shadow: 0 14px 32px rgba(44, 24, 16, 0.12);
      max-width: 340px;
      margin: 0 auto;
      width: 100%;
    }
    .bar {
      width: 4px;
      border-radius: 2px;
      background: #c13d28;
      transition: height 0.2s ease;
    }

    /* Confetti Canvas */
    #confetti-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 60;
    }
  </style>
</head>
<body>
  <div id="app">
    <canvas id="confetti-canvas"></canvas>

    <!-- Top Bar Controls -->
    <header class="top-bar">
      <!-- Music toggle -->
      <button type="button" class="glass-btn" id="music-toggle-btn" title="Bật/Tắt nhạc nền">
        <svg id="music-icon-on" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
        <svg id="music-icon-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      </button>

      <!-- Chapter dropdown menu button -->
      <button type="button" class="glass-btn" id="menu-btn" title="Danh mục các trang">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </header>

    <!-- Chapter Menu Modal -->
    <div id="menu-modal">
      <div class="menu-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 class="font-serif" style="font-size: 16px; font-weight: 700; color: #1c3f50;">Chương thiệp</h3>
          <button type="button" id="close-menu-btn" style="background:none; border:none; cursor:pointer; color:#785d56;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div id="menu-items-list"></div>
      </div>
    </div>

    <!-- Slides Wrapper -->
    <div class="slides-wrapper" id="slides-wrapper">
      <!-- SLIDE 1: Hộp quà bí mật -->
      <div class="slide active" id="slide-1" style="background-image: url('${bgUrl}');">
        <div style="text-align: center; margin-top: 48px;">
          <p class="font-serif" style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #8c4b3e; text-transform: uppercase;">
            MÓN QUÀ 20/10
          </p>
          <h1 class="font-handwriting" style="font-size: 40px; font-weight: 700; color: #1c3f50; margin-top: 4px;">
            Dành tặng ${recipient}
          </h1>
        </div>

        <div style="text-align: center; margin: auto 0;">
          <img src="${giftBoxUrl}" alt="Hộp quà" class="gift-box-img">
        </div>

        <div style="text-align: center; margin-bottom: 40px;">
          <button type="button" class="btn-cta" onclick="openGift()">
            <span>Chạm để mở quà</span>
            <span>✨</span>
          </button>
        </div>
      </div>

      <!-- SLIDE 2: Bức thư tay -->
      <div class="slide" id="slide-2" style="background-image: url('${bgUrl}');">
        <div style="text-align: center; margin-top: 46px;">
          <h2 class="font-serif" style="font-size: 26px; font-weight: 800; color: #1c3f50; letter-spacing: 1px;">
            ${letterTitle}
          </h2>
          <p class="font-handwriting" style="font-size: 20px; font-style: italic; color: #8c4b3e; font-weight: 700; margin-top: 2px;">
            ${letterSubtitle}
          </p>
        </div>

        <div style="position: relative; width: 100%; max-width: 360px; margin: auto auto;">
          <!-- Vintage stamp -->
          <img src="${stampUrl}" alt="Stamp" style="position: absolute; -top: 24px; right: 4px; width: 50px; z-index: 2; transform: rotate(6deg);">
          <!-- Kraft envelope back -->
          <img src="${envelopeUrl}" alt="Envelope" style="position: absolute; -top: 10px; left: -10px; width: 106%; opacity: 0.85; z-index: 1;">

          <!-- Ruled note paper -->
          <div class="lined-paper" style="position: relative; z-index: 5;">
            <!-- Binder clip -->
            <div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); width: 32px; z-index: 10;">
              <img src="${binderClipUrl}" alt="Clip" style="width: 100%;">
            </div>

            <div class="font-handwriting" style="font-size: 20px; font-weight: 700; color: #1c3f50;" id="letter-salutation">
              ${salutationText}
            </div>
            <p class="font-handwriting" style="font-size: 17px; color: #2e1d1b; white-space: pre-line; margin-top: 4px;" id="letter-body">
              ${letterContent}
            </p>
            ${
              letterSig
                ? `<div style="text-align: right; margin-top: 8px;">
                     <span class="font-handwriting" style="font-size: 18px; font-weight: 700; color: #c13d28;">— ${letterSig}</span>
                   </div>`
                : ""
            }

            <div style="text-align: center; margin-top: 12px;">
              <img src="${heartUrl}" alt="Heart" style="width: 24px; height: 24px; object-fit: contain;">
            </div>
          </div>

          <!-- Fountain pen decoration -->
          <img src="${penUrl}" alt="Pen" style="position: absolute; -bottom: 24px; -right: 8px; width: 50px; z-index: 10; transform: rotate(14deg); filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));">
        </div>

        <div style="height: 38px;"></div>
      </div>

      <!-- SLIDE 3: Album ảnh kỷ niệm -->
      <div class="slide" id="slide-3" style="background-image: url('${bgUrl}');">
        <div style="text-align: center; margin-top: 46px;">
          <h2 class="font-serif" style="font-size: 26px; font-weight: 800; color: #1c3f50;">
            NHỮNG NGÀY NHƯ THẾ
          </h2>
          <p class="font-handwriting" style="font-size: 20px; font-style: italic; color: #8c4b3e; font-weight: 700;">
            Kỷ niệm đã qua...
          </p>
        </div>

        <div style="margin: auto 0; text-align: center;">
          <div class="photo-frame" onclick="openPhotoZoom()">
            <img id="album-photo-img" src="" alt="Album photo" class="photo-img">
            <p class="font-handwriting" id="album-photo-caption" style="font-size: 19px; color: #2e1d1b; font-weight: 700; margin-top: 10px;"></p>
            <p style="font-size: 11px; color: #8c7b73; margin-top: 2px;" id="album-photo-date"></p>
          </div>

          <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px;">
            <button type="button" class="glass-btn" onclick="prevPhoto()" title="Ảnh trước">‹</button>
            <span id="photo-counter" style="font-size: 12px; font-weight: 700; color: #785d56;">1 / 1</span>
            <button type="button" class="glass-btn" onclick="nextPhoto()" title="Ảnh sau">›</button>
          </div>
        </div>

        <div style="height: 38px;"></div>
      </div>

      <!-- SLIDE 4: Video dành cho bạn -->
      <div class="slide" id="slide-4" style="background-image: url('${bgUrl}');">
        <div style="text-align: center; margin-top: 46px;">
          <h2 class="font-serif" style="font-size: 26px; font-weight: 800; color: #1c3f50;">
            THƯỚC PHIM KỶ NIỆM
          </h2>
          <p class="font-handwriting" style="font-size: 20px; font-style: italic; color: #8c4b3e; font-weight: 700;">
            Bất ngờ dành cho bạn...
          </p>
        </div>

        <div style="margin: auto 0; text-align: center;">
          <img src="${giftBoxUrl}" alt="Gift box" class="gift-box-img" style="width: 170px;">
          <p style="font-size: 13px; color: #785d56; margin-top: 12px; font-weight: 600;">
            Có một thước phim nhỏ được gói kín tại đây
          </p>
          <div style="margin-top: 16px;">
            <button type="button" class="btn-cta" onclick="openVideoModal()">
              <span>Chạm để xem video</span>
              <span>🎬</span>
            </button>
          </div>
        </div>

        <div style="height: 38px;"></div>
      </div>

      <!-- SLIDE 5: Băng cassette âm nhạc -->
      <div class="slide" id="slide-5" style="background-image: url('${bgUrl}');">
        <div style="text-align: center; margin-top: 46px;">
          <h2 class="font-serif" style="font-size: 26px; font-weight: 800; color: #1c3f50;">
            GIAI ĐIỆU KỶ NIỆM
          </h2>
          <p class="font-handwriting" style="font-size: 20px; font-style: italic; color: #8c4b3e; font-weight: 700;">
            Khúc nhạc dành riêng ${pronouns.recipient}...
          </p>
        </div>

        <div style="margin: auto 0;">
          <div class="cassette-box">
            <div style="background: #1a1210; border-radius: 12px; padding: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-around;">
              <div class="reel" id="cassette-reel-left"></div>
              <div style="text-align: center;">
                <p style="font-size: 10px; color: #e5989b; font-weight: 700; letter-spacing: 1px;">K&P CASSETTE</p>
                <p style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 2px;">${songTitle}</p>
                <p style="font-size: 10px; color: #aaa;">${songArtist}</p>
              </div>
              <div class="reel" id="cassette-reel-right"></div>
            </div>

            <!-- Progress bar -->
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
              <div id="cassette-progress-bar" style="width: 0%; height: 100%; background: #c13d28; transition: width 0.3s;"></div>
            </div>

            <!-- Play / Pause CTA -->
            <div style="text-align: center;">
              <button type="button" class="btn-cta" id="cassette-play-btn" onclick="toggleCassettePlay()" style="padding: 10px 24px; font-size: 13px;">
                <span id="cassette-btn-label">Phát nhạc kỷ niệm</span>
                <span>🎵</span>
              </button>
            </div>
          </div>
        </div>

        <div style="height: 38px;"></div>
      </div>

      <!-- SLIDE 6: Lời nhắn giọng nói -->
      <div class="slide" id="slide-6" style="background-image: url('${bgUrl}');">
        <div style="text-align: center; margin-top: 46px;">
          <h2 class="font-serif" style="font-size: 26px; font-weight: 800; color: #1c3f50;">
            GIỌNG NÓI CỦA ${pronouns.senderUpper}
          </h2>
          <p class="font-handwriting" style="font-size: 20px; font-style: italic; color: #8c4b3e; font-weight: 700;">
            Lắng nghe tâm sự...
          </p>
        </div>

        <div style="margin: auto 0;">
          <div class="voice-card">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: #ebdccd; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                🎙️
              </div>
              <div style="flex: 1;">
                <p style="font-weight: 700; font-size: 14px; color: #1c3f50;">Lời nhắn âm thanh</p>
                <p style="font-size: 11px; color: #8c7b73;" id="voice-timer">00:00 / ${voiceDuration}</p>
              </div>
              <button type="button" class="glass-btn" id="voice-play-btn" onclick="toggleVoicePlay()">
                ▶
              </button>
            </div>

            <!-- Equalizer wave bars -->
            <div style="display: flex; align-items: center; justify-content: space-between; height: 32px; margin-bottom: 14px;" id="waveform-container"></div>

            <p class="font-handwriting" style="font-size: 17px; color: #2e1d1b; font-weight: 600; line-height: 1.4; border-top: 1px dashed #ebdccd; padding-top: 12px;">
              "${voiceNote}"
            </p>
          </div>
        </div>

        <div style="height: 38px;"></div>
      </div>

      <!-- SLIDE 7: Lời cảm ơn & Khép lại -->
      <div class="slide" id="slide-7" style="background-image: url('${sunsetCoupleUrl}'); background-position: center 42%;">
        <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, transparent 40%, rgba(28,14,10,0.45) 100%); pointer-events: none;"></div>

        <div style="position: relative; z-index: 10; text-align: center; margin-top: 48px;">
          <div style="display: inline-flex; align-items: center; gap: 6px;">
            <h2 class="font-handwriting" style="font-size: 38px; font-weight: 700; color: #1c3f50; text-shadow: 0 1px 2px rgba(255,255,255,0.8);">
              Cảm ơn ${pronouns.Recipient}
            </h2>
            <span style="font-size: 28px;">❤️</span>
          </div>
          <p class="font-handwriting" style="font-size: 18px; font-weight: 700; color: #3d2417; text-shadow: 0 1px 1px rgba(255,255,255,0.8);">
            đã đi qua những ngày này cùng ${pronouns.sender}.
          </p>

          <!-- Keepsake message note -->
          <div style="margin: 12px auto 0 auto; max-width: 300px; padding: 12px 16px; border-radius: 16px; background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.9); box-shadow: 0 8px 24px rgba(44,24,16,0.1);">
            <p class="font-handwriting" style="font-size: 16px; font-weight: 600; color: #2e1d1b; line-height: 1.4; white-space: pre-line;">
              ${finalMsg}
            </p>
            ${
              sender
                ? `<p class="font-handwriting" style="font-size: 15px; font-weight: 700; color: #c13d28; margin-top: 4px;">— ${sender}</p>`
                : ""
            }
          </div>
        </div>

        <div style="position: relative; z-index: 10; text-align: center; margin-bottom: 44px;">
          <button type="button" class="btn-cta" onclick="replayFromStart()" style="background: #1c3f50; box-shadow: 0 8px 20px rgba(28,63,80,0.35);">
            <span>Xem lại từ đầu</span>
            <span>↺</span>
          </button>
          <p style="font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.9); letter-spacing: 1px; margin-top: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
            TEAM K&P • VÒNG TAY CHARM & THIỆP QUÀ SỐ 20/10
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Bar -->
    <div class="bottom-nav">
      <button type="button" class="nav-btn" onclick="prevSlide()" title="Trang trước">‹</button>
      <div class="dots-row" id="dots-container"></div>
      <button type="button" class="nav-btn" onclick="nextSlide()" title="Trang sau">›</button>
    </div>

    <!-- Video Lightbox Modal -->
    <div id="video-modal">
      <div class="video-wrapper video-aspect-16-9" id="video-wrapper">
        <button type="button" onclick="closeVideoModal()" style="position: absolute; top: 10px; right: 10px; z-index: 20; width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ✕
        </button>
        <div id="video-player-container" style="width: 100%; height: 100%;"></div>
      </div>
    </div>
  </div>

  <script>
    // --- Data & State ---
    const TOTAL_SLIDES = 7;
    let currentSlide = 1;
    const photos = ${photosJson};
    let currentPhotoIndex = 0;

    const CHAPTERS = [
      { id: 1, title: "Mở món quà", label: "Có một món quà" },
      { id: 2, title: "Bức thư tay", label: "Lời nhắn gửi " + pronouns.recipient },
      { id: 3, title: "Những ngày như thế", label: "Album kỷ niệm" },
      { id: 4, title: "Video dành cho " + pronouns.recipient, label: "Thước phim kỷ niệm" },
      { id: 5, title: "Giai điệu kỷ niệm", label: "Băng cassette âm nhạc" },
      { id: 6, title: "Giọng nói của " + pronouns.sender, label: "Lời nhắn giọng nói" },
      { id: 7, title: "Lời cảm ơn", label: "Lưu giữ kỷ niệm" },
    ];

    // --- Lightweight Canvas Confetti ---
    function fireConfetti() {
      const canvas = document.getElementById("confetti-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const app = document.getElementById("app");
      canvas.width = app.clientWidth;
      canvas.height = app.clientHeight;

      const particles = [];
      const colors = ["#c13d28", "#f4a261", "#e76f51", "#2a9d8f", "#e9c46a", "#ffffff"];
      for (let i = 0; i < 70; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height * 0.55,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.7) * 12,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 4,
          life: 1,
        });
      }

      function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35; // gravity
          p.life -= 0.015;
          if (p.life > 0) {
            alive = true;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        if (alive) requestAnimationFrame(update);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(update);
    }

    // --- Web Audio Synthesizer (Works 100% offline, no audio files needed) ---
    class WebAudioSynth {
      constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.timer = null;
        this.noteIndex = 0;
        this.notes = [220.0, 261.63, 329.63, 392.0, 349.23, 261.63, 329.63, 440.0, 196.0, 246.94, 329.63, 392.0];
      }
      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
      }
      play() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.schedule();
        updateMusicUi(true);
      }
      stop() {
        this.isPlaying = false;
        if (this.timer) clearTimeout(this.timer);
        updateMusicUi(false);
      }
      schedule() {
        if (!this.isPlaying || !this.ctx) return;
        const freq = this.notes[this.noteIndex % this.notes.length];
        this.noteIndex++;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 1.45);
        this.timer = setTimeout(() => this.schedule(), 520);
      }
    }
    const synth = new WebAudioSynth();

    function updateMusicUi(playing) {
      const onIcon = document.getElementById("music-icon-on");
      const offIcon = document.getElementById("music-icon-off");
      if (onIcon && offIcon) {
        onIcon.style.display = playing ? "block" : "none";
        offIcon.style.display = playing ? "none" : "block";
      }
      const reelL = document.getElementById("cassette-reel-left");
      const reelR = document.getElementById("cassette-reel-right");
      const label = document.getElementById("cassette-btn-label");
      if (reelL && reelR) {
        if (playing) {
          reelL.classList.add("spinning");
          reelR.classList.add("spinning");
          if (label) label.textContent = "Tạm dừng phát nhạc";
        } else {
          reelL.classList.remove("spinning");
          reelR.classList.remove("spinning");
          if (label) label.textContent = "Phát nhạc kỷ niệm";
        }
      }
    }

    document.getElementById("music-toggle-btn").addEventListener("click", () => {
      if (synth.isPlaying) synth.stop();
      else synth.play();
    });

    function toggleCassettePlay() {
      if (synth.isPlaying) synth.stop();
      else synth.play();
    }

    // --- Navigation & Slide Logic ---
    function renderDots() {
      const row = document.getElementById("dots-container");
      row.innerHTML = "";
      for (let i = 1; i <= TOTAL_SLIDES; i++) {
        const dot = document.createElement("div");
        dot.className = "dot" + (i === currentSlide ? " active" : "");
        dot.onclick = () => goToSlide(i);
        row.appendChild(dot);
      }
    }

    function renderMenu() {
      const list = document.getElementById("menu-items-list");
      list.innerHTML = "";
      CHAPTERS.forEach(c => {
        const item = document.createElement("div");
        item.className = "menu-item" + (c.id === currentSlide ? " active" : "");
        item.innerHTML = "<span>" + c.title + "</span><span style='font-size:11px; opacity:0.8;'>0" + c.id + "</span>";
        item.onclick = () => {
          goToSlide(c.id);
          closeMenu();
        };
        list.appendChild(item);
      });
    }

    function goToSlide(n) {
      if (n < 1 || n > TOTAL_SLIDES) return;
      const prev = currentSlide;
      currentSlide = n;

      for (let i = 1; i <= TOTAL_SLIDES; i++) {
        const s = document.getElementById("slide-" + i);
        if (!s) continue;
        s.classList.remove("active", "prev");
        if (i === currentSlide) {
          s.classList.add("active");
        } else if (i < currentSlide) {
          s.classList.add("prev");
        }
      }

      renderDots();
      renderMenu();

      if (currentSlide === 1 || currentSlide === 7) {
        fireConfetti();
      }
    }

    function nextSlide() {
      if (currentSlide < TOTAL_SLIDES) goToSlide(currentSlide + 1);
    }
    function prevSlide() {
      if (currentSlide > 1) goToSlide(currentSlide - 1);
    }

    function openGift() {
      synth.play();
      fireConfetti();
      setTimeout(() => goToSlide(2), 600);
    }

    function replayFromStart() {
      goToSlide(1);
    }

    // Menu toggle
    const menuModal = document.getElementById("menu-modal");
    document.getElementById("menu-btn").onclick = () => { menuModal.classList.add("open"); };
    document.getElementById("close-menu-btn").onclick = () => { menuModal.classList.remove("open"); };
    function closeMenu() { menuModal.classList.remove("open"); }

    // --- Touch / Swipe Gestures ---
    let startX = 0;
    let startY = 0;
    const wrapper = document.getElementById("slides-wrapper");
    wrapper.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    wrapper.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;
      if (Math.abs(dx) > Math.abs(dy) * 1.4 && Math.abs(dx) > 40) {
        if (dx < 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });

    // Keyboard navigation
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") nextSlide();
      else if (e.key === "ArrowLeft") prevSlide();
    });

    // --- Slide 3: Photo Album ---
    function updatePhotoView() {
      if (!photos || photos.length === 0) return;
      const p = photos[currentPhotoIndex];
      const img = document.getElementById("album-photo-img");
      const cap = document.getElementById("album-photo-caption");
      const date = document.getElementById("album-photo-date");
      const count = document.getElementById("photo-counter");
      if (img) img.src = p.url;
      if (cap) cap.textContent = p.caption || "";
      if (date) date.textContent = p.date || "";
      if (count) count.textContent = (currentPhotoIndex + 1) + " / " + photos.length;
    }
    function nextPhoto() {
      if (photos.length === 0) return;
      currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
      updatePhotoView();
    }
    function prevPhoto() {
      if (photos.length === 0) return;
      currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
      updatePhotoView();
    }
    function openPhotoZoom() {
      if (!photos[currentPhotoIndex]) return;
      window.open(photos[currentPhotoIndex].url, "_blank");
    }

    // --- Slide 4: Video Modal ---
    const videoModal = document.getElementById("video-modal");
    function openVideoModal() {
      synth.stop();
      const container = document.getElementById("video-player-container");
      container.innerHTML = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      videoModal.classList.add("open");
    }
    function closeVideoModal() {
      const container = document.getElementById("video-player-container");
      container.innerHTML = "";
      videoModal.classList.remove("open");
    }

    // --- Slide 6: Voice Waveform ---
    const waveContainer = document.getElementById("waveform-container");
    const barHeights = [20, 45, 75, 30, 90, 60, 40, 85, 100, 70, 35, 80, 95, 55, 30, 70, 40, 85, 50, 25];
    barHeights.forEach(h => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = h + "%";
      waveContainer.appendChild(bar);
    });
    let voicePlaying = false;
    let voiceInterval = null;
    let voiceSec = 0;
    function toggleVoicePlay() {
      voicePlaying = !voicePlaying;
      const btn = document.getElementById("voice-play-btn");
      if (voicePlaying) {
        synth.play();
        btn.textContent = "⏸";
        voiceInterval = setInterval(() => {
          voiceSec++;
          const m = String(Math.floor(voiceSec / 60)).padStart(2, "0");
          const s = String(voiceSec % 60).padStart(2, "0");
          document.getElementById("voice-timer").textContent = m + ":" + s + " / ${voiceDuration}";
        }, 1000);
      } else {
        synth.stop();
        btn.textContent = "▶";
        if (voiceInterval) clearInterval(voiceInterval);
      }
    }

    // Initial render
    renderDots();
    renderMenu();
    updatePhotoView();
  </script>
</body>
</html>`;

  return html;
}

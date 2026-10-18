import { NextRequest, NextResponse } from "next/server";
import { getGiftProductByToken } from "@/lib/supabase/products";
import {
  mediaConfigured,
  pruneMedia,
  signedMediaUrl,
  uploadSong,
  uploadVideo,
} from "@/lib/supabase/media";
import { hasGiftSession, normalizeToken } from "@/lib/auth/gift-session";
import { checkRateLimit } from "@/lib/validation/security";
import {
  AUDIO_CONTENT_TYPES,
  MAX_SONG_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_CONTENT_TYPES,
  sniffAudio,
  sniffVideo,
} from "@/lib/validation/audio";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * Handles uploading custom song files (MP3/M4A) and video files (MP4/WebM/MOV).
 * Only the creator (create session) may upload. The format is verified from file magic bytes.
 */
export async function POST(req: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    if (!checkRateLimit(`gift-media:${ip}`, 20, 60 * 1000).allowed) {
      return fail("Thao tác tải tệp quá nhanh. Vui lòng chờ 1 phút rồi thử lại.", 429);
    }

    const token = normalizeToken((await context.params).token);
    if (!token) return fail("Mã thiệp không hợp lệ", 400);

    if (!hasGiftSession(req, "create", token)) {
      return fail("Phiên tạo thiệp đã hết hạn hoặc chưa xác thực. Vui lòng nhập lại OTP tạo thiệp.", 401);
    }

    // Refuse oversized bodies before reading them into memory.
    const declared = Number(req.headers.get("content-length") ?? 0);
    if (declared > MAX_VIDEO_BYTES + 128 * 1024) {
      return fail("Tệp quá lớn. Video tối đa 25MB, bài hát MP3 tối đa 10MB.", 413);
    }

    if (!mediaConfigured()) {
      return fail("Chưa cấu hình nơi lưu media. Vui lòng liên hệ quầy.", 503);
    }

    const order = await getGiftProductByToken(token);
    if (!order) return fail("Không tìm thấy thiệp với mã này", 404);

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return fail("Dữ liệu tải lên không hợp lệ", 400);
    }

    const mediaType = form.get("type");
    const file = form.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return fail("Thiếu tệp tải lên", 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    if (mediaType === "song") {
      if (file.size > MAX_SONG_BYTES) {
        return fail("Tệp bài hát quá lớn (tối đa 10MB). Hãy nén hoặc chọn bài nhỏ hơn.", 413);
      }

      const kind = sniffAudio(bytes);
      if (!kind) {
        return fail("Tệp không phải định dạng âm thanh hợp lệ (hỗ trợ MP3, M4A, WAV, WebM).", 415);
      }

      const path = await uploadSong(token, bytes, kind, AUDIO_CONTENT_TYPES[kind]);
      const savedPath = (order.giftData?.song as { audioPath?: string } | undefined)?.audioPath;
      await pruneMedia(token, "song", [path, ...(savedPath ? [savedPath] : [])]);

      const signedUrl = await signedMediaUrl(path);
      return NextResponse.json({
        success: true,
        type: "song",
        path,
        url: signedUrl,
        name: file.name,
        size: file.size,
      });
    }

    if (mediaType === "video") {
      if (file.size > MAX_VIDEO_BYTES) {
        return fail("Tệp thước phim quá lớn (tối đa 25MB). Hãy chọn clip kỷ niệm ngắn hơn.", 413);
      }

      const kind = sniffVideo(bytes);
      if (!kind) {
        return fail("Tệp không phải định dạng video hợp lệ (hỗ trợ MP4, WebM, MOV).", 415);
      }

      const path = await uploadVideo(token, bytes, kind, VIDEO_CONTENT_TYPES[kind]);
      const savedPath = (order.giftData?.videoUrl as string | undefined);
      const isSavedStoragePath = savedPath && savedPath.startsWith(`${token}/video-`);
      await pruneMedia(token, "video", [path, ...(isSavedStoragePath ? [savedPath] : [])]);

      const signedUrl = await signedMediaUrl(path);
      return NextResponse.json({
        success: true,
        type: "video",
        path,
        url: signedUrl,
        name: file.name,
        size: file.size,
      });
    }

    return fail("Loại tệp không hợp lệ (chỉ nhận song hoặc video)", 400);
  } catch (err) {
    console.error("[API Upload Media Error]:", err);
    return fail("Không tải được tệp lúc này. Vui lòng thử lại.", 500);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getGiftProductByToken } from "@/lib/supabase/products";
import { mediaConfigured, pruneVoices, signedVoiceUrl, uploadVoice } from "@/lib/supabase/media";
import { hasGiftSession, normalizeToken } from "@/lib/auth/gift-session";
import { checkRateLimit } from "@/lib/validation/security";
import { MAX_VOICE_BYTES, sniffAudio } from "@/lib/validation/audio";
import { MAX_VOICE_SECONDS } from "@/lib/validation/gift";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * Uploads the card's voice note (multipart: `audio` file, `durationSec`). Only the buyer (create session)
 * may upload. The format is read from the file's first bytes, never from its name or declared type.
 */
export async function POST(req: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    if (!checkRateLimit(`gift-voice:${ip}`, 12, 60 * 1000).allowed) {
      return fail("Thao tác quá nhanh. Vui lòng chờ 1 phút rồi thử lại.", 429);
    }

    const token = normalizeToken((await context.params).token);
    if (!token) return fail("Mã thiệp không hợp lệ", 400);

    if (!hasGiftSession(req, "create", token)) {
      return fail("Phiên tạo thiệp đã hết hạn hoặc chưa xác thực. Vui lòng nhập lại OTP tạo thiệp.", 401);
    }

    // Refuse oversized bodies before reading them.
    const declared = Number(req.headers.get("content-length") ?? 0);
    if (declared > MAX_VOICE_BYTES + 64 * 1024) return fail("Bản ghi âm quá lớn (tối đa 2MB).", 413);

    if (!mediaConfigured()) return fail("Chưa cấu hình nơi lưu ghi âm. Vui lòng liên hệ quầy.", 503);

    const order = await getGiftProductByToken(token);
    if (!order) return fail("Không tìm thấy thiệp với mã này", 404);

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return fail("Dữ liệu tải lên không hợp lệ", 400);
    }

    const file = form.get("audio");
    if (!(file instanceof File) || file.size === 0) return fail("Thiếu tệp ghi âm", 400);
    if (file.size > MAX_VOICE_BYTES) return fail("Bản ghi âm quá lớn (tối đa 2MB).", 413);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffAudio(bytes);
    if (!kind) return fail("Tệp không phải âm thanh được hỗ trợ (webm, ogg, m4a, wav, mp3).", 415);

    const raw = Number(form.get("durationSec"));
    const durationSec = Number.isFinite(raw) ? Math.min(MAX_VOICE_SECONDS, Math.max(1, Math.round(raw))) : 1;

    const audioPath = await uploadVoice(token, bytes, kind);

    // Keep the saved recording (the card may still use it) and the new one; drop older leftovers.
    const saved = (order.giftData?.voiceNote as { audioPath?: string } | undefined)?.audioPath;
    await pruneVoices(token, [audioPath, ...(saved ? [saved] : [])]);

    return NextResponse.json({
      success: true,
      voice: { audioPath, durationSec, audioUrl: await signedVoiceUrl(audioPath) },
    });
  } catch (err) {
    console.error("[API Upload Voice Error]:", err);
    return fail("Không tải được bản ghi âm lúc này. Vui lòng thử lại.", 500);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getGiftProductByToken, toPublicView } from "@/lib/supabase/products";
import { checkRateLimit } from "@/lib/validation/security";
import { hasGiftSession, issueGiftSession, normalizeToken } from "@/lib/auth/gift-session";
import { signedVoiceUrl } from "@/lib/supabase/media";

/**
 * Returns gift content only to a caller that already proved knowledge of a code for this token:
 *  - "create" session (buyer): the studio view, without secrets or contact details.
 *  - "open" session (recipient): the finished card only (or opened directly if buyer turned off PIN requirement).
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    const rateCheck = checkRateLimit(`gift-lookup:${ip}`, 40, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 1 phút." },
        { status: 429 }
      );
    }

    const params = await context.params;
    const token = normalizeToken(params.token);
    if (!token) {
      return NextResponse.json({ error: "Mã token không hợp lệ" }, { status: 400 });
    }

    const order = await getGiftProductByToken(token);
    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy thiệp với mã này" }, { status: 404 });
    }

    // The studio passes ?as=create so a recipient session (view-only) can never load the editor.
    const requireCreate = req.nextUrl.searchParams.get("as") === "create";
    const isPinRequired = order.giftData?.requirePin !== false;

    const scope = hasGiftSession(req, "create", token)
      ? "create"
      : !requireCreate && hasGiftSession(req, "open", token)
        ? "open"
        : !requireCreate && !isPinRequired
          ? "open"
          : null;

    if (!scope) {
      return NextResponse.json(
        {
          error: requireCreate
            ? "Cần nhập OTP tạo thiệp để vào studio thiết kế."
            : "Cần nhập mã thiệp và OTP xem thiệp trước khi xem. Vui lòng nhập tại trang chủ.",
        },
        { status: 401 }
      );
    }

    const product = toPublicView(order);

    // The recording is private: hand out a link that works for one hour.
    const voice = product.giftData?.voiceNote as { audioPath?: string; audioUrl?: string } | undefined;
    if (product.giftData && voice?.audioPath) {
      const audioUrl = await signedVoiceUrl(voice.audioPath);
      product.giftData = { ...product.giftData, voiceNote: { ...voice, audioUrl } };
    }

    // Sign uploaded MP3 song link
    const song = product.giftData?.song as { source?: string; audioPath?: string; audioUrl?: string } | undefined;
    if (product.giftData && song?.source === "upload" && song.audioPath) {
      const audioUrl = await signedVoiceUrl(song.audioPath);
      product.giftData = { ...product.giftData, song: { ...song, audioUrl: audioUrl || song.audioUrl } };
    }

    // Sign uploaded video link
    const videoUrl = product.giftData?.videoUrl;
    if (product.giftData && typeof videoUrl === "string" && videoUrl.startsWith(`${token}/video-`)) {
      const signedVideo = await signedVoiceUrl(videoUrl);
      if (signedVideo) {
        product.giftData = { ...product.giftData, videoUrl: signedVideo };
      }
    }

    const noCacheHeaders = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    if (scope === "open") {
      const res = NextResponse.json(
        {
          success: true,
          scope,
          product: { token: product.token, status: product.status, giftData: product.giftData },
        },
        { headers: noCacheHeaders }
      );
      if (!isPinRequired && !hasGiftSession(req, "open", token)) {
        issueGiftSession(res, "open", product.token);
      }
      return res;
    }

    return NextResponse.json({ success: true, scope, product }, { headers: noCacheHeaders });
  } catch (err: any) {
    console.error("[API Get Gift By Token Error]:", err);
    return NextResponse.json(
      { error: "Lỗi truy vấn sản phẩm" },
      { status: 500 }
    );
  }
}

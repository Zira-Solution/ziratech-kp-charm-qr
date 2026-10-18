import { NextRequest, NextResponse } from "next/server";
import { getInMemoryMedia } from "@/lib/supabase/media";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) return new NextResponse("Missing path", { status: 400 });

  const item = getInMemoryMedia(path);
  if (!item) return new NextResponse("Media not found", { status: 404 });

  // Stream in-memory audio/video with proper headers
  return new NextResponse(item.bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": item.contentType,
      "Content-Length": String(item.bytes.byteLength),
      "Cache-Control": "public, max-age=3600",
    },
  });
}

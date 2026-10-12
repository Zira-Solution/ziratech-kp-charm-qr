import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth";

export async function POST() {
  try {
    const supabase = await createAuthClient();
    // Ends the session on the Auth server and clears the auth cookies.
    if (supabase) await supabase.auth.signOut({ scope: "local" });
  } catch (err) {
    console.error("[Admin Logout Error]:", err);
  }
  return NextResponse.json({ success: true, message: "Đã đăng xuất phiên làm việc" });
}

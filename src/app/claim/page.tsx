"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClaimGiftPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/#hero");
  }, [router]);

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-cream via-blush-light to-surface-container flex flex-col items-center justify-center p-4 font-serif">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-sans font-bold text-primary">Đang chuyển về trang chủ để nhập mã thiệp...</p>
    </div>
  );
}

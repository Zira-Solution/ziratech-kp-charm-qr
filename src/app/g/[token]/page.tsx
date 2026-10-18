"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import GiftTemplateViewer from "@/components/gift-templates/GiftTemplateViewer";
import { normalizeGift, type ViewerGift } from "@/components/gift-templates/normalize";

type Phase = "loading" | "pin" | "notReady" | "ready" | "error";

const shell = "flex min-h-dvh items-center justify-center bg-linear-to-b from-rose-cream via-blush-light to-surface-container px-4 py-10 text-on-surface";
const panel = "w-full max-w-sm rounded-3xl border border-white/80 bg-white/85 p-7 text-center shadow-xl backdrop-blur";

function Icon({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="material-symbols-outlined text-[30px] leading-none">
      {name}
    </span>
  );
}

/**
 * The page a recipient lands on from the QR code or from the home page. A browser that has already
 * proved the code (the home page form does that) sees the card straight away; one that has not (a
 * scan of the QR) is asked for the 4-digit code printed on the card first, because the card is private.
 */
export default function RecipientGiftPage() {
  const params = useParams();
  const token = String(params?.token ?? "").toUpperCase();

  const [phase, setPhase] = useState<Phase>("loading");
  const [gift, setGift] = useState<ViewerGift | null>(null);

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [checking, setChecking] = useState(false);

  // The server only answers once this browser holds a session cookie for this card.
  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/gifts/${token}`);
      if (res.status === 401) return setPhase("pin");
      if (!res.ok) return setPhase("error");
      const data = await res.json();
      const card = data.product?.giftData ? normalizeGift(data.product.giftData) : null;
      if (!card || card.blocks.length === 0) return setPhase("notReady"); // verified, but the sender has not finished it
      setGift(card);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  // The recording link is signed and lasts an hour: the player asks for a new one when it stops working.
  const refreshVoiceUrl = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`/api/gifts/${token}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.product?.giftData?.voiceNote?.audioUrl ?? null;
    } catch {
      return null;
    }
  }, [token]);

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checking || pin.length !== 4) return;
    setChecking(true);
    setPinError("");
    try {
      const res = await fetch("/api/gifts/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, passcode: pin, mode: "open" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPinError(data.error || "Mã PIN chưa đúng. Bạn kiểm tra lại mã trong email nhé.");
        return;
      }
      setPin("");
      setPhase("loading");
      await load();
    } catch {
      setPinError("Không kết nối được. Vui lòng thử lại.");
    } finally {
      setChecking(false);
    }
  };

  if (phase === "ready" && gift) {
    if (gift.template === "messenger") {
      const q = new URLSearchParams();
      if (gift.recipientName) q.set("to", gift.recipientName);
      if (gift.sender) q.set("sender", gift.sender);
      if (gift.letter?.title) q.set("ltitle", gift.letter.title);
      if (gift.letter?.content) q.set("lbody", gift.letter.content);
      if (gift.letter?.signature) q.set("lsig", gift.letter.signature);
      if (gift.voice?.audioUrl) q.set("voice", gift.voice.audioUrl);
      return (
        <div className="kp-card-in h-dvh w-full overflow-hidden bg-black">
          <iframe
            src={`/messenger?${q.toString()}`}
            className="w-full h-full border-0"
            title="Thiệp quà số Messenger"
          />
        </div>
      );
    }
    return (
      <div className="kp-card-in h-dvh">
        <GiftTemplateViewer gift={gift} refreshVoiceUrl={refreshVoiceUrl} />
      </div>
    );
  }

  if (phase === "pin") {
    return (
      <main className={shell}>
        <form onSubmit={submitPin} className={panel}>
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-md">
            <Icon name="redeem" />
          </span>
          <h1 className="text-2xl font-bold leading-snug text-primary">Có một món quà đang chờ bạn</h1>
          <p className="mt-2 text-base leading-relaxed text-on-surface-variant">Nhập mã PIN 4 số nhận qua email để mở thiệp.</p>

          <label htmlFor="gift-pin" className="sr-only">
            Mã PIN xem thiệp (4 số)
          </label>
          <input
            id="gift-pin"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            aria-invalid={pinError ? true : undefined}
            aria-describedby={pinError ? "gift-pin-error" : undefined}
            placeholder="••••"
            className="mt-5 w-full rounded-2xl border-2 border-outline-variant bg-white px-4 py-3 text-center font-mono text-3xl tracking-[0.5em] text-primary shadow-inner focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
          {pinError && (
            <p id="gift-pin-error" role="alert" className="mt-3 text-sm font-semibold text-rose-700">
              {pinError}
            </p>
          )}
          <button
            type="submit"
            disabled={checking || pin.length !== 4}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-bold text-white shadow-md transition-colors cursor-pointer hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking ? "Đang kiểm tra..." : "Mở thiệp"}
          </button>
          <Link href="/#keepsake" className="mt-4 inline-block text-sm font-semibold text-secondary underline underline-offset-4">
            Nhập mã thiệp khác
          </Link>
        </form>
      </main>
    );
  }

  if (phase === "notReady") {
    return (
      <main className={shell}>
        <div className={panel} role="status">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-primary shadow-md">
            <Icon name="edit_note" />
          </span>
          <h1 className="text-2xl font-bold leading-snug text-primary">Thiệp đang được chuẩn bị</h1>
          <p className="mt-2 text-base leading-relaxed text-on-surface-variant">Người gửi đang nắn nót món quà cho bạn. Hãy quay lại sau ít phút nhé!</p>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-2xl border-2 border-primary px-5 text-base font-bold text-primary hover:bg-surface-container-low">
            Về trang chủ
          </Link>
        </div>
      </main>
    );
  }

  if (phase === "error") {
    return (
      <main className={shell}>
        <div className={panel} role="alert">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-primary shadow-md">
            <Icon name="cloud_off" />
          </span>
          <h1 className="text-2xl font-bold leading-snug text-primary">Chưa mở được thiệp</h1>
          <p className="mt-2 text-base leading-relaxed text-on-surface-variant">Kết nối đang gặp trục trặc. Bạn thử tải lại giúp mình nhé.</p>
          <button
            type="button"
            onClick={() => {
              setPhase("loading");
              load();
            }}
            className="mt-5 inline-flex min-h-11 items-center rounded-2xl bg-primary px-5 text-base font-bold text-white cursor-pointer hover:bg-primary-container"
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={shell}>
      <div role="status" className="text-center">
        <span className="mb-3 inline-block h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-base font-semibold text-primary">Đang mở món quà của bạn...</p>
      </div>
    </main>
  );
}

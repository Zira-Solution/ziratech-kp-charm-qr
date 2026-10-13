"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import GiftTemplateViewer from "@/components/gift-templates/GiftTemplateViewer";
import { GiftTemplateId } from "@/components/gift-templates/types";

export default function RecipientGiftPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params?.token as string;
  const initialTemplateParam = (searchParams.get("tpl") as GiftTemplateId) || "vintage-scrapbook";

  const [unlocked, setUnlocked] = useState(false);
  const [holding, setHolding] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [loadedGiftData, setLoadedGiftData] = useState<any>(null);
  const [activeTemplate, setActiveTemplate] = useState<GiftTemplateId>(initialTemplateParam);

  // PIN Unlock State
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinChecking, setPinChecking] = useState(false);
  // null = still checking, true = this browser already proved the code (via /gift), false = PIN needed
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [notReady, setNotReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);

  // Loads the card. The server only answers once this browser holds a valid session cookie.
  // Resolves true only when the card content is available.
  const fetchGift = useCallback(async (): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/gifts/${token}`);
      if (!res.ok) {
        setAuthed(false);
        return false;
      }
      const data = await res.json();
      setAuthed(true);
      if (data.success && data.product?.giftData) {
        setLoadedGiftData(data.product.giftData);
        setNotReady(false);
        if (data.product.giftData.template) {
          setActiveTemplate(data.product.giftData.template);
        }
        return true;
      }
      setNotReady(true); // verified, but the sender has not finished the card yet
      return false;
    } catch (err) {
      console.warn("Could not load custom gift data:", err);
      setAuthed(false);
      return false;
    }
  }, [token]);

  // Opens the card: straight away if already verified, otherwise asks for the PIN.
  const requestUnlock = useCallback(() => {
    if (!authed) {
      setShowPinModal(true);
    } else if (!notReady) {
      setUnlocked(true);
    }
  }, [authed, notReady]);

  const handleCheckPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinChecking) return;
    setPinChecking(true);
    setPinError("");
    try {
      const res = await fetch("/api/gifts/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, passcode: enteredPin, mode: "open" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPinError(data.error || "OTP xem thiệp không đúng!");
        return;
      }
      setEnteredPin("");
      setShowPinModal(false);
      if (await fetchGift()) setUnlocked(true);
    } catch {
      setPinError("Không thể kiểm tra OTP. Vui lòng thử lại.");
    } finally {
      setPinChecking(false);
    }
  };

  useEffect(() => {
    fetchGift();
  }, [fetchGift]);

  // Initialize Canvas Heart Particle System (porting Heart.html)
  useEffect(() => {
    if (unlocked) return; // Stop canvas when unlocked

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 390);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 844);
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);

    const rand = Math.random;

    const heartPosition = (rad: number) => {
      return [
        Math.pow(Math.sin(rad), 3),
        -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad)),
      ];
    };

    const scaleAndTranslate = (pos: number[], sx: number, sy: number, dx: number, dy: number) => {
      return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    const pointsOrigin: number[][] = [];
    for (let i = 0; i < Math.PI * 2; i += 0.2)
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 180, 11, 0, 0));
    for (let i = 0; i < Math.PI * 2; i += 0.2)
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 120, 7.5, 0, 0));
    for (let i = 0; i < Math.PI * 2; i += 0.2)
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 70, 4.5, 0, 0));
    const heartPointsCount = pointsOrigin.length;

    const targetPoints: number[][] = [];
    const pulse = (kx: number, ky: number) => {
      for (let i = 0; i < pointsOrigin.length; i++) {
        targetPoints[i] = [];
        const fit = 0.7 * Math.min(1, width / 400, height / 500);
        targetPoints[i][0] = fit * kx * pointsOrigin[i][0] + width / 2;
        targetPoints[i][1] = fit * ky * pointsOrigin[i][1] + height / 2 - 40;
      }
    };

    const traceCount = 30;
    const e: any[] = [];
    for (let i = 0; i < heartPointsCount; i++) {
      const x = rand() * width;
      const y = rand() * height;
      e[i] = {
        vx: 0,
        vy: 0,
        speed: rand() + 4,
        q: Math.floor(rand() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * rand() + 0.7,
        f: `hsla(0, ${Math.floor(40 * rand() + 60)}%, ${Math.floor(60 * rand() + 25)}%, 0.4)`,
        trace: [],
      };
      for (let k = 0; k < traceCount; k++) e[i].trace[k] = { x, y };
    }

    const rays: any[] = [];
    const spawnRay = () => {
      const fit = 0.7 * Math.min(1, width / 400, height / 500);
      const sx = width / 2 + (rand() - 0.5) * 20;
      const sy = height * 0.75;
      rays.push({
        sx,
        sy,
        bend: (rand() - 0.5) * width * 0.4,
        q: Math.floor(rand() * heartPointsCount),
        t: 0,
        speed: 0.02 + rand() * 0.015,
        f: `hsla(0, ${Math.floor(40 * rand() + 60)}%, ${Math.floor(40 * rand() + 50)}%,`,
        trail: [],
      });
    };

    const drawRays = () => {
      for (let r = rays.length; r--; ) {
        const ray = rays[r];
        const tp = targetPoints[ray.q] || [width / 2, height / 2];
        ray.t = Math.min(1, ray.t + ray.speed);
        const t = ray.t;
        const mt = 1 - t;
        const cx = (ray.sx + tp[0]) / 2 + ray.bend;
        const cy = (ray.sy + tp[1]) / 2;
        const x = mt * mt * ray.sx + 2 * mt * t * cx + t * t * tp[0];
        const y = mt * mt * ray.sy + 2 * mt * t * cy + t * t * tp[1];
        ray.trail.unshift({ x, y });
        if (ray.trail.length > 8) ray.trail.pop();
        const fade = t < 0.7 ? 1 : (1 - t) / 0.3;

        for (let j = 0; j < ray.trail.length - 1; j++) {
          const a = ray.trail[j];
          const b = ray.trail[j + 1];
          ctx.strokeStyle = `${ray.f}${(0.55 * fade * (1 - j / ray.trail.length)).toFixed(2)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        ctx.fillStyle = `${ray.f}${(0.8 * fade).toFixed(2)})`;
        ctx.fillRect(x - 1, y - 1, 2, 2);
        if (t >= 1) rays.splice(r, 1);
      }
    };

    let time = 0;
    const config = { traceK: 0.4, timeDelta: 0.012 };

    const loop = () => {
      const n = -Math.cos(time);
      pulse((1 + n) * 0.5, (1 + n) * 0.5);
      time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, 0, width, height);

      for (let i = e.length; i--; ) {
        const u = e[i];
        const q = targetPoints[u.q] || [width / 2, height / 2];
        const dx = u.trace[0].x - q[0];
        const dy = u.trace[0].y - q[1];
        const length = Math.sqrt(dx * dx + dy * dy);

        if (10 > length) {
          if (0.95 < rand()) {
            u.q = Math.floor(rand() * heartPointsCount);
          } else {
            if (0.99 < rand()) u.D *= -1;
            u.q += u.D;
            u.q %= heartPointsCount;
            if (0 > u.q) u.q += heartPointsCount;
          }
        }

        u.vx += (-dx / length) * u.speed;
        u.vy += (-dy / length) * u.speed;
        u.trace[0].x += u.vx;
        u.trace[0].y += u.vy;
        u.vx *= u.force;
        u.vy *= u.force;

        for (let k = 0; k < u.trace.length - 1; ) {
          const T = u.trace[k];
          const N = u.trace[++k];
          N.x -= config.traceK * (N.x - T.x);
          N.y -= config.traceK * (N.y - T.y);
        }

        ctx.fillStyle = u.f;
        for (let k = 0; k < u.trace.length; k++) {
          ctx.fillRect(u.trace[k].x, u.trace[k].y, 1.2, 1.2);
        }
      }

      if (holding) {
        if (rand() < 0.4) spawnRay();
      } else {
        if (rand() < 0.15) spawnRay();
      }

      ctx.lineCap = "round";
      drawRays();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [unlocked, holding]);

  // Press and hold timer logic (unlocks after 2.5s)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (holding && !unlocked) {
      interval = setInterval(() => {
        setRevealProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          return prev + 4;
        });
      }, 70);
    } else {
      setRevealProgress(0);
    }
    return () => clearInterval(interval);
  }, [holding, unlocked]);

  // Holding long enough opens the card (or asks for the PIN when this browser is not verified yet).
  useEffect(() => {
    if (holding && !unlocked && revealProgress >= 100) {
      setHolding(false);
      requestUnlock();
    }
  }, [holding, unlocked, revealProgress, requestUnlock]);

  const handleStartHold = () => {
    setHolding(true);
    holdStartRef.current = Date.now();
  };

  const handleEndHold = () => {
    setHolding(false);
  };

  // Locked Screen: The Heart Canvas Particle Hold-to-Reveal
  const renderLockedHeart = () => (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-between select-none">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Top Welcome Title */}
      <div className="relative z-10 pt-10 text-center px-6 pointer-events-none">
        <span className="text-[10px] uppercase font-bold tracking-widest text-secondary-container block mb-1">
          K&amp;P Atelier · Digital Gift Experience
        </span>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow-md">
          Có Một Món Quà Đang Chờ Bạn
        </h2>
        <p className="text-xs text-white/70 mt-1">
          Nhấn và giữ nút bên dưới để đánh thức trái tim
        </p>
        {notReady && (
          <p className="text-xs text-amber-300 mt-2 font-bold">
            Người gửi đang nắn nót chuẩn bị thiệp cho bạn. Hãy quay lại sau nhé!
          </p>
        )}
      </div>

      {/* Bottom Hold-to-Reveal Button (#reveal-btn in Heart.html) */}
      <div className="relative z-10 pb-16 flex flex-col items-center">
        {/* Progress Circular Bar / Indicator */}
        {holding && (
          <div className="mb-3 text-[11px] font-mono text-secondary-container animate-pulse">
            Đang truyền năng lượng: {revealProgress}%
          </div>
        )}

        <button
          onPointerDown={handleStartHold}
          onPointerUp={handleEndHold}
          onPointerLeave={handleEndHold}
          onPointerCancel={handleEndHold}
          onTouchStart={handleStartHold}
          onTouchEnd={handleEndHold}
          className={`w-20 h-20 rounded-full border-2 border-red-500/80 flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-90 ${
            holding
              ? "bg-red-600 text-white shadow-[0_0_40px_rgba(239,68,68,0.9)] scale-110"
              : "bg-black/70 text-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
          }`}
          aria-label="Nhấn giữ để hiện trái tim"
        >
          <svg className="w-9 h-9 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-7.5-4.6-10-9.4C.4 8.4 2.3 4.5 6 4.5c2.2 0 3.6 1.2 4.4 2.5h3.2C14.4 5.7 15.8 4.5 18 4.5c3.7 0 5.6 3.9 4 7.1C19.5 16.4 12 21 12 21z" />
          </svg>
        </button>

        <span className="text-[11px] text-white/60 mt-3 font-semibold tracking-wider">
          {holding ? "GIỮ CHẶT ĐỂ MỞ QUÀ..." : "NHẤN VÀ GIỮ NÚT TRÒN"}
        </span>

        {/* PIN Unlock & Bypass options */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => setShowPinModal(true)}
            className="text-[11px] text-secondary-container hover:text-white flex items-center gap-1 cursor-pointer bg-neutral-900/80 px-3 py-1 rounded-full border border-neutral-700"
          >
            <span className="material-symbols-outlined text-sm">pin</span>
            <span>Mở bằng OTP xem thiệp</span>
          </button>

        </div>
      </div>

      {/* PIN Unlock Modal */}
      {showPinModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs p-6 rounded-3xl bg-neutral-950 border border-neutral-700 text-center shadow-2xl">
            <span className="material-symbols-outlined text-3xl text-secondary-container mb-2">lock</span>
            <h3 className="font-serif text-lg font-bold text-white">Nhập OTP Xem Thiệp (4 số)</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Nhập OTP in trên thẻ để xem món quà này.
            </p>

            <form onSubmit={handleCheckPin} className="space-y-3">
              {pinError && (
                <div className="text-xs text-rose-400 font-bold bg-rose-950/60 p-2 rounded-xl border border-rose-800">
                  {pinError}
                </div>
              )}

              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full py-3 text-center font-mono text-2xl tracking-[0.5em] rounded-xl bg-black/60 border border-neutral-700 text-white focus:outline-none focus:border-secondary-container"
                autoFocus
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={pinChecking || enteredPin.length !== 4}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md disabled:opacity-50"
                >
                  {pinChecking ? "Đang kiểm tra..." : "Mở Khóa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (unlocked) {
    return (
      <GiftTemplateViewer
        initialTemplate={activeTemplate}
        giftData={loadedGiftData || undefined}
        onBackToLock={() => setUnlocked(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center relative">
      {/* Top Controls */}
      <div className="fixed top-3 right-4 z-50 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-neutral-700 text-white">
        <Link
          href="/"
          className="text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1 mr-2"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Trang Chủ
        </Link>
      </div>

      {/* Responsive Viewport: Fullscreen Native on Mobile, Luxury iPhone Chassis on Desktop */}
      <div className="w-full min-h-screen md:py-10 md:px-4 flex items-center justify-center">
        <div className="w-full min-h-screen md:min-h-0 md:w-97.5 md:h-211 md:p-3 md:bg-neutral-950 md:rounded-4xl md:shadow-[0_30px_80px_rgba(0,0,0,0.8)] md:border md:border-neutral-800 relative shrink-0 flex flex-col bg-black">
          {/* Dynamic Island / Notch (Desktop frame only) */}
          <div className="hidden md:block absolute top-5.5 left-1/2 -translate-x-1/2 w-30 h-8.5 bg-black rounded-full z-50 pointer-events-none border border-neutral-900" />
          {/* Screen Container */}
          <div className="w-full flex-1 md:h-full md:rounded-3xl overflow-hidden bg-black relative flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {renderLockedHeart()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

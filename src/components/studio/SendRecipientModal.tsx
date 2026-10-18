"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Icon } from "./ui";

interface Props {
  isOpen: boolean;
  token: string;
  defaultRecipientName: string;
  defaultSenderName: string;
  defaultUnlockPin: string;
  requirePin: boolean;
  onClose: () => void;
  onViewGift: () => void;
}

export default function SendRecipientModal({
  isOpen,
  token,
  defaultRecipientName,
  defaultSenderName,
  defaultUnlockPin,
  requirePin,
  onClose,
  onViewGift,
}: Props) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState(defaultRecipientName || "");
  const [senderName, setSenderName] = useState(defaultSenderName || "");
  const [unlockPin, setUnlockPin] = useState(defaultUnlockPin || "");
  const [customMessage, setCustomMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [apiError, setApiError] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    const trimmedEmail = recipientEmail.trim();
    if (!trimmedEmail) {
      setEmailError("Vui lòng nhập địa chỉ email của người nhận");
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setEmailError("Địa chỉ email không đúng định dạng (ví dụ: ban@gmail.com)");
      return;
    }
    setEmailError("");

    setSending(true);
    try {
      const res = await fetch(`/api/gifts/${token}/send-recipient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: trimmedEmail,
          recipientName: recipientName.trim(),
          senderName: senderName.trim(),
          unlockPin: requirePin ? unlockPin.trim() : undefined,
          customMessage: customMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể gửi email lúc này. Vui lòng thử lại.");
      }

      setSentSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#721a28", "#ffd700", "#fea095", "#38a169"],
      });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const giftUrl = `${window.location.origin}/g/${token}`;
      await navigator.clipboard.writeText(giftUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore clipboard error
    }
  };

  const giftUrl = typeof window !== "undefined" ? `${window.location.origin}/g/${token}` : `/g/${token}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white/95 border border-rose-200 shadow-2xl p-6 sm:p-8 my-8 text-on-surface">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Icon name="close" className="text-[20px]" />
        </button>

        {!sentSuccess ? (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-[#721a28] text-xs font-bold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[15px]">celebration</span>
                <span>Thiệp Đã Sẵn Sàng Trao Tặng</span>
              </span>
              <h2 id="send-modal-title" className="text-xl sm:text-2xl font-extrabold text-[#721a28] tracking-tight font-serif">
                Gửi Quà Bất Ngờ Cho Người Nhận
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Nhập email của người thương để hệ thống tự động bắn một bức thư bí mật kèm mã QR quét thiệp và hướng dẫn mở quà nhé!
              </p>
            </div>

            {/* Error Banner */}
            {apiError && (
              <div role="alert" className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <Icon name="error" className="text-base shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              {/* Recipient Email Field */}
              <div>
                <label htmlFor="recipient-email" className="block text-xs font-bold text-slate-800 mb-1">
                  Email người nhận <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                    <Icon name="mail" className="text-[18px]" />
                  </span>
                  <input
                    id="recipient-email"
                    type="email"
                    autoFocus
                    required
                    value={recipientEmail}
                    onChange={(e) => {
                      setRecipientEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    placeholder="ví dụ: nguoiay@gmail.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none transition-all ${
                      emailError
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                        : "border-rose-200 focus:border-[#721a28] focus:ring-2 focus:ring-rose-100"
                    }`}
                  />
                </div>
                {emailError && <p className="mt-1 text-xs text-rose-600 font-semibold">{emailError}</p>}
              </div>

              {/* Names grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="recipient-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Tên người nhận trong mail
                  </label>
                  <input
                    id="recipient-name"
                    type="text"
                    maxLength={60}
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Tên người nhận"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:border-[#721a28] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="sender-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Tên người gửi (bạn)
                  </label>
                  <input
                    id="sender-name"
                    type="text"
                    maxLength={60}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Tên bạn / Ẩn danh"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:border-[#721a28] focus:outline-none"
                  />
                </div>
              </div>

              {/* Security PIN status */}
              <div className="rounded-2xl p-3.5 bg-rose-50/70 border border-rose-200/80">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#721a28]">
                      {requirePin ? "lock" : "lock_open"}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {requirePin ? "Mã OTP mở thiệp (4 số):" : "Chế độ mở:"}
                    </span>
                  </div>

                  {requirePin ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        inputMode="numeric"
                        value={unlockPin}
                        onChange={(e) => setUnlockPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••"
                        className="w-20 text-center font-mono font-bold text-sm tracking-widest px-2 py-1 bg-white border border-rose-300 rounded-lg text-[#721a28] focus:outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Mở trực tiếp (Không cần OTP)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  {requirePin
                    ? "Mã OTP 4 số này sẽ được in trong email kèm hướng dẫn để người nhận mở bức thư bí mật."
                    : "Người nhận quét mã QR hoặc bấm link là thiệp hiển thị ngay tức thì."}
                </p>
              </div>

              {/* Custom Teaser Message */}
              <div>
                <label htmlFor="custom-message" className="block text-xs font-bold text-slate-700 mb-1">
                  Lời nhắn bí mật gửi kèm email <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <textarea
                  id="custom-message"
                  rows={2}
                  maxLength={300}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="ví dụ: Hôm nay có một bất ngờ nho nhỏ gửi đến bạn, nhớ tìm một góc yên tĩnh và đeo tai nghe khi mở nhé! 💖"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white placeholder:text-slate-400 focus:border-[#721a28] focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:flex-1 py-3 px-6 rounded-2xl liquid-glass-btn-primary text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Đang bắn mail bất ngờ...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="send" className="text-[18px]" />
                      <span>Bắn Mail Bất Ngờ Ngay</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onViewGift}
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  Để tôi tự gửi sau · Xem thiệp
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Sent Success View */
          <div className="text-center py-4 space-y-5 animate-fade-in">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#721a28] font-serif">
                ✨ Đã Bắn Mail Bất Ngờ Thành Công!
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Một chiếc email tuyệt đẹp chứa <strong>mã QR quét thiệp</strong> và <strong>hướng dẫn mở quà</strong> đã được gửi tới:
              </p>
              <div className="mt-2 inline-block px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-mono font-bold text-[#721a28]">
                {recipientEmail}
              </div>
            </div>

            {/* Direct Link Share Card */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-left space-y-2">
              <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>🔗 Hoặc gửi trực tiếp link thiệp cho người nhận:</span>
                {copiedLink && (
                  <span className="text-[11px] text-emerald-600 font-bold animate-fade-in">
                    Đã sao chép!
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={giftUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 font-mono truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-[#721a28] hover:bg-[#540114] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Icon name="content_copy" className="text-[15px]" />
                  <span>Sao chép</span>
                </button>
              </div>
            </div>

            {/* Success Navigation Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onViewGift}
                className="w-full sm:w-auto py-3 px-8 rounded-2xl liquid-glass-btn-primary text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Icon name="visibility" className="text-[18px]" />
                <span>Mở Xem Thiệp Thực Tế</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSentSuccess(false);
                  setRecipientEmail("");
                }}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Gửi thêm cho email khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

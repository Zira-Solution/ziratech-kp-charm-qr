"use client";

import React, { useMemo } from "react";
import type { GiftDraft } from "../draft";
import { StudioSection } from "../ui";

interface Props {
  step: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

const PRESETS = [
  { label: "20/10", code: "2010", desc: "Phụ nữ VN" },
  { label: "14/02", code: "1402", desc: "Valentine" },
  { label: "08/03", code: "0803", desc: "Quốc tế PN" },
  { label: "11/11", code: "1111", desc: "Đặc biệt" },
];

export default function PinBlock({ step, draft, onChange }: Props) {
  const requirePin = draft.requirePin !== false;

  // Extract DDMM from anniversary date if filled in previous steps
  const anniversaryPin = useMemo(() => {
    if (!draft.anniversaryDate) return "";
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(draft.anniversaryDate);
    if (!m) return "";
    return `${m[3]}${m[2]}`; // DDMM, e.g. 2010
  }, [draft.anniversaryDate]);

  return (
    <StudioSection
      id="pin"
      step={step}
      title="Bảo mật & Quyền riêng tư khi xem thiệp"
      hint="Bạn có toàn quyền quyết định: yêu cầu người nhận nhập mã OTP 4 số (để giữ bí mật, tạo bất ngờ) hoặc cho phép mở thiệp trực tiếp ngay khi quét mã QR."
    >
      <div className="space-y-4">
        {/* Option Choice: Require OTP vs Direct Open */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option 1: Require OTP */}
          <button
            type="button"
            onClick={() => onChange({ requirePin: true })}
            className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              requirePin
                ? "bg-rose-50/90 border-[#721a28] shadow-sm"
                : "bg-white/80 border-slate-200 hover:border-rose-200 hover:bg-rose-50/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${
                  requirePin ? "bg-[#721a28] shadow-xs" : "bg-slate-400"
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">lock</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  requirePin
                    ? "bg-[#721a28] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Khuyên dùng
              </span>
            </div>
            <p className="font-bold text-sm text-slate-800">Bảo vệ bằng mã OTP</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Người nhận phải nhập đúng mã 4 số do bạn đặt mới xem được thiệp. Riêng tư &amp; tạo sự bất ngờ khi mở quà.
            </p>
          </button>

          {/* Option 2: Direct Open (No OTP) */}
          <button
            type="button"
            onClick={() => onChange({ requirePin: false })}
            className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              !requirePin
                ? "bg-emerald-50/90 border-emerald-600 shadow-sm"
                : "bg-white/80 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${
                  !requirePin ? "bg-emerald-600 shadow-xs" : "bg-slate-400"
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">lock_open_right</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  !requirePin
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Mở nhanh
              </span>
            </div>
            <p className="font-bold text-sm text-slate-800">Mở trực tiếp (Không cần OTP)</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Quét mã QR hoặc bấm link là thiệp hiển thị ngay tức thì. Rất tiện lợi cho người lớn tuổi hoặc muốn xem nhanh.
            </p>
          </button>
        </div>

        {/* Detailed Configuration for Option 1: Require OTP */}
        {requirePin ? (
          <div className="rounded-2xl liquid-glass-card border border-rose-200/80 p-5 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-100">
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#721a28]">key</span>
                  <span>Tự đặt mã OTP xem thiệp (4 chữ số)</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Gợi ý: Ngày sinh nhật, ngày kỷ niệm hoặc 4 số ý nghĩa của hai bạn
                </p>
              </div>

              {draft.unlockPin && draft.unlockPin.length === 4 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold self-start sm:self-auto">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  <span>OTP mới: {draft.unlockPin}</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 italic self-start sm:self-auto">
                  (Đang dùng mã mặc định ban đầu)
                </span>
              )}
            </div>

            {/* OTP Input Field */}
            <div className="max-w-xs mx-auto text-center space-y-2">
              <label htmlFor="pin-new" className="block text-xs font-semibold text-slate-700">
                Nhập 4 số mã OTP:
              </label>
              <div className="relative">
                <input
                  id="pin-new"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={draft.unlockPin}
                  onChange={(e) => onChange({ unlockPin: e.target.value.replace(/\D/g, "") })}
                  placeholder="••••"
                  className="w-full rounded-2xl border-2 border-rose-200/80 bg-white px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.6em] text-[#721a28] shadow-inner focus:border-[#721a28] focus:outline-none focus:ring-4 focus:ring-rose-200/50 transition-all placeholder:text-slate-300"
                />
                {draft.unlockPin && (
                  <button
                    type="button"
                    onClick={() => onChange({ unlockPin: "" })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs transition-colors"
                    title="Xóa mã OTP"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick Suggestions / Presets */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-500 mb-2 text-center">
                Bấm chọn nhanh mã gợi ý phổ biến:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {anniversaryPin && anniversaryPin !== "2010" && (
                  <button
                    type="button"
                    onClick={() => onChange({ unlockPin: anniversaryPin })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      draft.unlockPin === anniversaryPin
                        ? "bg-[#721a28] text-white border-[#721a28] shadow-xs"
                        : "bg-white text-[#721a28] border-rose-200 hover:bg-rose-50"
                    }`}
                  >
                    <span>📅 Ngày kỷ niệm: {anniversaryPin}</span>
                  </button>
                )}

                {PRESETS.map((p) => {
                  const isSelected = draft.unlockPin === p.code;
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => onChange({ unlockPin: p.code })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#721a28] text-white border-[#721a28] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-rose-200 hover:bg-rose-50"
                      }`}
                    >
                      <span className="font-mono">{p.code}</span>
                      <span className="text-[10px] font-normal opacity-80">({p.label})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              💡 <em>Lưu ý: Bạn hãy nhớ mã 4 số này để gửi cho người nhận hoặc tạo câu đố vui để người nhận tự đoán nhé!</em>
            </p>
          </div>
        ) : (
          /* Detailed Configuration for Option 2: Direct Open (No OTP) */
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-4.5 flex items-start gap-3.5 animate-fade-in">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </span>
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-bold text-emerald-900 text-[13px]">
                Người nhận sẽ mở xem thiệp tức thì
              </p>
              <p className="leading-relaxed text-emerald-800">
                Khi quét mã QR trên mặt charm hoặc mở đường liên kết thiệp, toàn bộ câu chuyện và thông điệp của bạn sẽ tự động hiển thị mượt mà mà không có màn hình khóa hay yêu cầu nhập mã OTP.
              </p>
            </div>
          </div>
        )}
      </div>
    </StudioSection>
  );
}

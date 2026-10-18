"use client";

import React, { useRef, useState } from "react";
import { compressImageToDataUrl } from "@/lib/image-compress";
import type { GiftDraft, MessengerDraft } from "../draft";
import { Field, Icon, StudioSection, fieldClass } from "../ui";

interface Props {
  step?: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

export const WALLPAPER_PRESETS = [
  { name: "Ảnh mẫu cô gái", url: "/images/default_lockscreen_girl.jpg" },
  { name: "Hoàng hôn Anime", url: "/images/anime_sunset_couple.jpg" },
  { name: "Cặp đôi hoàng hôn", url: "/thamkhao/sunset_couple_clean.jpg" },
];

export const CHAT_WALLPAPER_PRESETS = [
  { name: "Trái tim hồng", url: "/images/messenger_pink_theme_bg.png" },
  { name: "Mây hồng hoàng hôn", url: "/images/pink_clouds_sunset_sky.webp" },
  { name: "Hoàng hôn Anime", url: "/images/anime_sunset_couple.jpg" },
  { name: "Cặp đôi hoàng hôn", url: "/thamkhao/sunset_couple_clean.jpg" },
  { name: "Nắng nhẹ cô gái", url: "/images/default_lockscreen_girl.jpg" },
];

const MESSAGE_PRESETS = [
  {
    label: "🌸 20/10 Yêu Thương",
    messages: [
      "Hello bé iu của anh ❤️",
      "Hôm nay là 20/10, ngày phụ nữ Việt Nam nè 🌸",
      "Anh có chuẩn bị một món quà bất ngờ nho nhỏ dành riêng cho em",
      "Cảm ơn em vì đã luôn ở bên cạnh anh, làm cho mỗi ngày trôi qua đều thật ấm áp và ngập tràn hạnh phúc",
      "Chúc công chúa của anh luôn xinh đẹp, rạng rỡ và luôn nở nụ cười thật tươi nhé ✨",
      "Thương em nhiều lắm! 💕",
      "Giữ lá thư nhỏ bên dưới để mở thư tay anh viết riêng cho em nhé 💌",
    ],
  },
  {
    label: "✨ Lời Ngọt Ngào",
    messages: [
      "Chào người đặc biệt nhất của mình ✨",
      "Cảm ơn vì đã luôn mang lại nụ cười và năng lượng tích cực cho mình mỗi ngày",
      "Mỗi khoảnh khắc có bạn đều trở nên ý nghĩa và trọn vẹn hơn rất nhiều",
      "Chúc bạn một ngày ngập tràn niềm vui và bình yên nhé 💕",
      "Chạm vào lá thư bên dưới để đọc lời nhắn mình gửi riêng bạn nha 💌",
    ],
  },
  {
    label: "💌 Kỷ Niệm Tình Yêu",
    messages: [
      "Bé iu à ❤️",
      "Lại thêm một cột mốc đáng nhớ nữa của hai đứa mình rồi",
      "Cảm ơn em đã cùng anh đi qua bao nhiêu thăng trầm và vẫn luôn nắm chặt tay nhau",
      "Mãi yêu thương và trân trọng em như những ngày đầu tiên 💕",
      "Giữ lá thư nhỏ bên dưới để mở điều bất ngờ anh dành riêng cho em nhé 💌",
    ],
  },
];

export default function MessengerBlock({ step, draft, onChange }: Props) {
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const chatWallpaperInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [uploadingWallpaper, setUploadingWallpaper] = useState(false);
  const [uploadingChatWallpaper, setUploadingChatWallpaper] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const messenger = draft.messenger;

  const updateMessenger = (patch: Partial<MessengerDraft>) => {
    onChange({
      messenger: {
        ...messenger,
        ...patch,
      },
    });
  };

  const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErrorMsg("");

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp hình ảnh (JPG, PNG hoặc WebP).");
      return;
    }

    try {
      setUploadingWallpaper(true);
      const dataUrl = await compressImageToDataUrl(file, 300_000);
      updateMessenger({ wallpaperUrl: dataUrl });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không tải được ảnh nền.");
    } finally {
      setUploadingWallpaper(false);
    }
  };

  const handleChatWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErrorMsg("");

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp hình ảnh (JPG, PNG hoặc WebP).");
      return;
    }

    try {
      setUploadingChatWallpaper(true);
      const dataUrl = await compressImageToDataUrl(file, 300_000);
      updateMessenger({ chatWallpaperUrl: dataUrl });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không tải được hình nền cuộc trò chuyện.");
    } finally {
      setUploadingChatWallpaper(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErrorMsg("");

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp hình ảnh (JPG, PNG hoặc WebP).");
      return;
    }

    try {
      setUploadingAvatar(true);
      const dataUrl = await compressImageToDataUrl(file, 150_000);
      updateMessenger({ avatarUrl: dataUrl });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không tải được ảnh đại diện.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const isCustomWallpaper = !WALLPAPER_PRESETS.some((p) => p.url === messenger.wallpaperUrl);
  const currentChatWallpaper = messenger.chatWallpaperUrl || CHAT_WALLPAPER_PRESETS[0].url;
  const isCustomChatWallpaper = !CHAT_WALLPAPER_PRESETS.some((p) => p.url === currentChatWallpaper);

  return (
    <StudioSection
      id="messenger"
      step={step}
      title="Màn hình khóa & Tin nhắn Messenger"
      hint="Tùy chỉnh hình nền khóa iPhone, ảnh đại diện và những dòng tin nhắn ngọt ngào sẽ lướt đến người nhận."
    >
      {errorMsg && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
          <Icon name="error" className="text-rose-600 text-[18px]" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* 1. HÌNH NỀN KHÓA IPHONE */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-rose-600">wallpaper</span>
              Hình nền khóa iPhone
            </label>
            {isCustomWallpaper && (
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Ảnh tự tải
              </span>
            )}
          </div>

          <p className="text-[11.5px] text-slate-500 mb-3 leading-relaxed">
            Chọn một hình nền có sẵn hoặc tải ảnh riêng của hai người từ máy bạn:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            {WALLPAPER_PRESETS.map((p) => {
              const active = messenger.wallpaperUrl === p.url;
              return (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => updateMessenger({ wallpaperUrl: p.url })}
                  className={`group relative rounded-2xl overflow-hidden border-2 aspect-[9/16] h-32 mx-auto w-full transition-all cursor-pointer shadow-xs ${
                    active
                      ? "border-rose-600 ring-3 ring-rose-300/80 scale-102 shadow-md"
                      : "border-slate-200/90 hover:border-rose-300 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-1.5 pt-4 text-center">
                    <span className="text-[10.5px] font-bold text-white block truncate">
                      {p.name}
                    </span>
                  </div>
                  {active && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => wallpaperInputRef.current?.click()}
              disabled={uploadingWallpaper}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass-btn-secondary text-xs font-bold text-slate-800 cursor-pointer transition-all shadow-2xs hover:border-rose-300"
            >
              <span className="material-symbols-outlined text-[17px] text-rose-600">
                {uploadingWallpaper ? "hourglass_top" : "upload_file"}
              </span>
              <span>{uploadingWallpaper ? "Đang xử lý ảnh..." : "Tải ảnh nền từ máy bạn"}</span>
            </button>
            <input
              ref={wallpaperInputRef}
              type="file"
              accept="image/*"
              onChange={handleWallpaperUpload}
              className="hidden"
            />
            {isCustomWallpaper && (
              <button
                type="button"
                onClick={() => updateMessenger({ wallpaperUrl: WALLPAPER_PRESETS[0].url })}
                className="text-[11.5px] text-slate-500 hover:text-rose-700 underline cursor-pointer"
              >
                Đặt lại ảnh mẫu ban đầu
              </button>
            )}
            <span className="text-[11px] text-slate-400">
              Hỗ trợ JPG, PNG (tự nén sắc nét)
            </span>
          </div>
        </div>

        {/* 2. HÌNH NỀN CUỘC TRÒ CHUYỆN (CHAT THEME WALLPAPER) */}
        <div className="pt-4 border-t border-rose-100/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-rose-600">imagesmode</span>
              Hình nền cuộc trò chuyện Messenger
            </label>
            {isCustomChatWallpaper && (
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Ảnh tự tải
              </span>
            )}
          </div>

          <p className="text-[11.5px] text-slate-500 mb-3 leading-relaxed">
            Chọn chủ đề nền phía sau các dòng tin nhắn Messenger hoặc tải hình ảnh riêng của hai bạn:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3">
            {CHAT_WALLPAPER_PRESETS.map((p) => {
              const active = currentChatWallpaper === p.url;
              return (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => updateMessenger({ chatWallpaperUrl: p.url })}
                  className={`group relative rounded-2xl overflow-hidden border-2 aspect-[9/16] h-32 mx-auto w-full transition-all cursor-pointer shadow-xs ${
                    active
                      ? "border-rose-600 ring-3 ring-rose-300/80 scale-102 shadow-md"
                      : "border-slate-200/90 hover:border-rose-300 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-1.5 pt-4 text-center">
                    <span className="text-[10px] font-bold text-white block truncate">
                      {p.name}
                    </span>
                  </div>
                  {active && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => chatWallpaperInputRef.current?.click()}
              disabled={uploadingChatWallpaper}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass-btn-secondary text-xs font-bold text-slate-800 cursor-pointer transition-all shadow-2xs hover:border-rose-300"
            >
              <span className="material-symbols-outlined text-[17px] text-rose-600">
                {uploadingChatWallpaper ? "hourglass_top" : "upload_file"}
              </span>
              <span>{uploadingChatWallpaper ? "Đang xử lý ảnh..." : "Tải ảnh nền chat từ máy bạn"}</span>
            </button>
            <input
              ref={chatWallpaperInputRef}
              type="file"
              accept="image/*"
              onChange={handleChatWallpaperUpload}
              className="hidden"
            />
            {isCustomChatWallpaper && (
              <button
                type="button"
                onClick={() => updateMessenger({ chatWallpaperUrl: CHAT_WALLPAPER_PRESETS[0].url })}
                className="text-[11.5px] text-slate-500 hover:text-rose-700 underline cursor-pointer"
              >
                Đặt lại nền trái tim hồng mặc định
              </button>
            )}
            <span className="text-[11px] text-slate-400">
              Hỗ trợ JPG, PNG (tự nén sắc nét)
            </span>
          </div>
        </div>

        {/* 3. ẢNH ĐẠI DIỆN TIN NHẮN (AVATAR) */}
        <div className="pt-4 border-t border-rose-100/80">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <span className="material-symbols-outlined text-[16px] text-rose-600">account_circle</span>
            Ảnh đại diện tin nhắn (Avatar)
          </label>

          <div className="flex items-center gap-3.5 bg-rose-50/50 p-3 rounded-2xl border border-rose-200/60">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-rose-400 ring-2 ring-rose-200 shrink-0 shadow-xs bg-slate-100">
              <img
                src={messenger.avatarUrl || "/images/default_avatar.png"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs transition-all cursor-pointer border border-rose-200 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {uploadingAvatar ? "hourglass_top" : "upload_file"}
                  </span>
                  <span>{uploadingAvatar ? "Đang xử lý..." : "Tải avatar từ máy"}</span>
                </button>

                {messenger.avatarUrl && messenger.avatarUrl !== "/images/default_avatar.png" && (
                  <button
                    type="button"
                    onClick={() => updateMessenger({ avatarUrl: "/images/default_avatar.png" })}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-medium text-xs transition-all cursor-pointer"
                  >
                    Dùng avatar mặc định
                  </button>
                )}
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <span className="text-[11px] text-slate-400">
                Avatar đại diện người gửi trong khung trò chuyện Messenger
              </span>
            </div>
          </div>
        </div>

        {/* 4. THÔNG BÁO MÀN HÌNH KHÓA & TRÁI TIM BAY */}
        <div className="pt-4 border-t border-rose-100/80 space-y-3.5">
          <Field
            label="Nội dung tin nhắn trên màn hình khóa iPhone"
            htmlFor="messenger-notification"
            hint="Dòng tin nhắn này sẽ xuất hiện nổi bật ngay dưới đồng hồ trên màn hình khóa iPhone."
          >
            <input
              id="messenger-notification"
              type="text"
              maxLength={120}
              value={messenger.notificationText}
              onChange={(e) => updateMessenger({ notificationText: e.target.value })}
              placeholder="Ví dụ: hello bé iu ❤️"
              className={fieldClass}
            />
          </Field>

          {/* Toggle Trái Tim Bay */}
          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-rose-200/70 cursor-pointer hover:bg-rose-50/50 transition-colors">
            <input
              type="checkbox"
              checked={messenger.showFloatingHearts}
              onChange={(e) => updateMessenger({ showFloatingHearts: e.target.checked })}
              className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
            />
            <div className="flex-1 text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>Hiệu ứng trái tim bay lung linh</span>
                <span>💕</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Những hạt trái tim bay lơ lửng trên màn hình khóa iPhone tạo cảm giác lãng mạn.
              </p>
            </div>
          </label>
        </div>

        {/* 5. ĐOẠN HỘI THOẠI MESSENGER (CHAT BUBBLES) */}
        <div className="pt-4 border-t border-rose-100/80">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label htmlFor="messenger-messages" className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-rose-600">chat</span>
              Danh sách tin nhắn Messenger (mỗi dòng 1 tin)
            </label>
            <span className="rounded-full liquid-glass-pill px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
              {messenger.messages.length} tin nhắn
            </span>
          </div>

          <p className="text-[11.5px] text-slate-500 mb-2 leading-relaxed">
            Các tin nhắn sẽ xuất hiện tuần tự theo thứ tự bạn nhập, đi kèm hiệu ứng 3 chấm gõ phím đang nhắn cực kỳ chân thực.
          </p>

          {/* Gợi ý mẫu tin nhắn nhanh */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
            <span className="text-[11px] font-semibold text-slate-500">Mẫu gợi ý nhanh:</span>
            {MESSAGE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => updateMessenger({ messages: [...preset.messages] })}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold liquid-glass-pill text-[#721a28] border border-rose-200 hover:bg-rose-100/80 transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <textarea
            id="messenger-messages"
            rows={7}
            value={messenger.messages.join("\n")}
            onChange={(e) =>
              updateMessenger({
                messages: e.target.value.split("\n").filter((s) => s.trim().length > 0),
              })
            }
            placeholder="Nhập mỗi tin nhắn trên một dòng..."
            className={`${fieldClass} font-sans text-xs leading-relaxed`}
          />
        </div>

        {/* 6. GỬI KÈM VIDEO KỶ NIỆM (YOUTUBE / DRIVE / VIMEO) */}
        <div className="pt-4 border-t border-rose-100/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="messenger-video-url" className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-rose-600">smart_display</span>
              Video kỷ niệm gửi kèm (YouTube / Drive / Vimeo)
            </label>
            {(messenger.videoUrl || draft.videoUrl) ? (
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                <span>✓ Đã gắn video</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">Không bắt buộc</span>
            )}
          </div>

          <p className="text-[11.5px] text-slate-500 mb-3 leading-relaxed">
            Gửi thêm 1 video kỷ niệm vào cuộc trò chuyện Messenger. Hệ thống sẽ tự động gửi 1 tin nhắn thông báo tò mò, sau đó xuất hiện khung video như tin nhắn thật có nút phát và lời mời chạm mở.
          </p>

          <div className="space-y-3 p-3.5 rounded-2xl bg-white border border-rose-100 shadow-2xs">
            <Field
              label="Đường dẫn video (YouTube, Shorts, Google Drive, Vimeo...)"
              htmlFor="messenger-video-url"
              hint="Ví dụ: https://youtu.be/dQw4w9WgXcQ hoặc link Google Drive (đã bật quyền 'Bất kỳ ai có liên kết')"
            >
              <div className="relative">
                <input
                  id="messenger-video-url"
                  type="url"
                  value={messenger.videoUrl ?? draft.videoUrl ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({
                      videoUrl: val,
                      messenger: {
                        ...messenger,
                        videoUrl: val,
                      },
                    });
                  }}
                  placeholder="https://youtu.be/..."
                  className={`${fieldClass} !text-xs !py-2 pr-8`}
                />
                {(messenger.videoUrl || draft.videoUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        videoUrl: "",
                        messenger: {
                          ...messenger,
                          videoUrl: "",
                        },
                      });
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                    title="Xóa video"
                  >
                    ✕
                  </button>
                )}
              </div>
            </Field>

            {(messenger.videoUrl || draft.videoUrl) && (
              <>
                <Field
                  label="Tin nhắn dẫn dắt trước video"
                  htmlFor="messenger-video-lead"
                  hint="Tin nhắn sẽ gửi ngay trước khung video để tạo sự háo hức"
                >
                  <input
                    id="messenger-video-lead"
                    type="text"
                    maxLength={150}
                    value={messenger.videoLeadMessage ?? "Anh có một video nhỏ gửi cho em nè 🎬"}
                    onChange={(e) => updateMessenger({ videoLeadMessage: e.target.value })}
                    placeholder="Anh có một video nhỏ gửi cho em nè 🎬"
                    className={`${fieldClass} !text-xs !py-1.5`}
                  />
                </Field>

                <Field
                  label="Tiêu đề hiển thị trên khung video"
                  htmlFor="messenger-video-title"
                  hint="Hiện ở chân khung video kèm lời nhắc bấm xem"
                >
                  <input
                    id="messenger-video-title"
                    type="text"
                    maxLength={100}
                    value={messenger.videoTitle ?? "Video kỷ niệm dành riêng cho em"}
                    onChange={(e) => updateMessenger({ videoTitle: e.target.value })}
                    placeholder="Video kỷ niệm dành riêng cho em"
                    className={`${fieldClass} !text-xs !py-1.5`}
                  />
                </Field>

                {/* Live Preview Card */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Xem trước bong bóng video trong Messenger:
                  </span>
                  <div className="max-w-[280px] p-2 rounded-2xl bg-white border border-pink-200/80 shadow-xs">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                      <div className="w-10 h-10 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-lg z-20 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[24px] ml-0.5">play_arrow</span>
                      </div>
                      <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                        <span>🎬</span>
                        <span>Video gửi kèm</span>
                      </span>
                      <span className="absolute bottom-2 left-2 right-2 z-20 text-[11px] font-semibold text-white truncate drop-shadow-sm">
                        {messenger.videoTitle || "Video kỷ niệm dành riêng cho em"}
                      </span>
                    </div>
                    <div className="mt-1.5 px-1 flex items-center justify-between text-[11px]">
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <span>▶</span>
                        <span>Bấm vào để xem video nha</span>
                      </span>
                      <span className="text-slate-400 text-[10px]">HD</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 6. TÙY CHỌN TIN NHẮN DẪN DẮT (NÂNG CAO) */}
        <div className="pt-4 border-t border-rose-100/80">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-rose-600">settings</span>
              <span>Tùy chỉnh tin nhắn dẫn dắt (Thư tay, Voice & Hộp quà)</span>
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {showAdvanced ? "expand_less" : "expand_more"}
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3 p-3.5 rounded-2xl bg-white border border-rose-100 shadow-2xs">
              <Field
                label="Tin nhắn dẫn tới hộp quà bí mật"
                htmlFor="messenger-glead"
                hint="Gửi tự động ngay sau khi người nhận đóng bức thư tay 💌"
              >
                <input
                  id="messenger-glead"
                  type="text"
                  maxLength={150}
                  value={messenger.giftLeadMessage}
                  onChange={(e) => updateMessenger({ giftLeadMessage: e.target.value })}
                  className={`${fieldClass} !text-xs !py-1.5`}
                />
              </Field>

              <Field
                label="Tin nhắn trước tin nhắn thoại"
                htmlFor="messenger-vlead"
                hint="Gửi tự động sau khi xem xong cuộn phim ảnh, trước khi hiện tin nhắn thoại 🎧"
              >
                <input
                  id="messenger-vlead"
                  type="text"
                  maxLength={150}
                  value={messenger.voiceLeadMessage}
                  onChange={(e) => updateMessenger({ voiceLeadMessage: e.target.value })}
                  className={`${fieldClass} !text-xs !py-1.5`}
                />
              </Field>

              <Field
                label="Tin nhắn sau tin nhắn thoại"
                htmlFor="messenger-vafter"
                hint="Gửi tự động ngay sau khi nghe xong tin nhắn thoại 💕"
              >
                <input
                  id="messenger-vafter"
                  type="text"
                  maxLength={150}
                  value={messenger.voiceAfterMessage}
                  onChange={(e) => updateMessenger({ voiceAfterMessage: e.target.value })}
                  className={`${fieldClass} !text-xs !py-1.5`}
                />
              </Field>
            </div>
          )}
        </div>
      </div>
    </StudioSection>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { GiftProductOrder } from "@/types/gift-order";
import { GiftTemplateId, DEFAULT_GIFT_DATA, RecipientGiftData } from "@/components/gift-templates/types";

export default function CustomerGiftStudioPage() {
  const params = useParams();
  const router = useRouter();
  const token = (params?.token as string)?.toUpperCase();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<GiftProductOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false); // no valid creator session for this token
  const [isSaving, setIsSaving] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Customer Customization State
  const [selectedTemplate, setSelectedTemplate] = useState<GiftTemplateId>("vintage-scrapbook");
  const [recipientName, setRecipientName] = useState("Bảo Ngọc");
  const [senderName, setSenderName] = useState("Người bạn đặc biệt");
  const [letterTitle, setLetterTitle] = useState("LỜI NHẮN");
  const [letterSubtitle, setLetterSubtitle] = useState("Vẫn còn vài điều mình muốn kể bạn nghe... ♡");
  const [letterContent, setLetterContent] = useState(
    "Có vài điều mình luôn muốn nói nhưng chưa có dịp... Hôm nay, mình muốn gửi tất cả vào món quà nhỏ này.\n\nCảm ơn vì đã luôn ở bên cạnh, cùng đi qua những ngày tháng rực rỡ và ấm áp nhất. Chúc bạn 20/10 luôn rạng ngời như nắng mùa thu nhé!"
  );
  const [letterSignature, setLetterSignature] = useState("Người bạn luôn dõi theo ♡");

  // Photos
  const [photos, setPhotos] = useState<RecipientGiftData["memoryPhotos"]>([
    {
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
      caption: "Những buổi chiều tan học FPT...",
      date: "Mùa thu 2026",
    },
    {
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
      caption: "Nụ cười rạng rỡ nhất ♡",
      date: "Tháng 10",
    },
    {
      url: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80",
      caption: "Cúc họa mi dịu dàng...",
      date: "Kỷ niệm",
    },
  ]);

  // Voice note & Song
  const [voiceNoteText, setVoiceNoteText] = useState(
    "Có những điều viết ra không hết... Nên mình gửi bạn lời thì thầm này nhé. ♡"
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [songTitle, setSongTitle] = useState("Có Chàng Trai Viết Lên Cây");
  const [songArtist, setSongArtist] = useState("Phan Mạnh Quỳnh");
  const [pinCode, setPinCode] = useState(""); // empty = keep the current unlock PIN

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetIdx, setUploadTargetIdx] = useState<number | null>(null);

  // AI Tone presets
  const applyAiTone = (tone: "romantic" | "friend" | "teacher") => {
    if (tone === "romantic") {
      setLetterTitle("GỬI NẮNG CỦA ANH");
      setLetterSubtitle("Điều dịu dàng nhất của mùa thu... ♡");
      setLetterContent(
        "Gửi người con gái luôn mang nụ cười rạng rỡ nhất. Chiếc vòng nhỏ này sẽ thay anh đồng hành cùng em qua mọi giờ học, và nhắc em nhớ rằng em luôn là điều dịu dàng nhất của mùa thu FPT."
      );
      setLetterSignature("Người thương em ♡");
    } else if (tone === "friend") {
      setLetterTitle("GỬI BẠN THÂN CÙNG CHẠY DEADLINE");
      setLetterSubtitle("Cảm ơn vì đã luôn chia nửa ly trà sữa... ♡");
      setLetterContent(
        "Gửi bạn thân cùng chạy deadline! Cảm ơn vì đã luôn bao dung và chia nửa ly trà sữa những ngày ôn thi thâu đêm. Chúc bạn 20/10 mãi xinh đẹp, rạng rỡ và qua môn 10 điểm!"
      );
      setLetterSignature("Chiến hữu FPT của bạn ♡");
    } else {
      setLetterTitle("TRI ÂN THẦY CÔ");
      setLetterSubtitle("Kính gửi Cô nhân ngày 20/10... ♡");
      setLetterContent(
        "Kính gửi Cô, nhân ngày 20/10, chúng em xin gửi trọn lòng tri ân sâu sắc nhất. Cảm ơn Cô vì những bài giảng tâm huyết và sự tận tụy đã luôn soi đường cho chúng em vững bước."
      );
      setLetterSignature("Tập thể học trò kính tặng ♡");
    }
  };

  // Simulated Voice Note recording
  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordSeconds(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      setVoiceNoteText((prev) => `${prev} [Đã lưu bản ghi âm ${recordSeconds}s]`);
    }
  };

  // Handle Photo File Upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Vui lòng chọn ảnh dung lượng dưới 5MB để tải nhanh.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      if (uploadTargetIdx !== null && uploadTargetIdx < photos.length) {
        // Replace existing
        const updated = [...photos];
        updated[uploadTargetIdx] = {
          ...updated[uploadTargetIdx],
          url: result,
        };
        setPhotos(updated);
      } else {
        // Add new
        if (photos.length >= 6) {
          alert("Tối đa 6 ảnh kỷ niệm.");
          return;
        }
        setPhotos((prev) => [
          ...prev,
          {
            url: result,
            caption: "Kỷ niệm mới thêm...",
            date: "20/10/2026",
          },
        ]);
      }
      setUploadTargetIdx(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Fetch product by token
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/gifts/${token}?as=create`);
        const data = await res.json();
        if (res.status === 401) setNeedsAuth(true);
        if (!res.ok || !data.success || data.scope !== "create") {
          throw new Error(data.error || "Không tìm thấy sản phẩm");
        }
        setProduct(data.product);

        // Preload customer name
        if (data.product.customerName) {
          setSenderName(data.product.customerName);
        }

        // If existing gift data, restore it
        if (data.product.giftData) {
          const g = data.product.giftData;
          if (g.template) setSelectedTemplate(g.template);
          if (g.recipientName) setRecipientName(g.recipientName);
          if (g.senderName) setSenderName(g.senderName);
          if (g.letterContent) setLetterContent(g.letterContent);
          if (g.letterTitle) setLetterTitle(g.letterTitle);
          if (g.letterSubtitle) setLetterSubtitle(g.letterSubtitle);
          if (g.letterSignature) setLetterSignature(g.letterSignature);
          if (Array.isArray(g.memoryPhotos) && g.memoryPhotos.length > 0) {
            setPhotos(g.memoryPhotos);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Lỗi tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchProduct();
    }
  }, [token]);

  // Handle Save Digital Gift
  const handleSaveGift = async () => {
    if (!recipientName.trim()) {
      alert("Vui lòng nhập tên người nhận thiệp.");
      return;
    }
    if (!letterContent.trim()) {
      alert("Vui lòng viết lời nhắn gửi vào bức thư.");
      return;
    }

    setIsSaving(true);
    try {
      const giftPayload: RecipientGiftData = {
        ...DEFAULT_GIFT_DATA,
        recipientName: recipientName.trim(),
        senderName: senderName.trim(),
        braceletTitle: product?.chainName || "Vòng Tay K&P Atelier",
        letterTitle: letterTitle.trim() || "LỜI NHẮN",
        letterSubtitle: letterSubtitle.trim(),
        letterContent: letterContent.trim(),
        letterSignature: letterSignature.trim(),
        memoryPhotos: photos,
        song: {
          title: songTitle,
          artist: songArtist,
          duration: "3:45",
        },
        voiceNote: {
          duration: "02:00",
          noteText: voiceNoteText,
        },
      };

      const res = await fetch(`/api/gifts/${token}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftData: {
            ...giftPayload,
            template: selectedTemplate,
            ...(/^\d{4}$/.test(pinCode) ? { pinCode } : {}),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Lỗi lưu thiệp");
      }

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#721a28", "#ffd700", "#fea095", "#ffffff"],
      });

      // Redirect to view the completed gift
      setTimeout(() => {
        router.push(`/g/${token}?tpl=${selectedTemplate}`);
      }, 1200);
    } catch (err: any) {
      alert(err.message || "Không thể lưu thiệp kỷ niệm");
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-cream flex items-center justify-center p-4 font-serif">
        <div className="text-center">
          <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin inline-block mb-3" />
          <p className="text-sm text-primary font-bold">Đang tải xưởng thiết kế thiệp của bạn...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="min-h-screen bg-rose-cream flex items-center justify-center p-4 font-serif">
        <div className="p-8 rounded-3xl liquid-glass bg-white/90 border border-white/95 max-w-md text-center shadow-xl">
          <span className="material-symbols-outlined text-4xl text-rose-600 mb-2">error</span>
          <h2 className="text-xl font-bold text-primary">
            {needsAuth ? "Cần Nhập OTP Tạo Thiệp" : "Mã Thiệp Không Hợp Lệ"}
          </h2>
          <p className="text-xs text-on-surface-variant font-sans mt-2">{errorMsg || "Không tìm thấy sản phẩm."}</p>
          <Link
            href={needsAuth ? `/gift?tab=create&token=${encodeURIComponent(token)}` : "/gift"}
            className="mt-6 inline-block py-2.5 px-6 rounded-xl liquid-glass-btn-primary text-white text-xs font-bold font-serif"
          >
            {needsAuth ? "Nhập OTP Tạo Thiệp" : "Nhập Lại Mã Khác"}
          </Link>
        </div>
      </div>
    );
  }

  // Mini Preview Template Component
  const renderPreviewContent = () => (
    <div className="w-full rounded-2xl bg-parchment-light p-4 border border-parchment-border space-y-3.5 text-center shadow-inner">
      <span className="text-2xl block">
        {selectedTemplate === "vintage-scrapbook" ? "🌸" : selectedTemplate === "retro-nostalgia" ? "📼" : "🌅"}
      </span>

      {photos.length > 0 && (
        <div className="polaroid-card p-2 bg-white shadow-sm rounded-xs max-w-50 mx-auto transform -rotate-1">
          <div className="aspect-4/3 rounded-xs overflow-hidden bg-slate-100">
            <img src={photos[0]?.url} alt="preview" className="w-full h-full object-cover" />
          </div>
          <p className="font-handwriting text-[10px] text-charcoal-warm mt-1 line-clamp-1">
            {photos[0]?.caption || "Khoảnh khắc đáng nhớ..."}
          </p>
        </div>
      )}

      <div className="bg-white p-3 rounded-xl border border-slate-200 text-left">
        <span className="font-serif font-bold text-xs text-primary block">
          {letterTitle || "LỜI NHẮN"}
        </span>
        {letterSubtitle && (
          <span className="text-[10px] font-sans text-warm-neutral italic block mt-0.5">
            {letterSubtitle}
          </span>
        )}
        <p className="text-[11px] font-serif text-on-surface-variant line-clamp-4 mt-1.5 leading-relaxed">
          "{letterContent}"
        </p>
        <span className="text-[10px] text-primary-container block text-right mt-2 font-bold">
          {letterSignature || "Người bạn dõi theo ♡"}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-warm-neutral px-1 pt-1 border-t border-parchment-border">
        <span>OTP xem: {/^\d{4}$/.test(pinCode) ? "••••" : "giữ nguyên"}</span>
        <span className="text-emerald-700 font-bold">● Sẵn sàng mở</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-cream via-blush-light to-surface-container py-6 sm:py-12 px-3 sm:px-6 lg:px-8 pb-24 font-serif">
      <div className="max-w-280 mx-auto">
        
        {/* Hidden File Input for Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoFileUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Studio Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-primary text-xs font-bold shadow-xs mb-3 border border-white/95">
            <span className="material-symbols-outlined text-[15px] text-amber-500">brush</span>
            <span>XƯỞNG TẠO THIỆP SỐ ĐỘC BẢN • MÃ: {product.token}</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-primary tracking-tight">
            Tự Tay Thiết Kế Cuốn Thiệp Kỷ Niệm 20/10
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-sans mt-2 max-w-2xl mx-auto">
            Chiếc vòng vật lý đã được quầy chuẩn bị. Bây giờ là lúc bạn tự tay viết những lời chân thành, tải ảnh kỷ niệm và chọn giai điệu gửi đến người ấy.
          </p>
        </div>

        {/* Physical Product Banner (What was bought at the counter) */}
        <div className="p-4 sm:p-5 rounded-3xl liquid-glass bg-white/80 border border-white/90 shadow-sm mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-2xl">diamond</span>
            </div>
            <div>
              <span className="text-[10px] font-sans font-bold text-secondary uppercase tracking-wider block">
                Sản phẩm vật lý tại quầy của bạn
              </span>
              <h3 className="font-serif text-sm sm:text-base font-bold text-primary">
                {product.chainName}
              </h3>
              <p className="text-xs font-sans text-on-surface-variant mt-0.5">
                {product.charms.length > 0
                  ? `Kèm ${product.charms.length} charm: ${product.charms.map((c) => c.name).join(", ")}`
                  : "Vòng cơ bản không đính thêm charm"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-3 py-1.5 rounded-xl bg-surface-container-low text-primary-container font-bold border border-rose-petal">
              {product.token}
            </span>
            <span className="text-xs font-sans text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold border border-emerald-200">
              Đã kích hoạt
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT: Customizer Studio Form (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* 1. CHỌN TEMPLATE THIỆP */}
            <div className="p-4 sm:p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-lg bg-primary text-amber-300 text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="font-serif text-base font-bold text-primary">
                  Chọn Phong Cách Mỹ Cảm Thiệp Số
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "vintage-scrapbook" as GiftTemplateId,
                    icon: "🌸",
                    name: "Sổ Hoa Khô",
                    desc: "Giấy vintage, washi tape mộc mạc",
                  },
                  {
                    id: "retro-nostalgia" as GiftTemplateId,
                    icon: "📼",
                    name: "Retro 90s",
                    desc: "Băng cassette, phong cách hoài niệm",
                  },
                  {
                    id: "storybook-sunset" as GiftTemplateId,
                    icon: "🌅",
                    name: "Sunset Anime",
                    desc: "Hoàng hôn lãng mạn, nhẹ nhàng",
                  },
                ].map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      selectedTemplate === tpl.id
                        ? "liquid-glass bg-white/95 border-amber-400 ring-2 ring-primary-container/20 shadow-md scale-[1.02]"
                        : "liquid-glass-card hover:bg-white/80 border-white/70"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{tpl.icon}</span>
                    <h4 className="font-serif text-xs font-bold text-primary">{tpl.name}</h4>
                    <p className="text-[11px] font-sans text-warm-neutral mt-0.5">{tpl.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. THÔNG TIN NGƯỜI NHẬN & NGƯỜI TẶNG */}
            <div className="p-4 sm:p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-lg bg-secondary text-amber-300 text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-serif text-base font-bold text-primary">
                  Tên Người Tặng &amp; Người Nhận
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold text-primary mb-1.5">
                    Tên Bạn (Người Tặng)
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="VD: Hoàng Nam"
                    className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-base sm:text-xs font-sans font-medium text-espresso border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-primary mb-1.5">
                    Tên Người Nhận Món Quà <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="VD: Bảo Ngọc"
                    className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-base sm:text-xs font-sans font-medium text-espresso border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  />
                </div>
              </div>
            </div>

            {/* 3. LỜI NHẮN & BỨC THƯ HOA KHÔ */}
            <div className="p-4 sm:p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary-container text-amber-300 text-xs font-bold flex items-center justify-center">3</span>
                  <h3 className="font-serif text-base font-bold text-primary">
                    Bức Thư Tay Hoa Khô &amp; Trợ Lý AI
                  </h3>
                </div>

                {/* AI tone buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[11px] font-sans text-warm-neutral shrink-0">AI gợi ý:</span>
                  <button
                    type="button"
                    onClick={() => applyAiTone("romantic")}
                    className="px-2.5 py-1 rounded-lg liquid-glass-pill text-[10px] font-sans font-bold text-primary hover:bg-white cursor-pointer shrink-0 border border-white/80"
                  >
                    Người yêu
                  </button>
                  <button
                    type="button"
                    onClick={() => applyAiTone("friend")}
                    className="px-2.5 py-1 rounded-lg liquid-glass-pill text-[10px] font-sans font-bold text-primary hover:bg-white cursor-pointer shrink-0 border border-white/80"
                  >
                    Bạn thân
                  </button>
                  <button
                    type="button"
                    onClick={() => applyAiTone("teacher")}
                    className="px-2.5 py-1 rounded-lg liquid-glass-pill text-[10px] font-sans font-bold text-primary hover:bg-white cursor-pointer shrink-0 border border-white/80"
                  >
                    Thầy cô
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={letterTitle}
                  onChange={(e) => setLetterTitle(e.target.value)}
                  placeholder="Tiêu đề thư..."
                  className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-base sm:text-xs font-serif font-bold text-primary border border-white/90 focus:outline-none"
                />

                <input
                  type="text"
                  value={letterSubtitle}
                  onChange={(e) => setLetterSubtitle(e.target.value)}
                  placeholder="Lời đề từ phụ (tùy chọn)..."
                  className="w-full px-4 py-2 rounded-xl liquid-glass-input text-base sm:text-xs font-sans text-warm-neutral italic border border-white/90 focus:outline-none"
                />

                <div className="relative">
                  <textarea
                    rows={6}
                    maxLength={3000}
                    value={letterContent}
                    onChange={(e) => setLetterContent(e.target.value)}
                    placeholder="Viết những lời nhắn gửi chân thành nhất tại đây..."
                    className="w-full p-4 rounded-2xl liquid-glass-input text-base sm:text-xs font-serif leading-relaxed text-espresso border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] font-sans text-warm-neutral bg-white/70 px-1.5 py-0.5 rounded-md">
                    {letterContent.length}/3000
                  </span>
                </div>

                <input
                  type="text"
                  value={letterSignature}
                  onChange={(e) => setLetterSignature(e.target.value)}
                  placeholder="Chữ ký cuối thư (VD: Người luôn dõi theo bạn ♡)..."
                  className="w-full px-4 py-2 rounded-xl liquid-glass-input text-base sm:text-xs font-serif text-primary-container border border-white/90 text-right focus:outline-none"
                />
              </div>
            </div>

            {/* 4. ALBUM ẢNH POLAROID LẬT 3D */}
            <div className="p-4 sm:p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary text-amber-300 text-xs font-bold flex items-center justify-center">4</span>
                  <h3 className="font-serif text-base font-bold text-primary">
                    Album Ảnh Polaroid Kỷ Niệm (Tối Đa 6 Ảnh)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans text-warm-neutral">
                    {photos.length} / 6 ảnh
                  </span>
                  {photos.length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadTargetIdx(null);
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1 rounded-xl liquid-glass-btn-primary text-white text-xs font-bold font-sans flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">add_photo_alternate</span>
                      <span>Thêm Ảnh</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/85 border border-white/90 shadow-xs space-y-2 relative group">
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center shadow-md cursor-pointer hover:bg-rose-700 z-10"
                      title="Xóa ảnh này"
                    >
                      ✕
                    </button>

                    <div
                      onClick={() => {
                        setUploadTargetIdx(idx);
                        fileInputRef.current?.click();
                      }}
                      className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 cursor-pointer relative group/img"
                      title="Bấm để đổi ảnh khác"
                    >
                      <img src={photo.url} alt="Polaroid" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-sans font-bold">
                        Đổi ảnh khác
                      </div>
                    </div>

                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => {
                        const newPhotos = [...photos];
                        newPhotos[idx].caption = e.target.value;
                        setPhotos(newPhotos);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-base sm:text-xs font-sans border border-slate-200 focus:outline-none"
                      placeholder="Lời tựa ảnh..."
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 5. VOICE NOTE & MÃ PIN */}
            <div className="p-4 sm:p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-lg bg-secondary text-amber-300 text-xs font-bold flex items-center justify-center">5</span>
                <h3 className="font-serif text-base font-bold text-primary">
                  Voice Note Thì Thầm &amp; OTP Xem Thiệp (4 Số)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-sans font-bold text-primary">
                      Lời Thoại Voice Note Thì Thầm
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleRecord}
                      className={`text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-all ${
                        isRecording
                          ? "bg-rose-600 text-white animate-pulse"
                          : "bg-amber-100 text-primary hover:bg-amber-200"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {isRecording ? "stop" : "mic"}
                      </span>
                      <span>{isRecording ? `Dừng (${recordSeconds}s)` : "Thu âm thử"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={voiceNoteText}
                    onChange={(e) => setVoiceNoteText(e.target.value)}
                    className="w-full p-3 rounded-xl liquid-glass-input text-base sm:text-xs font-sans text-espresso border border-white/90 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-primary mb-1.5">
                    Đổi OTP xem thiệp 4 số (Để trống = giữ nguyên)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPinCode(val);
                    }}
                    placeholder="••••"
                    className="w-full px-4 py-2.5 rounded-xl liquid-glass-input font-mono font-bold text-center tracking-widest text-xl text-primary border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  />
                  <span className="text-[11px] font-sans text-warm-neutral mt-1 block">
                    Người nhận sẽ nhập 4 số này cùng mã thiệp để xem thiệp. Nếu để trống, OTP in trên thẻ vẫn được giữ nguyên.
                  </span>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="button"
              onClick={handleSaveGift}
              disabled={isSaving}
              className="w-full py-4 rounded-2xl liquid-glass-btn-primary text-white font-serif font-bold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang Khóa &amp; Kích Hoạt Thiệp Số...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl text-amber-300">verified</span>
                  <span>HOÀN TẤT &amp; KÍCH HOẠT THIỆP SỐ CHO NGƯỜI NHẬN</span>
                </>
              )}
            </button>

          </div>

          {/* RIGHT: Live Preview Card (Desktop Sticky) */}
          <div className="hidden lg:flex lg:col-span-4 lg:sticky lg:top-8 flex-col gap-4">
            <div className="p-5 rounded-3xl liquid-glass border-2 border-white/95 shadow-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                XEM TRƯỚC BẢN THẢO THIỆP
              </span>
              <h3 className="font-serif text-sm font-bold text-primary mb-3">
                Gửi Đến: {recipientName || "Người nhận"}
              </h3>

              {renderPreviewContent()}

              <div className="mt-3.5 text-[11px] font-sans text-warm-neutral leading-relaxed">
                Sau khi bấm <strong>Hoàn Tất</strong>, người nhận chỉ cần quét mã QR trên thẻ mạ vàng của chiếc hộp quà là thiệp sẽ bung mở với đúng nội dung bạn vừa soạn!
              </div>
            </div>
          </div>

        </div>

        {/* MOBILE FLOATING PREVIEW BUTTON (lg:hidden) */}
        <button
          type="button"
          onClick={() => setShowMobilePreview(true)}
          className="lg:hidden fixed bottom-5 right-5 z-40 px-4 py-3 rounded-full bg-primary text-white shadow-2xl flex items-center gap-2 border border-amber-300/40 cursor-pointer active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-lg text-amber-300">visibility</span>
          <span className="text-xs font-bold font-serif">Xem Bản Thảo</span>
        </button>

        {/* MOBILE PREVIEW MODAL */}
        {showMobilePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm p-5 rounded-4xl liquid-glass bg-white/95 border-2 border-white/90 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/80">
                <span className="font-serif text-sm font-bold text-primary">
                  Bản Thảo Thiệp Gửi {recipientName}
                </span>
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {renderPreviewContent()}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMobilePreview(false)}
                  className="flex-1 py-2.5 rounded-xl liquid-glass-pill text-primary font-serif font-bold text-xs border border-white/80"
                >
                  Sửa Tiếp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMobilePreview(false);
                    handleSaveGift();
                  }}
                  className="flex-1 py-2.5 rounded-xl liquid-glass-btn-primary text-white font-serif font-bold text-xs"
                >
                  Kích Hoạt Ngay
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

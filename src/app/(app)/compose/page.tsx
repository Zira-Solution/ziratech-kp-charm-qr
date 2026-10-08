"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export default function ComposePage() {
  // View mode: Phone frame vs Full screen
  const [phoneFrameMode, setPhoneFrameMode] = useState(true);

  // Curtain Menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Recipient selection (Section 3.1)
  const [recipient, setRecipient] = useState<"her" | "him" | "mom" | "bf" | "sl">("her");

  const RQ: Record<string, string> = {
    her: "“Nàng mang tiếng cười soi sáng từng góc khuất trong tâm hồn bạn. Một kỷ vật dịu dàng bao bọc nàng trong tất cả sự chở che.”",
    him: "“Sự điềm tĩnh vững chãi và những ký ức lắng đọng. Một vật phẩm tinh tế đồng hành cùng chàng trên mọi hành trình.”",
    mom: "“Từng mối nối là lời tri ân gửi đến đức hy sinh vô bờ của mẹ. Một bảo vật vĩnh cửu như chính tình mẫu tử thiêng liêng.”",
    bf: "“Người cất giữ mọi bí mật đêm muộn và những ước mơ hoang dại nhất. Gắn kết bền chặt dù cách xa vạn dặm.”",
    sl: "“Ngôn từ có thể dừng lại nhưng xúc cảm là bất tận. Khắc ghi trọn đời bằng một kỷ vật duy nhất.”",
  };

  // Giver info (Section 3.2 & 3.3)
  const [giverName, setGiverName] = useState("");
  const [recipName, setRecipName] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState(
    "Gửi người luôn mang lại bình yên cho mình. Chúc em ngày 20/10 ngập tràn niềm vui và những điều ngọt ngào nhất! ❤️"
  );
  const [hasNote, setHasNote] = useState(true);

  // AI Assistant states
  const [aiStatus, setAiStatus] = useState("");
  const [showIdeas, setShowIdeas] = useState(false);
  const aiIdeas = [
    "Kỷ niệm buổi hẹn hò đầu tiên dưới tán cây sảnh Beta ĐH FPT",
    "Lời cảm ơn vì đã luôn thức cùng nhau gánh deadline những đêm muộn",
    "Lời hẹn ước cùng nhau đón mọi mùa thu rực rỡ phía trước",
  ];

  const handleAiWrite = () => {
    setAiStatus("AI đang soạn tâm tình...");
    setTimeout(() => {
      const sample =
        recipient === "mom"
          ? "Con cảm ơn Mẹ vì tất cả sự hy sinh thầm lặng. Mong chiếc vòng nhỏ này thay con gửi đến Mẹ vạn lời chúc bình an và sức khỏe!"
          : recipient === "bf"
          ? "Cảm ơn vì đã luôn kề vai sát cánh cùng tao qua mọi thăng trầm thanh xuân. Mãi là người bạn tri kỷ tuyệt vời nhất nhé!"
          : "Gửi cô gái mang nụ cười ấm áp nhất. Chiếc vòng nhỏ này gói trọn yêu thương và sự đồng hành của anh trên mọi chặng đường.";
      setNote(sample);
      setAiStatus("");
    }, 700);
  };

  const handleAiPolish = () => {
    if (!note.trim()) {
      alert("Hãy viết vài dòng trước để AI trau chuốt giúp bạn nhé!");
      return;
    }
    setAiStatus("AI đang trau chuốt câu từ...");
    setTimeout(() => {
      setNote(`“${note.replace(/[“”]/g, "").trim()} — Khắc ghi trọn vẹn trong từng hạt charm kỷ niệm.”`);
      setAiStatus("");
    }, 600);
  };

  const handlePickIdea = (ideaText: string) => {
    setNote(`“Nhớ về ${ideaText.toLowerCase()}. Cảm ơn vì đã luôn ở bên mình, 20/10 thật hạnh phúc nhé!”`);
    setShowIdeas(false);
  };

  // Voice Studio (Section 3.4)
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(42);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds((prev) => (prev >= 120 ? 120 : prev + 1));
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setVoiceSeconds(0);
      setIsRecording(true);
      setIsPlayingVoice(false);
    }
  };

  const handleResetVoice = () => {
    setIsRecording(false);
    setIsPlayingVoice(false);
    setVoiceSeconds(0);
  };

  const formatVoiceTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Polaroid photos (Section 3.5)
  const [photos, setPhotos] = useState<any[]>([
    {
      title: "Bình minh Phú Quốc",
      sub: "Mùa hè 2024",
      rot: "-rotate-1",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVIHfOVV70vbji5oJ8YUC_bKEq2tLX5Ty_WhRRQPpAR2KgCCUfM7SYTc6mqkfDoAskBYAD_QMiUGl1KWoSJD-e-2MtM6FFDyZNjqJYocddCQcZ3CI6AZC8AO42udXSkXUrpicRwN3rAIBneczLHXMa_eBkKtJvLNvC-OxxiHq504kHmv7VflvIDWFuJO8uVAIBtsjLG30qY3dzaZBaTeaO2ospR3VA4zAdqGfQsK_OjqYAIy8HaZc-",
    },
    {
      title: "Chiều mưa đầu tiên",
      sub: "Góc phố thân quen",
      rot: "rotate-2",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxciCJuy8pJ2TRE-ICLsfriz7_u-X85DxbIFS8xwRUZ_vNjuWIU1yGG1G2C5_uXtOWRbvO4XslFwLurM1MvSwKI2q3MI7Lsx88jvNvyHQy_5w-oK-fl1-W-ZXReG9ZRVISudheC83J3OOydAep-ksizuHuOBdRJDilCUKkZa3wKpGa-PetL4Tijy1FkJ0-YJTDtuTv6FBYQmGDjkiFrt29u_u0tZdMZFE0lrMyA_Mr0hRn2Ckun__j",
    },
  ]);
  const [photoAdded, setPhotoAdded] = useState(false);

  const handleAddPhoto = () => {
    if (photoAdded) return;
    setPhotos((prev) => [
      ...prev,
      {
        title: "Đêm ngắm pháo hoa",
        sub: "Vừa thêm vào thẻ NFC",
        rot: "rotate-1",
        img: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80",
      },
    ]);
    setPhotoAdded(true);
  };

  // Memory song (Section 3.6)
  const [song, setSong] = useState("Có Chàng Trai Viết Lên Cây — Phan Mạnh Quỳnh");
  const [isPlayingSong, setIsPlayingSong] = useState(false);

  // Charm storytelling (Section 4)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("vintage-scrapbook");
  const [activeCharm, setActiveCharm] = useState<"love" | "memory" | "always" | "dream">("love");
  const CH = {
    love: {
      title: "I. Charm TÌNH YÊU",
      tag: "Trái Tim Gắn Kết",
      story:
        "“Dành cho những khoảnh khắc bạn không bao giờ muốn quên. Chạm hạt charm này vào điện thoại sẽ mở ra thước phim mở hộp đầu tiên và bản tình ca của hai người.”",
    },
    memory: {
      title: "II. Charm KỶ NIỆM",
      tag: "Hộp Ký Ức Thầm Kín",
      story:
        "“Bến đỗ bình yên cho những lời thì thầm ngọt ngào. Nơi lưu trữ lời nhắn giọng nói chân thành, những ngày kỷ niệm và album ảnh bí mật.”",
    },
    always: {
      title: "III. Charm VĨNH CỬU",
      tag: "Hiện Diện Bất Biến",
      story:
        "“Sự hiện diện vĩnh cửu, vượt qua mọi khoảng cách không gian. Thắp sáng màn hình điện thoại người thương bằng nhịp tim trực tiếp bất kể nơi đâu.”",
    },
    dream: {
      title: "IV. Charm ƯỚC MƠ",
      tag: "Ngôi Sao Hy Vọng",
      story:
        "“Lòng can đảm cùng nhau chạm đến những vì sao. Một trang nhật ký mục tiêu chung tự động cập nhật mỗi khi cả hai cùng tạo nên cột mốc mới.”",
    },
  };

  // 4 Assembly steps with heart burst
  const [assemblyStep, setAssemblyStep] = useState(1);
  const [bursting, setBursting] = useState(false);

  const stepDetails = [
    {
      num: 1,
      badge: "Bước 1 · Dây cơ bản",
      title: "Dây Bạc Ý Thủ Công S925",
      desc: "Nghệ nhân định hình vòng chuỗi liên kết bạc sáng bóng, tạo nền tảng vững chắc cho mọi hạt charm.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGl7_lr9CnN-rtSmfLd8An-0tkU0vojIwjU5eZy4VMrNiAsaSrbEHEdVRjMwCd5x-uHrSXydrz0e2mqtgGxlB6lg7f7cIJ4r0AfwPT0Kjg9A2SCtCC4bDEKPiwaGbo60e9gHfutPOkmLZiEy0w50C7JLBwc5aUEFix-319W_zSbBGZ3kvWlvOkg-WJdz2MuFh0hCvQBvu4LFAXmDftBZSTJTOWKyrQSmjigp_pqgRV8rtVPSb98Ong",
    },
    {
      num: 2,
      badge: "Bước 2 · Charm Tình Yêu",
      title: "Trái Tim Ánh Hồng Chạm Khắc",
      desc: "Đính kết charm trái tim đầu tiên, gửi gắm trọn vẹn tình cảm nồng nàn đến người nhận.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsKwfyjXIAAQVbYTQduBxsQ0kzqAoH405MlONocxuSge_7cpBvVnMyuzXgmwMvwAnHrmYxRNH8naxbEP0r2Y7x4PBa9HI5uMBmneR5Xc_hZV1j9KKD_tcLJ8HP2QRbFdyV5Za6KyJV-mG6BcK1eoimFybquvNUHDxXgtG25A8CYWWPWMOiQ3sKcVeoLzUeU73vSJ_mvr_U8h07ikxb2GOUDj5uMHlcLclqTMMAtAf_Lp0au6ufVatt",
    },
    {
      num: 3,
      badge: "Bước 3 · Charm Kỷ Niệm",
      title: "Hộp Ký Ức & Tinh Thể Áo",
      desc: "Lồng ghép những cột mốc đáng nhớ, lưu giữ những chiều đón đưa và ngày kỷ niệm chung.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCLB9jNl9PK2_Ybg7Wp9k3dNbJDNqWLgBZiyNrMpmiSe05kkwONHPcfwMT_6fY88eUucouWbV5q-3pARfuEwrudgdy9VTHiEsmY2NkL3_-5SlSKhaLwXqMeV7JBiPIjr4Mj7_6DhRUXQH2Yz1Lt3D9WJyN9Glxi3utYCaXOMJUEGzR0o9iy57RAAxl7W-AdrznKR0qdTiPmD0460l5newas3dckcX-aqlNm3mAH3Zk0Qgskb6zQQmt",
    },
    {
      num: 4,
      badge: "Bước 4 · Khóa Gia Bảo & Kích Hoạt",
      title: "Hoàn Thiện & Mã Hóa Thẻ QR",
      desc: "Chốt khóa độc bản #204 được niêm phong, dữ liệu số sẵn sàng bừng sáng khi người ấy mở quà.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAh7fcYa3LaSZhHY0_xHt3MVZK4kymdDVuiI8QJcXYXfM--Qho0ZBAJSp50KKeH2PLoxzGh5H32l4D6UobcGfgZ11ntYKS4qHU99itxAItxjdSWNTIMAxjVR9601oAuoCxNCyiqUB3bdHoOWvk5tHFpWc7jovHXlxPR97HUPhqX-VAdtGothlBgmyfPyb-iwjK0-6J3IhycFdnHykb28plMtUfzJPc7vsGZhVDYuyNtlTEw8EijSnKa",
    },
  ];

  const handleNextAssembly = () => {
    if (assemblyStep < 4) {
      setAssemblyStep(assemblyStep + 1);
      if (assemblyStep + 1 === 4) {
        setBursting(true);
        setTimeout(() => setBursting(false), 2400);
      }
    } else {
      setAssemblyStep(1);
    }
  };

  // Sticky CTA bar auto hide on scroll down
  const [showStickyCta, setShowStickyCta] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
        setShowStickyCta(false);
      } else {
        setShowStickyCta(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tap-to-spawn floating hearts
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const handleTapScreen = (e: React.MouseEvent) => {
    const heart = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
    };
    setFloatingHearts((prev) => [...prev.slice(-12), heart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heart.id));
    }, 1000);
  };

  const appContent = (
    <div
      onClick={handleTapScreen}
      className="flex flex-col min-h-screen w-full bg-[#fff8f6] text-[#221a18] relative select-none"
    >
      {/* Floating Hearts Particle Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingHearts.map((h) => (
          <span
            key={h.id}
            style={{ left: `${h.x - 10}px`, top: `${h.y - 10}px` }}
            className="fixed material-symbols-outlined text-[20px] text-[#540114] animate-ping"
          >
            favorite
          </span>
        ))}
      </div>

      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#fff8f6]/90 backdrop-blur-xl border-b border-[#dcc0c0]/30 shadow-xs">
        <div className="h-16 px-5 max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center tracking-widest text-[#540114] font-serif text-2xl font-bold"
          >
            K<span className="text-[#934841] text-sm font-sans mx-0.5">&amp;</span>P
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#564243] hover:text-[#540114] bg-[#fceae6]/70 transition-colors"
            >
              <span className="uppercase tracking-widest text-[11px]">Menu</span>
              <span className="material-symbols-outlined text-[16px] text-[#540114] animate-pulse">
                favorite
              </span>
            </button>

            <Link
              href="/"
              className="w-8 h-8 rounded-full bg-[#540114] text-white flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Full-screen Curtain Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#fff8f6] flex flex-col justify-between p-6 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between">
            <span className="tracking-widest text-[#540114] font-serif text-2xl font-bold">
              K<span className="text-[#934841] text-sm font-sans mx-0.5">&amp;</span>P
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 rounded-full bg-[#fceae6] text-[#540114] flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 py-8 text-center">
            <span className="text-xs uppercase tracking-widest text-[#934841] font-bold">
              Mục Lục Kỷ Niệm
            </span>
            <a
              href="#hero-mobile"
              onClick={() => setMenuOpen(false)}
              className="font-serif text-2xl text-[#540114] italic font-semibold hover:opacity-80 py-2"
            >
              Khám Phá
            </a>
            <a
              href="#someone-special"
              onClick={() => setMenuOpen(false)}
              className="font-serif text-2xl text-[#221a18] hover:text-[#540114] py-2"
            >
              Đề Tặng Yêu Thương
            </a>
            <a
              href="#givers-perspective"
              onClick={() => setMenuOpen(false)}
              className="font-serif text-2xl text-[#221a18] hover:text-[#540114] py-2"
            >
              Soạn Lời Nhắn &amp; Voice
            </a>
            <a
              href="#charms-section"
              onClick={() => setMenuOpen(false)}
              className="font-serif text-2xl text-[#221a18] hover:text-[#540114] py-2"
            >
              Hạt Charm Kỷ Niệm
            </a>
            <a
              href="#assembly-section"
              onClick={() => setMenuOpen(false)}
              className="font-serif text-2xl text-[#221a18] hover:text-[#540114] py-2"
            >
              Chế Tác Tương Tác
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            className="w-full h-14 bg-[#540114] text-white rounded-full font-semibold text-sm shadow-xl flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">favorite</span>
            <span>Chế Tác Lời Đề Tặng Riêng</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full pt-16 pb-28">
        {/* HERO SECTION MOBILE */}
        <section id="hero-mobile" className="w-full px-5 pt-8 pb-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fceae6] shadow-xs mb-5">
            <span className="material-symbols-outlined text-[14px] text-[#540114] animate-pulse">
              favorite
            </span>
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#540114]">
              K&amp;P Atelier · Chương I
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-[#221a18] tracking-tight max-w-xs mx-auto leading-tight mb-3 font-bold">
            Hơn cả một món quà.<br />
            <em className="italic text-[#540114] font-normal">Một câu chuyện lưu giữ mãi mãi.</em>
          </h1>

          <p className="text-xs text-[#564243] max-w-xs mx-auto mb-6 leading-relaxed">
            Chiếc vòng tay gia bảo đúc thủ công. Một vũ trụ kỷ niệm số ẩn sau từng hạt charm chạm khắc.
          </p>

          {/* Visual Showcase Card */}
          <div className="relative w-full max-w-xs aspect-[4/5] mx-auto rounded-3xl bg-white p-3 shadow-xl mb-6 border border-[#dcc0c0]/50 overflow-hidden group">
            <img
              alt="Vòng tay gia bảo K&P"
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCLB9jNl9PK2_Ybg7Wp9k3dNbJDNqWLgBZiyNrMpmiSe05kkwONHPcfwMT_6fY88eUucouWbV5q-3pARfuEwrudgdy9VTHiEsmY2NkL3_-5SlSKhaLwXqMeV7JBiPIjr4Mj7_6DhRUXQH2Yz1Lt3D9WJyN9Glxi3utYCaXOMJUEGzR0o9iy57RAAxl7W-AdrznKR0qdTiPmD0460l5newas3dckcX-aqlNm3mAH3Zk0Qgskb6zQQmt"
            />
            <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center gap-1.5 border border-[#ffdad6]">
              <span className="w-2 h-2 rounded-full bg-[#540114] animate-ping" />
              <span className="text-[10px] font-bold text-[#540114] uppercase">Thẻ QR &amp; NFC</span>
            </div>
            <div className="absolute bottom-5 right-5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center gap-1 border border-[#ffdad6]">
              <span className="material-symbols-outlined text-[13px] text-[#540114]">lock_open</span>
              <span className="text-[10px] font-semibold text-[#564243]">Bí mật số</span>
            </div>
          </div>

          <a
            href="#someone-special"
            className="w-full max-w-xs h-14 rounded-full bg-[#540114] text-white flex items-center justify-center gap-2 shadow-lg font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform"
          >
            <span>KHÁM PHÁ K&amp;P</span>
            <span className="material-symbols-outlined text-[16px] text-[#fea095]">favorite</span>
          </a>
        </section>

        {/* SECTION 1: CHỌN NGƯỜI NHẬN (5 PERSONAS) */}
        <section id="someone-special" className="w-full px-5 py-12 bg-[#fff0ed]">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <span className="text-[11px] uppercase tracking-widest text-[#934841] font-bold block mb-1">
                Đề Tặng Yêu Thương
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#221a18]">
                Dành cho người thương đặc biệt.
              </h2>
              <p className="text-xs text-[#564243] mt-1 italic">
                Chạm để chọn người đang ngự trị trong tâm trí bạn hôm nay:
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#dcc0c0]/50 space-y-2.5">
              {[
                { id: "her", label: "Cho nàng." },
                { id: "him", label: "Cho chàng." },
                { id: "mom", label: "Cho mẹ kính yêu." },
                { id: "bf", label: "Cho bạn thân tri kỷ." },
                { id: "sl", label: "Cho người tôi thầm thương." },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRecipient(item.id as any)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    recipient === item.id
                      ? "bg-[#fff0ed] border-[#540114] text-[#540114] font-bold shadow-xs"
                      : "bg-[#fff8f6] border-[#dcc0c0]/40 text-[#221a18] hover:bg-[#fceae6]"
                  }`}
                >
                  <span className="font-serif text-sm">{item.label}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      recipient === item.id ? "bg-[#540114] text-white" : "bg-[#fceae6] text-[#897172]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">favorite</span>
                  </div>
                </button>
              ))}

              <div className="mt-4 p-3.5 rounded-xl bg-[#fff0ed] border border-[#dcc0c0]/40">
                <p className="text-xs italic text-[#564243] leading-relaxed">
                  {RQ[recipient]}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: GÓC NHÌN NGƯỜI TẶNG (INPUTS, AI, VOICE, PHOTOS, MUSIC) */}
        <section id="givers-perspective" className="w-full px-5 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <span className="text-[11px] uppercase tracking-widest text-[#934841] font-bold block mb-1">
                Góc Nhìn Người Tặng
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#221a18]">
                Bạn là ai trong câu chuyện này?
              </h2>
              <p className="text-xs text-[#564243] mt-1 italic">
                Cung cấp ngữ cảnh để AI trau chuốt lời chúc và giai điệu mở hộp riêng biệt.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#dcc0c0]/50 space-y-5">
              {/* 3 Identifiers */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#564243] block mb-1">
                    Tên của bạn / Danh xưng đặc biệt
                  </label>
                  <input
                    type="text"
                    value={giverName}
                    onChange={(e) => setGiverName(e.target.value)}
                    placeholder="VD: Minh Triết, Chàng ngốc của em..."
                    className="w-full h-11 px-3 rounded-xl bg-[#fff8f6] border border-[#dcc0c0]/50 text-xs text-[#221a18] focus:outline-none focus:ring-1 focus:ring-[#540114]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#564243] block mb-1">
                    Tên người nhận
                  </label>
                  <input
                    type="text"
                    value={recipName}
                    onChange={(e) => setRecipName(e.target.value)}
                    placeholder="VD: Linh Đan, Em bé của anh..."
                    className="w-full h-11 px-3 rounded-xl bg-[#fff8f6] border border-[#dcc0c0]/50 text-xs text-[#221a18] focus:outline-none focus:ring-1 focus:ring-[#540114]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#564243] block mb-1">
                    Xưng hô
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="VD: Anh – Em, Tớ – Cậu..."
                    className="w-full h-11 px-3 rounded-xl bg-[#fff8f6] border border-[#dcc0c0]/50 text-xs text-[#221a18] focus:outline-none focus:ring-1 focus:ring-[#540114]"
                  />
                </div>
              </div>

              {/* Lời nhắn & 4 nút AI */}
              <div className="pt-2 border-t border-[#fceae6] space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#564243] block">
                  Lời nhắn gửi gắm
                </label>

                {hasNote ? (
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#fff8f6] border border-[#dcc0c0]/50 text-xs text-[#221a18] focus:outline-none focus:ring-1 focus:ring-[#540114] resize-none"
                    placeholder="Viết những lời chân thành từ trái tim..."
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-[#fff0ed] border border-dashed border-[#dcc0c0] text-xs text-[#897172] italic text-center">
                    Món quà sẽ được gửi đi không kèm lời nhắn chữ.
                  </div>
                )}

                {/* 4 Tool buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    disabled={!hasNote}
                    onClick={handleAiWrite}
                    className="px-3 py-1.5 rounded-full bg-[#fceae6] text-[#540114] text-xs font-bold hover:bg-[#ffdad6] transition-colors flex items-center gap-1 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                    AI viết giúp
                  </button>
                  <button
                    disabled={!hasNote}
                    onClick={() => setShowIdeas(!showIdeas)}
                    className="px-3 py-1.5 rounded-full bg-[#fceae6] text-[#540114] text-xs font-bold hover:bg-[#ffdad6] transition-colors flex items-center gap-1 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[15px]">lightbulb</span>
                    Gợi ý ý tưởng
                  </button>
                  <button
                    disabled={!hasNote}
                    onClick={handleAiPolish}
                    className="px-3 py-1.5 rounded-full bg-[#fceae6] text-[#540114] text-xs font-bold hover:bg-[#ffdad6] transition-colors flex items-center gap-1 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    Trau chuốt
                  </button>
                  <button
                    onClick={() => setHasNote(!hasNote)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      !hasNote ? "bg-[#540114] text-white" : "bg-[#fceae6] text-[#564243]"
                    }`}
                  >
                    {!hasNote ? "✓ Đã ẩn lời nhắn" : "Không để lời nhắn"}
                  </button>
                </div>

                {aiStatus && <p className="text-[11px] text-[#934841] italic animate-pulse">{aiStatus}</p>}

                {showIdeas && (
                  <div className="p-3 rounded-xl bg-[#fff0ed] border border-[#dcc0c0]/40 space-y-1.5 mt-2">
                    <span className="text-[10px] uppercase font-bold text-[#934841] block">
                      Chạm ý tưởng để đưa vào lời nhắn:
                    </span>
                    {aiIdeas.map((idea, i) => (
                      <button
                        key={i}
                        onClick={() => handlePickIdea(idea)}
                        className="w-full text-left p-2 rounded-lg bg-white text-xs text-[#221a18] hover:bg-[#fceae6] border border-[#dcc0c0]/30 transition-colors"
                      >
                        • {idea}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice Studio (Section 3.4) */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#fceae6] to-[#fff0ed] border border-[#ffdad6] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#540114] text-[20px]">mic</span>
                    <h3 className="font-serif text-sm font-bold text-[#540114]">Lời Nhắn Giọng Nói</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#76322b] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                    Voice Studio
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#dcc0c0]/40 flex flex-col items-center gap-2">
                  {/* Waveform Visualizer */}
                  <div className="flex items-center justify-center gap-1 h-8 w-full">
                    {[35, 60, 85, 45, 95, 75, 40, 90, 65, 50, 80, 30].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isRecording
                            ? "bg-[#540114] animate-pulse"
                            : "bg-[#dcc0c0]"
                        }`}
                        style={{ height: `${isRecording ? h : 20}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center w-full text-[11px] text-[#564243] font-mono">
                    <span className="flex items-center gap-1">
                      {isRecording && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                      {formatVoiceTime(voiceSeconds)}
                    </span>
                    <span>Tối đa: 02:00</span>
                  </div>

                  {/* 3 Voice buttons */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={handleResetVoice}
                      title="Ghi lại từ đầu"
                      className="w-9 h-9 rounded-full bg-[#fceae6] text-[#540114] flex items-center justify-center hover:bg-[#ffdad6]"
                    >
                      <span className="material-symbols-outlined text-[16px]">replay</span>
                    </button>

                    <button
                      onClick={toggleRecording}
                      className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                        isRecording
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-[#540114] text-white hover:bg-[#721a28]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isRecording ? "stop" : "fiber_manual_record"}
                      </span>
                      <span>{isRecording ? "Dừng thu" : "Ghi âm"}</span>
                    </button>

                    <button
                      onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                      className="w-9 h-9 rounded-full bg-[#ffdad6] text-[#540114] flex items-center justify-center hover:bg-[#fea095]"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isPlayingVoice ? "pause" : "play_arrow"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Polaroid Gallery (Section 3.5) */}
              <div className="p-4 rounded-2xl bg-[#fff0ed] border border-[#dcc0c0]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#540114] text-[20px]">photo_library</span>
                    <h3 className="font-serif text-sm font-bold text-[#540114]">Ảnh Kỷ Niệm Polaroid</h3>
                  </div>
                  <span className="text-[10px] text-[#897172]">{photos.length} khoảnh khắc</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {photos.map((p, idx) => (
                    <div
                      key={idx}
                      className={`bg-white p-2 rounded-xl shadow-xs border border-[#dcc0c0]/40 ${p.rot} hover:rotate-0 transition-transform`}
                    >
                      <div className="aspect-square bg-[#fceae6] rounded-lg overflow-hidden mb-1.5">
                        <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] font-bold text-[#221a18] truncate">{p.title}</p>
                      <span className="text-[9px] text-[#897172] block">{p.sub}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddPhoto}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    photoAdded
                      ? "bg-white text-emerald-700 border-emerald-300"
                      : "bg-white text-[#540114] border-[#dcc0c0] hover:bg-[#fceae6]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {photoAdded ? "check" : "add_photo_alternate"}
                  </span>
                  <span>{photoAdded ? "✓ Đã đính kèm ảnh kỷ niệm" : "+ Thêm ảnh kỷ niệm vào chip NFC"}</span>
                </button>
              </div>

              {/* Memory Song (Section 3.6) */}
              <div className="p-4 rounded-2xl bg-[#fff0ed] border border-[#dcc0c0]/40 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#540114] text-[20px]">music_note</span>
                  <h3 className="font-serif text-sm font-bold text-[#540114]">Bản Nhạc Của Chúng Ta</h3>
                </div>

                <input
                  type="text"
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                  placeholder="Tên bài hát hoặc link YouTube / Spotify..."
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#dcc0c0]/40 text-xs text-[#221a18] focus:outline-none"
                />

                {song && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#dcc0c0]/30">
                    <button
                      onClick={() => setIsPlayingSong(!isPlayingSong)}
                      className="w-8 h-8 rounded-full bg-[#540114] text-white flex items-center justify-center shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isPlayingSong ? "pause" : "play_arrow"}
                      </span>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#221a18] truncate">{song}</p>
                      <span className="text-[9px] text-[#897172]">
                        {isPlayingSong ? "Đang phát thử..." : "Phát khi mở quà"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Recipient Template Selection (3 Templates from user's spec) */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#fceae6] to-[#fff0ed] border border-[#ffdad6] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#540114] text-[20px]">style</span>
                    <h3 className="font-serif text-sm font-bold text-[#540114]">Giao Diện Người Nhận Mở Quà</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#76322b] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                    3 Mẫu 20/10
                  </span>
                </div>

                <p className="text-[11px] text-[#564243] leading-relaxed">
                  Chọn phong cách câu chuyện số mà người nhận sẽ khám phá khi quét mã QR trên vòng tay:
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate("vintage-scrapbook")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-between transition-all ${
                      selectedTemplate === "vintage-scrapbook"
                        ? "bg-white border-[#8b263e] ring-2 ring-[#8b263e]/30 shadow-sm"
                        : "bg-white/60 border-[#dcc0c0]/50 hover:bg-white"
                    }`}
                  >
                    <span className="text-xl mb-1">🌸</span>
                    <span className="text-[10px] font-bold text-[#540114] text-center">Sổ Kỷ Niệm</span>
                    <span className="text-[8px] text-[#897172] text-center">Washi Tape</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate("retro-nostalgia")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-between transition-all ${
                      selectedTemplate === "retro-nostalgia"
                        ? "bg-white border-[#c13d28] ring-2 ring-[#c13d28]/30 shadow-sm"
                        : "bg-white/60 border-[#dcc0c0]/50 hover:bg-white"
                    }`}
                  >
                    <span className="text-xl mb-1">🎞️</span>
                    <span className="text-[10px] font-bold text-[#540114] text-center">Hoài Niệm</span>
                    <span className="text-[8px] text-[#897172] text-center">Poster 90s</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate("storybook-sunset")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-between transition-all ${
                      selectedTemplate === "storybook-sunset"
                        ? "bg-white border-[#2b4c6f] ring-2 ring-[#2b4c6f]/30 shadow-sm"
                        : "bg-white/60 border-[#dcc0c0]/50 hover:bg-white"
                    }`}
                  >
                    <span className="text-xl mb-1">🌅</span>
                    <span className="text-[10px] font-bold text-[#540114] text-center">Thanh Xuân</span>
                    <span className="text-[8px] text-[#897172] text-center">Anime Sunset</span>
                  </button>
                </div>

                <Link
                  href={`/g/demo-token?tpl=${selectedTemplate}`}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#dcc0c0] text-[#540114] hover:bg-[#fff0ed] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Xem trước trang mở quà ({selectedTemplate === "vintage-scrapbook" ? "Sổ Kỷ Niệm" : selectedTemplate === "retro-nostalgia" ? "Hoài Niệm" : "Thanh Xuân"})</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: BIỂU TƯỢNG XÚC CẢM - 4 CHARM STORYTELLING */}
        <section id="charms-section" className="w-full px-5 py-12 bg-[#fff0ed]">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="text-center mb-6">
              <span className="text-[11px] uppercase tracking-widest text-[#934841] font-bold block mb-1">
                Biểu Tượng Xúc Cảm
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#221a18]">
                Mỗi chiếc charm là một câu chuyện.
              </h2>
              <p className="text-xs text-[#564243] mt-1">
                Chạm vào từng hạt charm để khám phá ý nghĩa riêng biệt.
              </p>
            </div>

            <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#dcc0c0]/50 flex flex-col items-center">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#fceae6] mb-4">
                <img
                  alt="Bốn hạt charm K&P"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsKwfyjXIAAQVbYTQduBxsQ0kzqAoH405MlONocxuSge_7cpBvVnMyuzXgmwMvwAnHrmYxRNH8naxbEP0r2Y7x4PBa9HI5uMBmneR5Xc_hZV1j9KKD_tcLJ8HP2QRbFdyV5Za6KyJV-mG6BcK1eoimFybquvNUHDxXgtG25A8CYWWPWMOiQ3sKcVeoLzUeU73vSJ_mvr_U8h07ikxb2GOUDj5uMHlcLclqTMMAtAf_Lp0au6ufVatt"
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5 w-full mb-3">
                {[
                  { key: "love", label: "TÌNH YÊU" },
                  { key: "memory", label: "KỶ NIỆM" },
                  { key: "always", label: "VĨNH CỬU" },
                  { key: "dream", label: "ƯỚC MƠ" },
                ].map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setActiveCharm(c.key as any)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      activeCharm === c.key
                        ? "bg-[#540114] text-white shadow-xs"
                        : "bg-[#fceae6] text-[#564243] hover:bg-[#ffdad6]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="w-full p-3.5 rounded-xl bg-[#fff8f6] border border-[#dcc0c0]/40">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-serif text-xs font-bold text-[#540114]">
                    {CH[activeCharm].title}
                  </h4>
                  <span className="text-[9px] uppercase font-bold text-[#76322b] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                    {CH[activeCharm].tag}
                  </span>
                </div>
                <p className="text-xs text-[#564243] leading-relaxed">{CH[activeCharm].story}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CHẾ TÁC TƯƠNG TÁC 4 BƯỚC */}
        <section id="assembly-section" className="w-full px-5 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <span className="text-[11px] uppercase tracking-widest text-[#934841] font-bold block mb-1">
                Chế Tác Tương Tác
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#221a18]">
                Câu chuyện kết tinh qua từng chiếc charm.
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#dcc0c0]/50 flex flex-col items-center">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#fceae6] mb-4">
                <img
                  src={stepDetails[assemblyStep - 1].img}
                  alt={stepDetails[assemblyStep - 1].title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#540114] text-white text-[10px] font-bold uppercase tracking-wider">
                  {stepDetails[assemblyStep - 1].badge}
                </span>

                {/* Heart Burst Layer when reaching step 4 */}
                {bursting && (
                  <div className="absolute inset-0 bg-[#540114]/20 flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-[64px] text-white animate-bounce">
                      favorite
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <h3 className="font-serif text-base font-bold text-[#540114]">
                  {stepDetails[assemblyStep - 1].title}
                </h3>
                <p className="text-xs text-[#564243] mt-1 leading-relaxed">
                  {stepDetails[assemblyStep - 1].desc}
                </p>
              </div>

              {/* 4 Step navigation pills */}
              <div className="grid grid-cols-4 gap-1.5 w-full mb-4">
                {stepDetails.map((s) => (
                  <button
                    key={s.num}
                    onClick={() => {
                      setAssemblyStep(s.num);
                      if (s.num === 4) {
                        setBursting(true);
                        setTimeout(() => setBursting(false), 2400);
                      }
                    }}
                    className={`py-1 rounded-lg text-[10px] font-semibold transition-all ${
                      assemblyStep === s.num
                        ? "bg-[#540114] text-white font-bold"
                        : "bg-[#fceae6] text-[#564243]"
                    }`}
                  >
                    Bước {s.num}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextAssembly}
                className="w-full py-3 rounded-full bg-[#540114] text-white text-xs font-semibold hover:bg-[#721a28] transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <span>{assemblyStep === 4 ? "Kỷ vật đã trọn vẹn ♥ (Làm lại)" : "Gắn charm tiếp theo →"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 5: KHÓA GIA BẢO SỐ 204 */}
        <section className="w-full px-5 py-8 bg-[#fff0ed]">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-4 shadow-sm border border-[#dcc0c0]/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#934841] block">
                Mã số chế tác độc bản
              </span>
              <p className="font-serif text-sm font-bold text-[#221a18]">
                Khóa gia bảo K&amp;P số 204
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#fceae6] text-[#540114] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom CTA */}
      {showStickyCta && (
        <aside className="fixed bottom-20 inset-x-0 z-40 px-5 pointer-events-none transition-all duration-300">
          <div className="max-w-md mx-auto pointer-events-auto">
            <Link
              href="/#customizer-workspace"
              className="flex items-center justify-center gap-2 h-13 px-6 bg-[#540114] text-white rounded-full shadow-xl hover:bg-[#721a28] active:scale-95 transition-all text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px] text-[#fea095]">favorite</span>
              <span>Tạo Món Quà Của Bạn</span>
            </Link>
          </div>
        </aside>
      )}

      {/* Fixed Bottom Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#dcc0c0]/40 shadow-lg">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          <a
            href="#hero-mobile"
            className="flex flex-col items-center justify-center gap-0.5 text-[#540114] text-[10px] font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            <span>Khám Phá</span>
          </a>
          <a
            href="#charms-section"
            className="flex flex-col items-center justify-center gap-0.5 text-[#564243] hover:text-[#540114] text-[10px] font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">diamond</span>
            <span>Hạt Charm</span>
          </a>
          <a
            href="#assembly-section"
            className="flex flex-col items-center justify-center gap-0.5 text-[#564243] hover:text-[#540114] text-[10px] font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
            <span>Chế Tác</span>
          </a>
          <Link
            href={`/g/demo-token?tpl=${selectedTemplate}`}
            className="flex flex-col items-center justify-center gap-0.5 text-[#564243] hover:text-[#540114] text-[10px] font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            <span>Mở Quà</span>
          </Link>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e9e4e3] flex flex-col items-center justify-center relative">
      {/* Top Floating Control Bar */}
      <div className="fixed top-3 right-4 z-50 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-[#dcc0c0]/60">
        <Link
          href="/"
          className="text-xs font-bold text-[#540114] hover:underline flex items-center gap-1 mr-2"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Về Trang Chủ
        </Link>
        <button
          onClick={() => setPhoneFrameMode(!phoneFrameMode)}
          className="px-3 py-1 rounded-full bg-[#540114] text-white text-xs font-semibold hover:bg-[#721a28] transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[15px]">
            {phoneFrameMode ? "fullscreen" : "stay_current_portrait"}
          </span>
          <span>{phoneFrameMode ? "Toàn màn hình" : "Khung iPhone"}</span>
        </button>
      </div>

      {phoneFrameMode ? (
        /* Phone View Mode (390 x 844 iPhone Frame) matching KP Atelier Phone View */
        <div className="py-10 px-4 flex items-center justify-center w-full min-h-screen">
          <div className="w-[390px] h-[844px] p-3 bg-[#1b1716] rounded-[56px] shadow-[0_30px_80px_rgba(34,26,24,0.35)] relative shrink-0 flex flex-col">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-[22px] left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-[#1b1716] rounded-full z-50 pointer-events-none" />
            {/* Phone Screen Container */}
            <div className="w-full h-full rounded-[44px] overflow-hidden bg-[#fff8f6] relative flex flex-col">
              <div className="flex-1 overflow-y-auto">{appContent}</div>
            </div>
          </div>
        </div>
      ) : (
        /* Full width mobile / responsive mode */
        <div className="w-full max-w-md min-h-screen bg-[#fff8f6] shadow-2xl">{appContent}</div>
      )}
    </div>
  );
}

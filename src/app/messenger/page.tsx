"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

const DEFAULT_MUSIC_URL = "/audio/test-music.wav";

const DEFAULT_MESSAGES: string[] = [
  "Hello bé iu của anh ❤️",
  "Hôm nay là 20/10, ngày phụ nữ Việt Nam nè 🌸",
  "Anh có chuẩn bị một món quà bất ngờ nho nhỏ dành riêng cho em",
  "Cảm ơn em vì đã luôn ở bên cạnh anh, làm cho mỗi ngày trôi qua đều thật ấm áp và ngập tràn hạnh phúc",
  "Chúc công chúa của anh luôn xinh đẹp, rạng rỡ và luôn nở nụ cười thật tươi nhé ✨",
  "Thương em nhiều lắm! 💕",
  "Giữ lá thư nhỏ bên dưới để mở thư tay anh viết riêng cho em nhé 💌",
];

// Sent after the film reel is closed: a line before the voice note and a line after it
const VOICE_LEAD_MESSAGE = "Anh có ghi âm một đoạn nhỏ gửi em, em nghe thử nhé 🎧";
const VOICE_AFTER_MESSAGE = "Anh thương em nhiều lắm, chúc em ngày 20/10 thật vui nha 💕";

// Sent after the letter is closed, pointing at the gift icon
const GIFT_LEAD_MESSAGE = "Còn một món quà nhỏ nữa anh để dành cho em, chạm vào hộp quà bên dưới nhé 🎁";

const DEFAULT_FILM_PHOTOS: string[] = [
  "/images/anime_sunset_couple.jpg",
  "/thamkhao/sunset_couple_clean.jpg",
  "/images/default_lockscreen_girl.jpg",
  "/images/ocean_charm_bracelet.jpg",
  "/images/anime_sunset_gift_box.jpg",
];

interface CustomSettings {
  senderName: string;
  notificationText: string;
  wallpaperUrl: string;
  avatarUrl?: string;
  pin: string;
  enablePin: boolean;
  recipientName: string;
  messages: string[];
  letterTitle: string;
  letterContent: string;
  letterSignature: string;
  customTime: string; // empty means live clock
  showFloatingHearts: boolean;
  filmPhotos: string[];
  filmTitle?: string;
  filmSubtitle?: string;
  giftLeadMessage: string; // sent after the letter is closed, points at the gift
  voiceLeadMessage: string; // sent before the voice note
  voiceAfterMessage: string; // sent after the voice note
  musicUrl: string; // background music while the letter or the film reel is open
  voiceUrl: string; // recorded voice note from the giver; empty means none yet
}

const DEFAULT_SETTINGS: CustomSettings = {
  senderName: "Anh iu ❤️",
  notificationText: "hello bé iu",
  wallpaperUrl: "/images/default_lockscreen_girl.jpg",
  avatarUrl: "/images/default_avatar.png",
  pin: "2010",
  enablePin: true,
  recipientName: "Bé iu",
  messages: DEFAULT_MESSAGES,
  letterTitle: "Gửi công chúa của anh ♡",
  letterContent:
    "Gửi bé iu,\n\nCó những điều viết ra một tin nhắn vẫn chưa đủ, nên anh gửi tặng em trang thiệp nhỏ này cùng món quà kỷ niệm 20/10.\n\nCảm ơn em đã bước vào cuộc sống của anh, làm mọi ngày bình thường đều trở nên thật ấm áp và rực rỡ. Mong nụ cười của em luôn sáng như ánh nắng đầu thu, và mong chúng mình sẽ cùng nhau đi qua thật nhiều mùa thu nữa.\n\nThương em nhiều lắm!",
  letterSignature: "Người luôn yêu và thương em ♡",
  customTime: "",
  showFloatingHearts: true,
  filmPhotos: DEFAULT_FILM_PHOTOS,
  filmTitle: "Những ngày mình bên nhau",
  filmSubtitle: "Dlove",
  giftLeadMessage: GIFT_LEAD_MESSAGE,
  voiceLeadMessage: VOICE_LEAD_MESSAGE,
  voiceAfterMessage: VOICE_AFTER_MESSAGE,
  musicUrl: DEFAULT_MUSIC_URL,
  voiceUrl: "",
};

const VOICE_BARS = [6, 10, 16, 9, 20, 13, 7, 18, 24, 12, 8, 19, 14, 22, 10, 6, 15, 21, 9, 13, 7, 11];

function formatVoiceTime(sec: number): string {
  const safe = Number.isFinite(sec) && sec > 0 ? Math.floor(sec) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

const WALLPAPER_PRESETS = [
  { name: "Ảnh mẫu cô gái", url: "/images/default_lockscreen_girl.jpg" },
  { name: "Ảnh gốc tham khảo", url: "/images/messenger_reference.png" },
  { name: "Hoàng hôn Anime", url: "/images/anime_sunset_couple.jpg" },
  { name: "Cặp đôi hoàng hôn", url: "/thamkhao/sunset_couple_clean.jpg" },
];

// Isolated Live Lockscreen Clock: Only this subcomponent re-renders every second, NOT the whole page
const LiveLockClock = React.memo(function LiveLockClock({ customTime }: { customTime: string }) {
  const [time, setTime] = useState({
    clock: "23:32",
    date: "Thứ Sáu, 16 tháng 10",
  });

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const clock = customTime.trim()
        ? customTime
        : d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
      const rawDate = d.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const date = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
      setTime({ clock, date });
    };

    update();
    if (customTime.trim()) return;

    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [customTime]);

  return (
    <div className="flex flex-col items-center text-center mt-3">
      <h1
        className="font-ios-clock font-bold text-[78px] sm:text-[84px] leading-none text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] select-none"
        suppressHydrationWarning
      >
        {time.clock}
      </h1>
      <p
        className="font-ios font-medium text-[16px] text-white/95 mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] select-none"
        suppressHydrationWarning
      >
        {time.date}
      </p>
    </div>
  );
});

// Isolated Live Status Bar Clock: Zero re-render propagation to main page
const LiveStatusClock = React.memo(function LiveStatusClock({
  customTime,
  className = "tracking-tight",
}: {
  customTime: string;
  className?: string;
}) {
  const [clock, setClock] = useState(() => {
    if (customTime.trim()) return customTime;
    return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  });

  useEffect(() => {
    if (customTime.trim()) {
      setClock(customTime);
      return;
    }
    const update = () => {
      setClock(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [customTime]);

  return (
    <span className={className} suppressHydrationWarning>
      {clock}
    </span>
  );
});

function MessengerPageInner() {
  const searchParams = useSearchParams();

  // Settings state
  const [settings, setSettings] = useState<CustomSettings>(DEFAULT_SETTINGS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deviceMode, setDeviceMode] = useState<"mockup" | "fullscreen">("mockup");

  // Interaction stages: 'lock' -> 'pin' -> 'chat' -> 'film'
  const [stage, setStage] = useState<"lock" | "pin" | "chat" | "film">("lock");
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [cameraShutter, setCameraShutter] = useState(false);

  // Chat stage state
  const [shownMessages, setShownMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  // "envelope": only the small letter is shown; "gift": chat plays and ends with the gift icon
  const [chatPhase, setChatPhase] = useState<"envelope" | "gift">("envelope");
  const [letterHoldActive, setLetterHoldActive] = useState(false);
  const letterHoldTimer = useRef<number | null>(null);
  // After the film reel is closed the giver "sends" a voice note
  // 0 none, 1 typing, 2 lead text + recording, 3 voice note (waits for it to be heard), 4 typing, 5 closing text
  const [afterFilmStep, setAfterFilmStep] = useState(0);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceHint, setVoiceHint] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordError, setRecordError] = useState("");
  const voiceAudioRef = useRef<HTMLAudioElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const voiceFileInputRef = useRef<HTMLInputElement>(null);
  const musicAudioRef = useRef<HTMLAudioElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);
  const chatList = useMemo(
    () => [...(settings.messages || DEFAULT_MESSAGES), ...(chatPhase === "gift" ? [settings.giftLeadMessage.trim() || GIFT_LEAD_MESSAGE] : [])],
    [settings.messages, settings.giftLeadMessage, chatPhase]
  );

  // Filmstrip stage state
  const [isFilmPaused, setIsFilmPaused] = useState(false);
  const [selectedFilmPhoto, setSelectedFilmPhoto] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const letterScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLetter, setCanScrollLetter] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const filmFileInputRef = useRef<HTMLInputElement>(null);
  const customizerFilmInputRef = useRef<HTMLInputElement>(null);

  const handleCheckLetterScroll = useCallback(() => {
    const el = letterScrollRef.current;
    if (!el) return;
    setCanScrollLetter(el.scrollTop + el.clientHeight < el.scrollHeight - 16);
  }, []);

  const handleScrollLetterDown = () => {
    const el = letterScrollRef.current;
    if (!el) return;
    el.scrollBy({ top: 120, behavior: "smooth" });
  };

  useEffect(() => {
    if (isLetterOpen) {
      const isLong = (settings.letterContent || "").length > 130;
      setCanScrollLetter(isLong);
      const t = window.setTimeout(handleCheckLetterScroll, 300);
      return () => window.clearTimeout(t);
    }
  }, [isLetterOpen, settings.letterContent, handleCheckLetterScroll]);

  // Initialize from URL params or LocalStorage (runs once on mount / param change)
  useEffect(() => {
    // Read URL search params first
    const pSender = searchParams?.get("sender");
    const pText = searchParams?.get("text");
    const pWallpaper = searchParams?.get("wallpaper");
    const pAvatar = searchParams?.get("avatar");
    const pPin = searchParams?.get("pin");
    const pRecipient = searchParams?.get("to");
    const pMsg = searchParams?.get("msg");
    const pLTitle = searchParams?.get("ltitle");
    const pLSig = searchParams?.get("lsig");
    const pLBody = searchParams?.get("lbody");
    const pVoice = searchParams?.get("voice");
    const pMusic = searchParams?.get("music");
    const pGiftLead = searchParams?.get("glead");
    const pVoiceLead = searchParams?.get("vlead");
    const pVoiceAfter = searchParams?.get("vafter");
    const pFilmTitle = searchParams?.get("ftitle");
    const pFilmSubtitle = searchParams?.get("fsub");

    let initial = { ...DEFAULT_SETTINGS };

    // Try reading localStorage for saved customizer draft
    try {
      const saved = localStorage.getItem("kp_messenger_settings");
      if (saved) {
        initial = { ...initial, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore localStorage errors
    }

    if (initial.wallpaperUrl?.includes("passcode_reference.png")) {
      initial.wallpaperUrl = DEFAULT_SETTINGS.wallpaperUrl;
    }

    if (!initial.avatarUrl) {
      initial.avatarUrl = DEFAULT_SETTINGS.avatarUrl;
    }

    if (!initial.filmPhotos || !Array.isArray(initial.filmPhotos) || initial.filmPhotos.length === 0) {
      initial.filmPhotos = DEFAULT_FILM_PHOTOS;
    }

    if (pSender) initial.senderName = pSender;
    if (pText) initial.notificationText = pText;
    if (pWallpaper) initial.wallpaperUrl = pWallpaper;
    if (pAvatar) initial.avatarUrl = pAvatar;
    if (pPin) initial.pin = pPin;
    if (pRecipient) initial.recipientName = pRecipient;
    if (pMsg) initial.messages = pMsg.split("||").filter((s) => s.trim().length > 0);
    if (pLTitle) initial.letterTitle = pLTitle;
    if (pLSig) initial.letterSignature = pLSig;
    if (pLBody) initial.letterContent = pLBody;
    if (pVoice) initial.voiceUrl = pVoice;
    if (pMusic) initial.musicUrl = pMusic;
    if (pGiftLead) initial.giftLeadMessage = pGiftLead;
    if (pVoiceLead) initial.voiceLeadMessage = pVoiceLead;
    if (pVoiceAfter) initial.voiceAfterMessage = pVoiceAfter;
    if (pFilmTitle) initial.filmTitle = pFilmTitle;
    if (pFilmSubtitle) initial.filmSubtitle = pFilmSubtitle;

    setSettings(initial);
  }, [searchParams]);

  // Handle typing sequence in chat (1-way delivery with authentic typing indicator)
  useEffect(() => {
    if (stage !== "chat") return;
    const list = chatList;
    if (shownMessages >= list.length) return;

    setIsTyping(true);
    const timeout = window.setTimeout(() => {
      setIsTyping(false);
      setShownMessages((prev) => prev + 1);
    }, 850);

    return () => window.clearTimeout(timeout);
  }, [stage, shownMessages, chatList]);

  // High-performance container scroll without smooth-scroll conflicts
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [shownMessages, isTyping]);

  // Lockscreen notification click
  const handleOpenNotification = () => {
    if (settings.enablePin && settings.pin.trim()) {
      setEnteredPin("");
      setPinError(false);
      setStage("pin");
    } else {
      setShownMessages(0);
      setChatPhase("envelope");
      setAfterFilmStep(0);
      setStage("chat");
    }
  };

  // Passcode entry with useCallback to avoid unnecessary keypad re-renders
  const handlePressDigit = useCallback((digit: string) => {
    setEnteredPin((prev) => {
      if (prev.length >= settings.pin.length) return prev;
      const nextPin = prev + digit;
      setPinError(false);

      if (nextPin.length === settings.pin.length) {
        if (nextPin === settings.pin) {
          window.setTimeout(() => {
            setShownMessages(0);
            setChatPhase("envelope");
      setAfterFilmStep(0);
            setStage("chat");
          }, 180);
        } else {
          window.setTimeout(() => {
            setPinError(true);
            setEnteredPin("");
          }, 280);
        }
      }
      return nextPin;
    });
  }, [settings.pin]);

  // Closing the film reel: the chat sends a line, the voice note, then a closing line
  useEffect(() => {
    if (stage !== "chat" || afterFilmStep < 1 || afterFilmStep === 3 || afterFilmStep > 4) return;
    const delay = afterFilmStep === 1 ? 900 : afterFilmStep === 2 ? 1600 : 1200;
    const timeout = window.setTimeout(() => setAfterFilmStep(afterFilmStep + 1), delay);
    return () => window.clearTimeout(timeout);
  }, [stage, afterFilmStep]);

  // Leaving the chat (film, lock) stops any playing voice note
  useEffect(() => {
    if (stage === "chat") return;
    voiceAudioRef.current?.pause();
    setIsVoicePlaying(false);
  }, [stage]);

  // Background music plays while the letter or the film reel is open
  const shouldPlayMusic = isLetterOpen || stage === "film";
  useEffect(() => {
    const audio = musicAudioRef.current;
    if (!audio) return;
    if (shouldPlayMusic && settings.musicUrl) {
      audio.volume = 0.6;
      audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }, [shouldPlayMusic, settings.musicUrl]);

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateSetting("musicUrl", reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleToggleVoice = () => {
    const audio = voiceAudioRef.current;
    if (!audio || !settings.voiceUrl) {
      setVoiceHint(true);
      window.setTimeout(() => setVoiceHint(false), 3000);
      return;
    }
    if (audio.paused) {
      audio.play().catch(() => setIsVoicePlaying(false));
    } else {
      audio.pause();
    }
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateSetting("voiceUrl", reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      return;
    }
    setRecordError("");
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setRecordError("Trình duyệt không hỗ trợ ghi âm, hãy tải file lên.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") updateSetting("voiceUrl", reader.result);
        };
        reader.readAsDataURL(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setRecordError("Không mở được micro, hãy cho phép quyền ghi âm hoặc tải file lên.");
    }
  };

  const cancelLetterHold = () => {
    if (letterHoldTimer.current !== null) {
      window.clearTimeout(letterHoldTimer.current);
      letterHoldTimer.current = null;
    }
    setLetterHoldActive(false);
  };

  const startLetterHold = () => {
    cancelLetterHold();
    setLetterHoldActive(true);
    letterHoldTimer.current = window.setTimeout(() => {
      letterHoldTimer.current = null;
      setLetterHoldActive(false);
      handleOpenLetter();
    }, 600);
  };

  useEffect(
    () => () => {
      if (letterHoldTimer.current !== null) window.clearTimeout(letterHoldTimer.current);
    },
    []
  );

  // Closing the letter makes the chat send the lead-in message and the gift
  const handleCloseLetter = () => {
    setIsLetterOpen(false);
    setChatPhase("gift");
  };

  // Trigger Letter Confetti
  const handleOpenLetter = () => {
    setIsLetterOpen(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff4d6d", "#ff758f", "#ffb3c1", "#ffd166", "#c9184a"],
    });
  };

  // Customizer image upload (Wallpaper)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateSetting("wallpaperUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Customizer image upload (Chat Avatar)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateSetting("avatarUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filmstrip multi-photo upload
  const handleFilmPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);
    const promises = fileArr.map(
      (f) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") resolve(reader.result);
          };
          reader.readAsDataURL(f);
        })
    );
    Promise.all(promises).then((newPhotos) => {
      const valid = newPhotos.filter(Boolean);
      if (valid.length > 0) {
        setSettings((prev) => {
          const currentPhotos = prev.filmPhotos || DEFAULT_FILM_PHOTOS;
          const next = { ...prev, filmPhotos: [...currentPhotos, ...valid] };
          try {
            localStorage.setItem("kp_messenger_settings", JSON.stringify(next));
          } catch {
            // ignore localStorage quota
          }
          return next;
        });
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.65 },
          colors: ["#ff4d6d", "#ffd166", "#c9184a", "#ff9ebb"],
        });
      }
    });
    e.target.value = "";
  };

  const handleRemoveFilmPhoto = (indexToRemove: number) => {
    setSettings((prev) => {
      const current = prev.filmPhotos || DEFAULT_FILM_PHOTOS;
      const nextPhotos = current.filter((_, idx) => idx !== indexToRemove);
      const next = {
        ...prev,
        filmPhotos: nextPhotos.length > 0 ? nextPhotos : DEFAULT_FILM_PHOTOS,
      };
      try {
        localStorage.setItem("kp_messenger_settings", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const updateSetting = <K extends keyof CustomSettings>(key: K, value: CustomSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem("kp_messenger_settings", JSON.stringify(next));
      } catch {
        // localStorage may be full
      }
      return next;
    });
  };

  const handleCopyShareLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("sender", settings.senderName);
    url.searchParams.set("text", settings.notificationText);
    url.searchParams.set("pin", settings.pin);
    url.searchParams.set("to", settings.recipientName);
    url.searchParams.set("msg", (settings.messages || DEFAULT_MESSAGES).join("||"));
    if (settings.letterTitle) url.searchParams.set("ltitle", settings.letterTitle);
    if (settings.letterSignature) url.searchParams.set("lsig", settings.letterSignature);
    if (settings.letterContent) url.searchParams.set("lbody", settings.letterContent);
    url.searchParams.set("glead", settings.giftLeadMessage);
    url.searchParams.set("vlead", settings.voiceLeadMessage);
    url.searchParams.set("vafter", settings.voiceAfterMessage);
    if (settings.musicUrl && !settings.musicUrl.startsWith("data:") && settings.musicUrl !== DEFAULT_MUSIC_URL) {
      url.searchParams.set("music", settings.musicUrl);
    }
    if (settings.voiceUrl && !settings.voiceUrl.startsWith("data:")) {
      url.searchParams.set("voice", settings.voiceUrl);
    }
    if (!settings.wallpaperUrl.startsWith("data:")) {
      url.searchParams.set("wallpaper", settings.wallpaperUrl);
    }
    if (settings.avatarUrl && !settings.avatarUrl.startsWith("data:") && settings.avatarUrl !== DEFAULT_SETTINGS.avatarUrl) {
      url.searchParams.set("avatar", settings.avatarUrl);
    }
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2500);
  };

  const renderBubble = (text: string, idx: number) => (
    <div
                      key={idx}
                      className="flex items-end gap-2 justify-start animate-fade-in"
                    >
                      {/* Sender Avatar */}
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5 shadow-2xs ring-1 ring-pink-100">
                        <img
                          src={settings.avatarUrl || "/images/default_avatar.png"}
                          alt={settings.senderName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 1-way Bubble in pure white with soft shadow, matching reference style */}
                      <div className="max-w-[78%] px-3.5 py-2 text-[14px] leading-snug break-words bg-white text-slate-800 rounded-[18px] rounded-bl-xs shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        {text}
                      </div>
                    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-[#0d0f12] text-slate-100 flex flex-col items-center justify-center overflow-x-hidden selection:bg-rose-500/30 selection:text-white">
      <audio ref={musicAudioRef} src={settings.musicUrl || undefined} loop preload="none" />

      {/* Background ambient lighting for desktop showcase - lightweight radial gradients, zero blur GPU overhead */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden sm:block opacity-65"
        style={{
          backgroundImage: `
            radial-gradient(circle 420px at 15% 30%, rgba(159, 18, 57, 0.22), transparent 70%),
            radial-gradient(circle 420px at 85% 70%, rgba(49, 46, 129, 0.25), transparent 70%),
            radial-gradient(circle 500px at 50% 50%, rgba(244, 63, 94, 0.05), transparent 75%)
          `,
        }}
      />

      {/* Top Floating Controls Bar on Desktop */}
      <header className="hidden sm:flex w-full max-w-2xl px-4 py-3 sm:py-4 items-center justify-between gap-2 z-40 relative">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-white/90 backdrop-blur-md transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span className="hidden sm:inline">Trang chủ K&amp;P</span>
        </Link>

        {/* Device Mode Switcher (Desktop only) */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setDeviceMode("mockup")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              deviceMode === "mockup"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-white/70 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">phone_iphone</span>
            <span>Khung iPhone</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode("fullscreen")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              deviceMode === "fullscreen"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-white/70 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">fullscreen</span>
            <span>Toàn màn hình</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-white/90 backdrop-blur-md transition-all active:scale-95"
            title="Sao chép link quà tặng mang thông số tùy chỉnh"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copiedLink ? "done" : "share"}
            </span>
            <span>{copiedLink ? "Đã sao chép!" : "Chia sẻ link"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Tùy chỉnh</span>
          </button>
        </div>
      </header>

      {/* Discrete Mobile Floating Action Pill */}
      <div className="sm:hidden fixed top-3 right-3 z-50 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsConfigOpen(true)}
          className="h-8 px-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 backdrop-blur-xl border border-white/20 text-[11px] font-medium flex items-center gap-1 shadow-md active:scale-95"
          title="Tùy chỉnh hình nền, tên và nội dung"
        >
          <span className="material-symbols-outlined text-[14px]">tune</span>
          <span>Tùy chỉnh</span>
        </button>
      </div>

      {/* Main Showcase Area */}
      <main className="w-full flex-1 flex items-center justify-center p-0 sm:p-3 z-20 overflow-hidden">
        {/* iPhone Outer Wrapper (Mockup on Desktop, flat full screen on Mobile or when fullscreen mode is selected) */}
        <div
          className={`relative transition-all duration-300 ${
            deviceMode === "mockup"
              ? "w-full sm:w-auto sm:aspect-[390/812] sm:h-[min(812px,calc(100vh-75px))] sm:max-w-[390px] h-[100dvh] sm:rounded-[54px] sm:border-[8px] sm:border-[#222329] sm:ring-1 sm:ring-white/20 sm:shadow-[0_20px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)]"
              : "w-full h-[100dvh] max-w-none rounded-none border-none shadow-none fixed inset-0 z-30"
          }`}
        >

          {/* Hardware Side Buttons (visible only on desktop mockup) */}
          {deviceMode === "mockup" && (
            <>
              {/* Left Action Button */}
              <div className="hidden sm:block absolute -left-[12px] top-24 w-[4px] h-7 bg-[#2f313a] rounded-l-md ring-1 ring-black/40" />
              {/* Left Volume Up */}
              <div className="hidden sm:block absolute -left-[12px] top-36 w-[4px] h-12 bg-[#2f313a] rounded-l-md ring-1 ring-black/40" />
              {/* Left Volume Down */}
              <div className="hidden sm:block absolute -left-[12px] top-52 w-[4px] h-12 bg-[#2f313a] rounded-l-md ring-1 ring-black/40" />
              {/* Right Power / Side Button */}
              <div className="hidden sm:block absolute -right-[12px] top-40 w-[4px] h-16 bg-[#2f313a] rounded-r-md ring-1 ring-black/40" />
            </>
          )}

          {/* Screen Bezel & Display Viewport */}
          <div
            className={`w-full h-full relative overflow-hidden bg-black select-none ${
              deviceMode === "mockup" ? "sm:rounded-[46px]" : "rounded-none"
            }`}
          >
            {/* Wallpaper Layer */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500 scale-100"
              style={{
                backgroundImage: `url(${settings.wallpaperUrl})`,
                filter: stage === "pin" ? "brightness(0.9)" : "none",
              }}
            />

            {/* Dark vignette gradient over wallpaper for readability */}
            <div
              className={`absolute inset-0 bg-linear-to-b ${
                stage === "pin"
                  ? "from-black/30 via-transparent to-black/35"
                  : "from-black/40 via-transparent to-black/60"
              } pointer-events-none`}
            />

            {/* Floating Pink Hearts Layer (from sample photo) */}
            {settings.showFloatingHearts && stage === "lock" && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {[
                  { left: "15%", bottom: "25%", delay: "0s", dur: "7s" },
                  { left: "78%", bottom: "32%", delay: "1.2s", dur: "6.5s" },
                  { left: "28%", bottom: "45%", delay: "2.4s", dur: "8s" },
                  { left: "55%", bottom: "20%", delay: "3.1s", dur: "7.2s" },
                  { left: "85%", bottom: "50%", delay: "4s", dur: "6s" },
                  { left: "38%", bottom: "15%", delay: "1.8s", dur: "7.5s" },
                  { left: "68%", bottom: "60%", delay: "0.5s", dur: "8.5s" },
                  { left: "12%", bottom: "55%", delay: "2.8s", dur: "6.8s" },
                ].map((heart, idx) => (
                  <span
                    key={idx}
                    className="absolute text-pink-400/70 select-none animate-ios-heart drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]"
                    style={{
                      left: heart.left,
                      bottom: heart.bottom,
                      animationDelay: heart.delay,
                      animationDuration: heart.dur,
                    }}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            )}

            {/* iPhone Notch with Speaker slit and Front Camera (Hidden on film stage so the panoramic sky and romantic title are unobstructed) */}
            {stage !== "film" && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 w-[124px] h-[28px] bg-black rounded-b-[18px] flex items-center justify-center shadow-md">
                {/* Speaker slit */}
                <div className="w-10 h-1 bg-[#1a1a1a] rounded-full mr-2" />
                {/* Front Camera dot */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#060c14] ring-1 ring-[#152336]/60 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#0a1a30]" />
                </div>
              </div>
            )}

            {/* Top iOS Status Bar on Passcode PIN screen */}
            {stage === "pin" && (
              <div className="absolute top-0 inset-x-0 h-10 px-6 flex items-center justify-between text-white text-[12px] font-ios font-medium z-30 pointer-events-none pt-1">
                <LiveStatusClock customTime={settings.customTime} />
                <div className="flex items-center gap-1.5 text-white/90">
                  <svg className="w-4 h-3" viewBox="0 0 17 12" fill="currentColor">
                    <rect x="0" y="9" width="3" height="3" rx="0.5" />
                    <rect x="4.5" y="6" width="3" height="6" rx="0.5" />
                    <rect x="9" y="3" width="3" height="9" rx="0.5" />
                    <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
                  </svg>
                  <svg className="w-3.5 h-3" viewBox="0 0 16 12" fill="currentColor">
                    <path d="M8 2.5C10.7 2.5 13.1 3.6 14.8 5.4L16 4.1C13.9 2 11.1 0.7 8 0.7C4.9 0.7 2.1 2 0 4.1L1.2 5.4C2.9 3.6 5.3 2.5 8 2.5ZM8 6.5C9.7 6.5 11.2 7.2 12.3 8.3L13.5 7C12.1 5.6 10.1 4.7 8 4.7C5.9 4.7 3.9 5.6 2.5 7L3.7 8.3C4.8 7.2 6.3 6.5 8 6.5ZM8 10C8.8 10 9.5 10.7 9.5 11.5C9.5 12.3 8.8 13 8 13C7.2 13 6.5 12.3 6.5 11.5C6.5 10.7 7.2 10 8 10Z" />
                  </svg>
                  <div className="w-5 h-2.5 rounded-[3px] border border-white/80 p-[1px] flex items-center">
                    <div className="h-full w-full bg-white rounded-[1.5px]" />
                  </div>
                </div>
              </div>
            )}

            {/* Flashlight screen effect */}
            {flashlightOn && (
              <div className="absolute inset-0 bg-white/30 backdrop-blur-xs pointer-events-none z-30 transition-opacity" />
            )}

            {/* Camera Shutter Flash */}
            {cameraShutter && (
              <div className="absolute inset-0 bg-white z-50 animate-pulse pointer-events-none" />
            )}

            {/* ========================================================= */}
            {/* STAGE 1: IPHONE LOCK SCREEN ("trang đầu tiên là như này")  */}
            {/* ========================================================= */}
            {stage === "lock" && (
              <div className="relative h-full w-full flex flex-col justify-between pt-16 pb-3 px-4 z-20">
                {/* Clock & Date Header */}
                <LiveLockClock customTime={settings.customTime} />

                {/* Bottom Section: Notification card sitting down close to Flashlight & Camera shortcuts */}
                <div className="w-full flex flex-col items-center mt-auto">
                  {/* iOS Notification Card */}
                  <div className="w-full max-w-sm mx-auto mb-2">
                    <button
                      type="button"
                      onClick={handleOpenNotification}
                      className="w-full text-left rounded-[26px] bg-black/60 hover:bg-black/65 backdrop-blur-md border border-white/20 p-3.5 px-4 shadow-[0_10px_35px_rgba(0,0,0,0.45)] transition-all active:scale-[0.98] cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Messenger Gradient Icon */}
                        <div className="shrink-0 pt-0.5">
                          <MessengerIcon className="w-9 h-9 drop-shadow-sm" />
                        </div>

                        {/* Notification Header & Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-ios font-semibold text-[15px] text-white tracking-tight truncate">
                              {settings.senderName}
                            </span>
                            <span className="font-ios text-[12px] text-white/65 shrink-0">
                              bây giờ
                            </span>
                          </div>
                          <p className="font-ios text-[14px] text-white/90 leading-snug mt-0.5 break-words line-clamp-2">
                            {settings.notificationText}
                          </p>
                        </div>
                      </div>
                    </button>

                    <p className="text-center text-[11px] font-ios text-white/70 mt-1.5 drop-shadow-sm">
                      Chạm vào thông báo để mở tin nhắn
                    </p>
                  </div>

                  {/* Shortcuts (Flashlight & Camera) & Home Indicator */}
                  <div className="w-full flex items-center justify-between px-3">
                    {/* Flashlight button with transparent glass lens styling */}
                    <button
                      type="button"
                      aria-label="Bật đèn pin"
                      onClick={() => setFlashlightOn(!flashlightOn)}
                      className={`ios-glass-key w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                        flashlightOn
                          ? "bg-amber-300 text-black border-amber-300 shadow-[0_0_22px_rgba(252,211,77,0.8)]"
                          : "text-white"
                      }`}
                    >
                      <FlashlightIcon className="w-5 h-5" />
                    </button>

                    {/* Camera button with transparent glass lens styling */}
                    <button
                      type="button"
                      aria-label="Mở máy ảnh"
                      onClick={() => {
                        setCameraShutter(true);
                        window.setTimeout(() => setCameraShutter(false), 300);
                      }}
                      className="ios-glass-key w-12 h-12 rounded-full text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    >
                      <CameraIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Home Indicator Bar */}
                  <div className="w-32 h-1 bg-white/75 rounded-full mt-2 mb-1 shadow-sm" />
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STAGE 2: IPHONE PASSCODE KEYPAD (Nhập mật mã)             */}
            {/* ========================================================= */}
            {stage === "pin" && (
              <div className="relative h-full w-full flex flex-col justify-between pt-14 pb-4 px-6 z-20 text-white font-ios">
                <div className="flex flex-col items-center mt-3">
                  {/* iOS Passcode Header */}
                  <h2 className="font-ios font-medium text-[16px] sm:text-[17px] text-white/95 text-center max-w-[260px] leading-snug drop-shadow-sm select-none">
                    Nhập mật mã tình yêu
                  </h2>

                  {/* Passcode Dots (Hollow rings that fill white when typed) */}
                  <div
                    className={`flex items-center gap-3.5 mt-5 ${
                      pinError ? "animate-ios-shake" : ""
                    }`}
                  >
                    {Array.from({ length: settings.pin.length }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full border border-white/80 transition-all ${
                          i < enteredPin.length ? "bg-white border-white" : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>

                  {pinError ? (
                    <p className="text-xs text-rose-300 font-medium mt-2.5">
                      Mật mã chưa chính xác, thử lại nhé
                    </p>
                  ) : (
                    <p className="text-[11px] text-white/60 mt-2">
                      Mã mở khóa: <strong className="text-white/90">{settings.pin}</strong>
                    </p>
                  )}
                </div>

                {/* Keypad Grid with Crystal Transparent Glass Keys */}
                <div className="w-full max-w-[270px] mx-auto grid grid-cols-3 gap-y-3.5 gap-x-5 my-auto justify-items-center">
                  {[
                    { num: "1", sub: "" },
                    { num: "2", sub: "A B C" },
                    { num: "3", sub: "D E F" },
                    { num: "4", sub: "G H I" },
                    { num: "5", sub: "J K L" },
                    { num: "6", sub: "M N O" },
                    { num: "7", sub: "P Q R S" },
                    { num: "8", sub: "T U V" },
                    { num: "9", sub: "W X Y Z" },
                  ].map((k) => (
                    <PasscodeKey
                      key={k.num}
                      num={k.num}
                      sub={k.sub}
                      onPress={handlePressDigit}
                    />
                  ))}
                  <div />
                  <PasscodeKey num="0" sub="" onPress={handlePressDigit} />
                  <div />
                </div>

                {/* Bottom actions matching iOS Passcode Screen */}
                <div className="w-full flex items-center justify-between px-3 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Trigger emergency call notification/hint
                      alert("Tính năng cuộc gọi khẩn cấp (Emergency SOS) - K&P Atelier");
                    }}
                    className="text-[15px] font-ios font-medium text-white/90 hover:text-white drop-shadow-sm active:scale-95 transition-transform"
                  >
                    Khẩn cấp
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEnteredPin(settings.pin);
                      window.setTimeout(() => {
                        setShownMessages(0);
                        setChatPhase("envelope");
                        setAfterFilmStep(0);
                        setStage("chat");
                      }, 200);
                    }}
                    className="text-xs font-semibold text-rose-300 hover:text-rose-200 underline underline-offset-4"
                  >
                    Mở nhanh ({settings.pin})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (enteredPin.length > 0) {
                        setEnteredPin((p) => p.slice(0, -1));
                      } else {
                        setEnteredPin("");
                        setStage("lock");
                      }
                    }}
                    className="text-[15px] font-ios font-medium text-white/90 hover:text-white drop-shadow-sm active:scale-95 transition-transform"
                  >
                    {enteredPin.length > 0 ? "Xóa" : "Hủy"}
                  </button>
                </div>

                {/* Home Indicator */}
                <div className="w-32 h-1 bg-white/70 rounded-full mx-auto" />
              </div>
            )}


            {/* ========================================================= */}
            {/* STAGE 3: IPHONE MESSENGER CHAT SCREEN (Pink Hearts Theme) */}
            {/* ========================================================= */}
            {stage === "chat" && (
              <div
                className="relative h-full w-full flex flex-col font-sans z-20 bg-cover bg-center select-none"
                style={{ backgroundImage: `url('/images/messenger_pink_theme_bg.png')` }}
              >
                {/* Soft overlay so text and bubbles pop */}
                <div className="absolute inset-0 bg-pink-100/10 pointer-events-none" />

                {/* Top iOS Status Bar (with Apple Focus heart ♥) */}
                <div className="relative pt-2 px-6 flex items-center justify-between text-slate-800 text-[12px] font-ios font-semibold z-30 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <LiveStatusClock customTime={settings.customTime} />
                    <span className="text-[10px] text-[#e02476]">♥</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <svg className="w-4 h-3" viewBox="0 0 17 12" fill="currentColor">
                      <rect x="0" y="9" width="3" height="3" rx="0.5" />
                      <rect x="4.5" y="6" width="3" height="6" rx="0.5" />
                      <rect x="9" y="3" width="3" height="9" rx="0.5" />
                      <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
                    </svg>
                    <svg className="w-3.5 h-3" viewBox="0 0 16 12" fill="currentColor">
                      <path d="M8 2.5C10.7 2.5 13.1 3.6 14.8 5.4L16 4.1C13.9 2 11.1 0.7 8 0.7C4.9 0.7 2.1 2 0 4.1L1.2 5.4C2.9 3.6 5.3 2.5 8 2.5ZM8 6.5C9.7 6.5 11.2 7.2 12.3 8.3L13.5 7C12.1 5.6 10.1 4.7 8 4.7C5.9 4.7 3.9 5.6 2.5 7L3.7 8.3C4.8 7.2 6.3 6.5 8 6.5ZM8 10C8.8 10 9.5 10.7 9.5 11.5C9.5 12.3 8.8 13 8 13C7.2 13 6.5 12.3 6.5 11.5C6.5 10.7 7.2 10 8 10Z" />
                    </svg>
                    <div className="w-5 h-2.5 rounded-[3px] border border-slate-800 p-[1px] flex items-center">
                      <div className="h-full w-4/5 bg-slate-800 rounded-[1.5px]" />
                    </div>
                  </div>
                </div>

                {/* Messenger Navigation Bar */}
                <header className="relative pt-1 pb-2.5 px-3 flex items-center justify-between border-b border-pink-200/40 bg-white/20 backdrop-blur-xs z-30 shrink-0">
                  <div className="flex items-center gap-2">
                    {/* Pink back button with badge < 12 */}
                    <button
                      type="button"
                      onClick={() => setStage("lock")}
                      className="flex items-center gap-0.5 text-[#e02476] hover:opacity-80 transition-transform active:scale-95 cursor-pointer -ml-1"
                      title="Quay lại màn hình khóa"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      <span className="w-5 h-5 rounded-full bg-[#e02476] text-white text-[11px] font-bold flex items-center justify-center -ml-1">
                        12
                      </span>
                    </button>

                    {/* Sender Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-pink-200 shrink-0">
                      <img
                        src={settings.avatarUrl || "/images/default_avatar.png"}
                        alt={settings.senderName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Sender Name & Online Status */}
                    <div className="leading-tight">
                      <h3 className="font-semibold text-[14px] text-slate-900 truncate max-w-[170px]">
                        {settings.senderName}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Đang hoạt động
                      </p>
                    </div>
                  </div>

                  {/* Right Icons: Call & Video Call (with green dot) */}
                  <div className="flex items-center gap-3.5 text-[#e02476]">
                    {/* Phone Call */}
                    <button type="button" className="hover:opacity-80 active:scale-95 cursor-pointer" aria-label="Gọi thoại">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.45-5.15-3.76-6.59-6.59l1.97-1.57c.28-.28.37-.69.25-1.02A11.36 11.36 0 018.96 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.62c0-.55-.45-1-1-1z" />
                      </svg>
                    </button>

                    {/* Video Call with Green online dot */}
                    <div className="relative">
                      <button type="button" className="hover:opacity-80 active:scale-95 cursor-pointer" aria-label="Gọi video">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                        </svg>
                      </button>
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                    </div>
                  </div>
                </header>

                {/* Chat Message Scrollable Area */}
                <div
                  ref={chatContainerRef}
                  className="relative flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5 z-10"
                >
                  {chatList.slice(0, Math.min(shownMessages, (settings.messages || DEFAULT_MESSAGES).length)).map(renderBubble)}

                  {/* Letter sent as a message: press and hold to open */}
                  {shownMessages >= (settings.messages || DEFAULT_MESSAGES).length && (
                    <div className="flex items-end gap-2 justify-start animate-fade-in">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5 shadow-2xs ring-1 ring-pink-100">
                        <img
                          src={settings.avatarUrl || "/images/default_avatar.png"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <button
                          type="button"
                          onClick={handleOpenLetter}
                          className="w-36 touch-none select-none cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95"
                          aria-label="Mở thư tay"
                        >
                          <img
                            src="/thamkhao/thiep/thiep_dong.webp"
                            alt="Thư tay K&P"
                            draggable={false}
                            className="w-full h-auto rounded-xl shadow-md pointer-events-none"
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lead-in to the gift, sent below the letter */}
                  {chatList.slice((settings.messages || DEFAULT_MESSAGES).length, shownMessages).map((text, i) => renderBubble(text, (settings.messages || DEFAULT_MESSAGES).length + i))}

                  {/* Typing Bubble */}
                  {isTyping && (
                    <div className="flex items-end gap-2 justify-start animate-fade-in">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-2xs ring-1 ring-pink-100">
                        <img
                          src={settings.avatarUrl || "/images/default_avatar.png"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-white px-3.5 py-2.5 rounded-[18px] rounded-bl-xs flex items-center gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        <span className="w-1.5 h-1.5 bg-[#e02476] rounded-full animate-bounce" />
                        <span
                          className="w-1.5 h-1.5 bg-[#e02476] rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-[#e02476] rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Gift sent as a message: tap opens the film reel */}
                  {chatPhase === "gift" && shownMessages >= chatList.length && (
                    <div className="flex items-end gap-2 justify-start animate-fade-in">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5 shadow-2xs ring-1 ring-pink-100">
                        <img
                          src={settings.avatarUrl || "/images/default_avatar.png"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setStage("film");
                          confetti({
                            particleCount: 90,
                            spread: 80,
                            origin: { y: 0.5 },
                            colors: ["#ff4d6d", "#ffd166", "#c9184a", "#ff9ebb"],
                          });
                        }}
                        className="px-1 text-[44px] leading-none drop-shadow-md animate-bounce cursor-pointer active:scale-90 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e02476]"
                        aria-label="Mở món quà: cuộn phim kỷ niệm"
                      >
                        🎁
                      </button>
                    </div>
                  )}

                  {afterFilmStep === 1 && (
                    <div className="flex items-end gap-2 justify-start animate-fade-in">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-2xs ring-1 ring-pink-100">
                        <img
                          src={settings.avatarUrl || "/images/default_avatar.png"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-white px-3.5 py-2.5 rounded-[18px] rounded-bl-xs flex items-center gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        <span className="w-1.5 h-1.5 bg-[#e02476] rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-[#e02476] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <span className="w-1.5 h-1.5 bg-[#e02476] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  )}

                  {afterFilmStep >= 2 && renderBubble(settings.voiceLeadMessage.trim() || VOICE_LEAD_MESSAGE, 1001)}

                  {/* Voice note recorded by the giver, sent after the film reel is closed */}
                  {afterFilmStep === 2 && (
                    <div className="flex items-end gap-2 justify-start animate-fade-in">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5 shadow-2xs ring-1 ring-pink-100">
                        <img
                          src={settings.avatarUrl || "/images/default_avatar.png"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-white px-3.5 py-2 rounded-[18px] rounded-bl-xs text-[12px] text-[#e02476] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        🎙️ Đang ghi âm...
                      </div>
                    </div>
                  )}

                  {afterFilmStep >= 3 && (
                    <div className="flex items-end gap-2 justify-start animate-fade-in">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5 shadow-2xs ring-1 ring-pink-100">
                        <img
                          src={settings.avatarUrl || "/images/default_avatar.png"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2.5 pl-2 pr-3.5 py-2 rounded-[20px] rounded-bl-xs bg-[#e02476] text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
                          <button
                            type="button"
                            onClick={handleToggleVoice}
                            className="w-8 h-8 rounded-full bg-white text-[#e02476] flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            aria-label={isVoicePlaying ? "Tạm dừng tin nhắn thoại" : "Phát tin nhắn thoại"}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {isVoicePlaying ? "pause" : "play_arrow"}
                            </span>
                          </button>
                          <div className="flex items-center gap-[2px] h-6" aria-hidden="true">
                            {VOICE_BARS.map((h, i) => (
                              <span
                                key={i}
                                className={`w-[3px] rounded-full ${
                                  i / VOICE_BARS.length < voiceProgress ? "bg-white" : "bg-white/45"
                                }`}
                                style={{ height: h }}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] tabular-nums font-medium">
                            {formatVoiceTime(isVoicePlaying || voiceProgress > 0 ? voiceDuration * voiceProgress : voiceDuration)}
                          </span>
                          <audio
                            ref={voiceAudioRef}
                            src={settings.voiceUrl || undefined}
                            preload="metadata"
                            onLoadedMetadata={(e) => setVoiceDuration(e.currentTarget.duration)}
                            onTimeUpdate={(e) => {
                              const a = e.currentTarget;
                              setVoiceProgress(a.duration ? a.currentTime / a.duration : 0);
                            }}
                            onPlay={() => setIsVoicePlaying(true)}
                            onPause={() => setIsVoicePlaying(false)}
                            onEnded={() => {
                              setIsVoicePlaying(false);
                              setVoiceProgress(0);
                              setAfterFilmStep((prev) => (prev === 3 ? 4 : prev));
                            }}
                          />
                        </div>
                        {voiceHint && (
                          <span className="mt-0.5 ml-1 text-[10px] text-slate-600">
                            Chưa có ghi âm. Thêm trong Tùy chỉnh.
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {afterFilmStep === 4 && (
                    <div className="flex items-end gap-2 justify-start animate-fade-in">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-2xs ring-1 ring-pink-100">
                        <img
                          src={settings.avatarUrl || "/images/default_avatar.png"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-white px-3.5 py-2.5 rounded-[18px] rounded-bl-xs flex items-center gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        <span className="w-1.5 h-1.5 bg-[#e02476] rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-[#e02476] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <span className="w-1.5 h-1.5 bg-[#e02476] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  )}

                  {afterFilmStep >= 5 && renderBubble(settings.voiceAfterMessage.trim() || VOICE_AFTER_MESSAGE, 1002)}
                </div>

                {/* Bottom Input Bar matching user screenshot */}
                <div className="relative px-2.5 py-2 border-t border-pink-200/50 bg-[#fff0f4]/80 backdrop-blur-md flex items-center gap-2 shrink-0 z-20">
                  {/* Plus */}
                  <button type="button" className="w-6 h-6 rounded-full bg-[#e02476] text-white flex items-center justify-center hover:opacity-90 active:scale-95 shrink-0">
                    <span className="text-[17px] leading-none font-bold">+</span>
                  </button>

                  {/* Camera */}
                  <button type="button" className="text-[#e02476] hover:opacity-80 active:scale-95 shrink-0" aria-label="Camera">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z" />
                      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                    </svg>
                  </button>

                  {/* Image Gallery */}
                  <button type="button" className="text-[#e02476] hover:opacity-80 active:scale-95 shrink-0" aria-label="Thư viện ảnh">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                  </button>

                  {/* Mic */}
                  <button type="button" className="text-[#e02476] hover:opacity-80 active:scale-95 shrink-0" aria-label="Ghi âm">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
                    </svg>
                  </button>

                  {/* Aa Input Pill */}
                  <div className="flex-1 bg-white/70 border border-pink-200/70 rounded-full px-3 py-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-normal">Aa</span>
                    <span className="text-sm">😊</span>
                  </div>

                  {/* Quick Reaction Double Hearts */}
                  <button type="button" className="hover:opacity-80 active:scale-95 shrink-0 text-base leading-none" aria-label="Thả tim">
                    💕
                  </button>
                </div>

                {/* Home Indicator */}
                <div className="w-32 h-1 bg-slate-800/80 rounded-full mx-auto mb-1.5 shrink-0 z-20" />
              </div>
            )}

            {/* ========================================================= */}
            {/* STAGE 4: INFINITE 35MM FILMSTRIP REEL (Dreamy Lake Sunset) */}
            {/* ========================================================= */}
            {stage === "film" && (
              <div
                className="relative h-full w-full flex flex-col justify-between font-sans z-20 bg-cover bg-center select-none overflow-hidden"
                style={{ backgroundImage: `url('/images/pink_clouds_sunset_sky.webp')` }}
              >
                {/* Soft ambient tint */}
                <div className="absolute inset-0 bg-pink-900/5 pointer-events-none z-10" />

                {/* Top Header matching reference image: round back button + Dlove + Những ngày mình bên nhau */}
                <div className="relative pt-4 sm:pt-6 pb-2 px-3.5 sm:px-5 flex items-center justify-between z-30 shrink-0">
                  {/* Round White Back Button in Top-Left */}
                  <button
                    type="button"
                    onClick={() => {
                      setStage("chat");
                      setAfterFilmStep((prev) => (prev === 0 ? 1 : prev));
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-900 flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer ring-1 ring-black/5 shrink-0 z-20"
                    title="Quay lại tin nhắn"
                    aria-label="Quay lại"
                  >
                    <span className="text-[17px] sm:text-lg font-bold leading-none select-none text-stone-700">←</span>
                  </button>

                  {/* Centered Romantic Titles matching reference screenshot */}
                  <div className="absolute inset-x-0 top-3.5 sm:top-5 flex flex-col items-center justify-center pointer-events-none select-none px-12">
                    <span className="font-handwriting italic text-[16px] sm:text-[18px] text-[#7d4860] leading-none drop-shadow-2xs">
                      {settings.filmSubtitle || "Dlove"}
                    </span>
                    <h2 className="font-handwriting font-medium text-[20px] sm:text-[25px] text-[#54223a] leading-tight mt-0.5 tracking-wide whitespace-nowrap drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
                      {settings.filmTitle || "Những ngày mình bên nhau"}
                    </h2>
                  </div>

                  {/* Empty right placeholder so title stays perfectly centered with unobstructed sky */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 pointer-events-none opacity-0" />
                </div>

                {/* Center 35mm Continuous Film Reel matching user reference image */}
                <div className="relative my-auto py-2 w-full overflow-hidden flex flex-col justify-center z-20">
                  {/* Infinite Horizontal Filmstrip Track (No dark black backing, clouds shine through) */}
                  <div
                    className="animate-filmstrip py-1 select-none cursor-grab active:cursor-grabbing"
                    style={{ animationPlayState: isFilmPaused ? "paused" : "running" }}
                  >
                    {(() => {
                      const list =
                        settings.filmPhotos && settings.filmPhotos.length > 0
                          ? settings.filmPhotos
                          : DEFAULT_FILM_PHOTOS;
                      const repeat = Math.max(1, Math.ceil(6 / list.length));
                      const half = Array(repeat).fill(list).flat();
                      const looped = [...half, ...half];

                      return looped.map((photoUrl, idx) => {
                        const frameNum = (idx % list.length) + 1;
                        return (
                          <div
                            key={idx}
                            className="shrink-0 flex flex-col items-center bg-[#b87d96] border-y-[2px] border-[#a56782] shadow-[0_12px_32px_rgba(110,40,70,0.3)] mx-1 rounded-xs p-1.5 transition-transform hover:scale-102 duration-200 group"
                          >
                            {/* Top Continuous Sprocket Holes */}
                            <div className="w-full flex items-center justify-between px-1 py-0.5 border-b border-white/20 select-none overflow-hidden gap-1.5">
                              {Array.from({ length: 8 }).map((_, holeIdx) => (
                                <span
                                  key={`top-hole-${holeIdx}`}
                                  className="w-3 h-1.5 rounded-[1px] bg-white/95 shadow-2xs shrink-0"
                                />
                              ))}
                            </div>

                            {/* Photo Frame */}
                            <div
                              onClick={() => setSelectedFilmPhoto(photoUrl)}
                              className="relative w-[155px] sm:w-[175px] h-[215px] sm:h-[240px] my-1 bg-black/30 rounded-[2px] overflow-hidden shadow-inner cursor-pointer"
                            >
                              <img
                                src={photoUrl}
                                alt={`Kỷ niệm ${frameNum}`}
                                className="w-full h-full object-cover group-hover:brightness-105 transition-all duration-300"
                                loading="lazy"
                              />

                              {/* Film frame subtle highlight */}
                              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 pointer-events-none rounded-[2px]" />
                            </div>

                            {/* Bottom Continuous Sprocket Holes */}
                            <div className="w-full flex items-center justify-between px-1 py-0.5 border-t border-white/20 select-none overflow-hidden gap-1.5">
                              {Array.from({ length: 8 }).map((_, holeIdx) => (
                                <span
                                  key={`bot-hole-${holeIdx}`}
                                  className="w-3 h-1.5 rounded-[1px] bg-white/95 shadow-2xs shrink-0"
                                />
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <p className="text-center text-[11px] font-sans text-[#5c233c] mt-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)] font-medium">
                    Chạm giữ để dừng phim • Chạm vào ảnh để phóng to
                  </p>
                </div>

                {/* Bottom Soft Translucent Controls Bar */}
                <div className="relative px-3 py-2 bg-white/35 backdrop-blur-md border-t border-white/40 flex flex-col items-center gap-2 shrink-0 z-30">
                  <div className="w-full flex items-center justify-between gap-2 max-w-sm">
                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={() => filmFileInputRef.current?.click()}
                      className="flex-1 py-1.5 px-3 rounded-full bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                      <span>Tải ảnh vào phim</span>
                    </button>

                    {/* Play / Pause Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setIsFilmPaused(!isFilmPaused)}
                      className="py-1.5 px-3 rounded-full bg-white/70 hover:bg-white text-[#5e223c] font-medium text-xs shadow-2xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer border border-pink-200/60"
                      title={isFilmPaused ? "Chạy cuộn phim" : "Tạm dừng"}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isFilmPaused ? "play_arrow" : "pause"}
                      </span>
                      <span>{isFilmPaused ? "Chạy tiếp" : "Tạm dừng"}</span>
                    </button>

                    {/* Back to Lock */}
                    <button
                      type="button"
                      onClick={() => {
                        setShownMessages(0);
                        setStage("lock");
                      }}
                      className="py-1.5 px-3 rounded-full bg-white/70 hover:bg-white text-[#5e223c] font-medium text-xs shadow-2xs transition-all active:scale-95 cursor-pointer border border-pink-200/60"
                    >
                      Màn hình khóa
                    </button>
                  </div>

                  {/* Hidden File Input for Film Reel */}
                  <input
                    ref={filmFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilmPhotosUpload}
                    className="hidden"
                  />

                  {/* iPhone Home Indicator */}
                  <div className="w-32 h-1 bg-white/75 rounded-full mx-auto" />
                </div>

                {/* Lightbox Modal for Enlarge Photo */}
                {selectedFilmPhoto && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setSelectedFilmPhoto(null)}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="relative max-w-sm w-full bg-[#121214] border border-white/20 rounded-2xl p-2.5 shadow-2xl flex flex-col items-center animate-letter-open"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedFilmPhoto(null)}
                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center ring-1 ring-white/30 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                      <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-black">
                        <img
                          src={selectedFilmPhoto}
                          alt="Ảnh phóng to"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-full flex items-center justify-between pt-2 px-1 text-xs text-white/80">
                        <span className="font-mono text-amber-300 text-[10px]">
                          🎞️ K&amp;P 35mm MEMORY
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedFilmPhoto(null)}
                          className="px-3 py-1 rounded-full bg-rose-600 text-white font-semibold cursor-pointer"
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* ROMANTIC LETTER / GIFT CONFESSION MODAL (Stationery)      */}
            {/* ========================================================= */}
            {isLetterOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Thư tay K&P"
                onClick={(e) => {
                  if (e.target === e.currentTarget) handleCloseLetter();
                }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-pink-950/45 backdrop-blur-md p-3 select-none animate-fade-in overflow-hidden"
              >
                {/* Ambient Sparkles matching reference screenshot */}
                <span className="absolute top-8 left-6 text-white/70 text-lg pointer-events-none select-none animate-pulse">✦</span>
                <span className="absolute top-20 right-8 text-white/60 text-sm pointer-events-none select-none animate-pulse">✧</span>
                <span className="absolute bottom-20 left-8 text-white/60 text-base pointer-events-none select-none animate-pulse">✧</span>
                <span className="absolute bottom-10 right-10 text-white/50 text-sm pointer-events-none select-none animate-pulse">✦</span>

                {/* Round White Close Button in Top-Right corner placed far out as requested */}
                <button
                  type="button"
                  onClick={handleCloseLetter}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer ring-1 ring-black/5"
                  title="Đóng thiệp"
                  aria-label="Đóng thiệp"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {/* Letter Container: Strictly locked to 2:3 aspect ratio so it NEVER stretches */}
                <div className="relative w-full max-w-[340px] sm:max-w-[370px] aspect-[2/3] max-h-[84vh] flex flex-col items-center animate-letter-open select-none drop-shadow-[0_18px_45px_rgba(70,10,25,0.4)]">
                  {/* High Definition Scalloped Stationery & Envelope Background */}
                  <img
                    src="/images/romantic_letter_card.webp"
                    alt="Lá thư và phong bì"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                  />

                  {/* Letter Scrollable Writing Area - fits gracefully onto the ivory paper */}
                  <div
                    ref={letterScrollRef}
                    onScroll={handleCheckLetterScroll}
                    className="absolute top-[11.5%] bottom-[35%] left-[13%] right-[13%] overflow-y-auto px-2 sm:px-3 pt-2 pb-2 text-center z-10 flex flex-col justify-between [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-rose-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-rose-400"
                  >
                    <div>
                      {/* Title: Romantic Cursive matching user reference */}
                      <h3 className="font-handwriting italic font-normal text-[19px] sm:text-[22px] text-[#6b2135] leading-snug tracking-wide text-center max-w-[220px] mx-auto pt-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]">
                        {settings.letterTitle || `Gửi tới ${settings.recipientName} yêu thương,`}
                      </h3>

                      {/* Body: Natural letter typography filling the paper */}
                      <div className="mt-2.5 font-serif text-[12.5px] sm:text-[13.5px] leading-[1.8] text-[#42222b] text-center whitespace-pre-line select-text px-1">
                        {settings.letterContent}
                      </div>
                    </div>

                    {/* Divider + Sign-off + Scroll Pill */}
                    <div className="pt-2">
                      {/* Decorative ✧ ♡ ✧ */}
                      <div className="flex items-center justify-center gap-2 text-rose-400/90 text-xs my-2 select-none">
                        <span>✧</span>
                        <span>♡</span>
                        <span>✧</span>
                      </div>

                      {/* Interactive "Cuộn để đọc tiếp ↓" Pill Button */}
                      {canScrollLetter && (
                        <div className="sticky bottom-0 pt-1 pb-1 flex justify-center z-30">
                          <button
                            type="button"
                            onClick={handleScrollLetterDown}
                            className="px-3.5 py-1 rounded-full bg-[#fffcf7]/95 hover:bg-white text-[#6b2234] text-[11px] font-sans font-medium shadow-xs border border-rose-200/90 backdrop-blur-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer animate-pulse"
                          >
                            <span>Cuộn để đọc tiếp</span>
                            <span className="text-xs">↓</span>
                          </button>
                        </div>
                      )}

                      {/* Sender Sign-off */}
                      <div className="text-center font-serif text-[12px] text-rose-900/90 pt-1">
                        <span className="italic block text-slate-500 text-[9.5px]">Người gửi tặng:</span>
                        <p className="font-handwriting text-base sm:text-[18px] text-rose-800 font-bold mt-0.5">
                          {settings.senderName} ♡
                        </p>
                        {settings.letterSignature && (
                          <p className="font-serif italic text-[10px] text-rose-800/80 mt-0.5">
                            {settings.letterSignature}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            handleCloseLetter();
                            setStage("film");
                          }}
                          className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-[11px] font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          <span>🎞️ Xem phim kỷ niệm</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Wax Seal Touch Target at the bottom */}
                  <button
                    type="button"
                    onClick={() => {
                      confetti({
                        particleCount: 60,
                        spread: 60,
                        origin: { y: 0.8 },
                        colors: ["#ff4d6d", "#ffd166", "#c9184a", "#ff9ebb"],
                      });
                    }}
                    className="absolute bottom-[11%] left-1/2 -translate-x-1/2 w-16 h-16 rounded-full cursor-pointer z-30 opacity-0 active:scale-95"
                    title="Chạm vào sáp niêm phong"
                    aria-label="Chạm sáp niêm phong"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* CUSTOMIZATION DRAWER / MODAL ("hình nên là hình khách chọn...") */}
      {/* ========================================================= */}
      {isConfigOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in text-slate-800"
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-5 border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[24px]">
                  tune
                </span>
                <h2 className="font-serif font-bold text-lg text-slate-900">
                  Tùy chỉnh màn hình quà tặng
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Customization Form */}
            <div className="space-y-4 text-xs font-sans">
              {/* Tên người gửi & Tên người nhận */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên hiển thị người gửi (hiện ở thông báo)
                  </label>
                  <input
                    type="text"
                    value={settings.senderName}
                    onChange={(e) => updateSetting("senderName", e.target.value)}
                    placeholder="VD: Anh iu ❤️"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên người nhận (bé iu / bạn gái)
                  </label>
                  <input
                    type="text"
                    value={settings.recipientName}
                    onChange={(e) => updateSetting("recipientName", e.target.value)}
                    placeholder="VD: Bé iu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
              </div>

              {/* Nội dung thông báo Lockscreen */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung tin nhắn trên màn hình khóa
                </label>
                <input
                  type="text"
                  value={settings.notificationText}
                  onChange={(e) => updateSetting("notificationText", e.target.value)}
                  placeholder="VD: hello bé iu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              {/* Chọn hình nền */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hình nền khóa (Khách tự chọn)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {WALLPAPER_PRESETS.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => updateSetting("wallpaperUrl", p.url)}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-[9/16] h-28 mx-auto w-full transition-all cursor-pointer ${
                        settings.wallpaperUrl === p.url
                          ? "border-rose-600 ring-2 ring-rose-300 scale-102"
                          : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white py-0.5 px-1 truncate text-center">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      upload_file
                    </span>
                    <span>Tải ảnh từ máy bạn</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="text-[11px] text-slate-400">
                    Hỗ trợ JPG, PNG từ điện thoại hoặc máy tính
                  </span>
                </div>
              </div>

              {/* Ảnh đại diện tin nhắn (Avatar Messenger) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 mb-1">
                  Ảnh đại diện tin nhắn (Avatar)
                </label>
                <p className="text-[11.5px] text-slate-500 mb-2.5">
                  Ảnh nền khóa và avatar tin nhắn là 2 ảnh riêng biệt, cho phép tải lên độc lập. Nếu không tải avatar, hệ thống sẽ tự động dùng ảnh mặc định.
                </p>

                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-rose-300 ring-2 ring-rose-100 shrink-0 shadow-xs bg-slate-200">
                    <img
                      src={settings.avatarUrl || "/images/default_avatar.png"}
                      alt="Avatar xem trước"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs transition-all cursor-pointer border border-rose-200 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          upload_file
                        </span>
                        <span>Tải avatar từ máy</span>
                      </button>

                      {settings.avatarUrl && settings.avatarUrl !== "/images/default_avatar.png" && (
                        <button
                          type="button"
                          onClick={() => updateSetting("avatarUrl", "/images/default_avatar.png")}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs transition-all cursor-pointer"
                        >
                          Dùng ảnh mặc định
                        </button>
                      )}
                    </div>

                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <span className="text-[11px] text-slate-400">
                      Định dạng JPG, PNG từ máy bạn
                    </span>
                  </div>
                </div>
              </div>

              {/* Mật mã PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã PIN mở khóa (VD: 2010 hoặc ngày kỷ niệm)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={settings.pin}
                    onChange={(e) => updateSetting("pin", e.target.value)}
                    placeholder="2010"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="enablePin"
                    checked={settings.enablePin}
                    onChange={(e) => updateSetting("enablePin", e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="enablePin"
                    className="font-medium text-slate-700 cursor-pointer"
                  >
                    Bật bước nhập mã PIN (nếu tắt sẽ mở thẳng)
                  </label>
                </div>
              </div>

              {/* Trái tim bay hiệu ứng */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hearts"
                  checked={settings.showFloatingHearts}
                  onChange={(e) =>
                    updateSetting("showFloatingHearts", e.target.checked)
                  }
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="hearts"
                  className="font-medium text-slate-700 cursor-pointer"
                >
                  Hiệu ứng trái tim bay lung linh trên màn hình khóa
                </label>
              </div>

              {/* Danh sách tin nhắn nhắn gửi (1 chiều) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Danh sách tin nhắn hiển thị trong đoạn chat (mỗi dòng 1 tin nhắn)
                </label>
                <textarea
                  rows={5}
                  value={(settings.messages || DEFAULT_MESSAGES).join("\n")}
                  onChange={(e) =>
                    updateSetting(
                      "messages",
                      e.target.value.split("\n").filter((s) => s.trim().length > 0)
                    )
                  }
                  placeholder="Nhập từng tin nhắn trên một dòng..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans text-xs leading-relaxed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Các tin nhắn sẽ lần lượt xuất hiện theo thứ tự kèm hiệu ứng đang gõ tin nhắn (typing dots) siêu mượt
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tin nhắn dẫn tới hộp quà
                </label>
                <input
                  type="text"
                  value={settings.giftLeadMessage}
                  onChange={(e) => updateSetting("giftLeadMessage", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Gửi sau khi người nhận đóng lá thư, ngay trước hộp quà 🎁
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tin nhắn trước ghi âm
                </label>
                <input
                  type="text"
                  value={settings.voiceLeadMessage}
                  onChange={(e) => updateSetting("voiceLeadMessage", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Gửi sau khi xem xong cuộn phim, ngay trước tin nhắn thoại
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tin nhắn sau ghi âm
                </label>
                <input
                  type="text"
                  value={settings.voiceAfterMessage}
                  onChange={(e) => updateSetting("voiceAfterMessage", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Gửi ngay sau tin nhắn thoại
                </span>
              </div>

              {/* Nội dung bức thư tay & tiêu đề thiệp */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tiêu đề bức thiệp
                  </label>
                  <input
                    type="text"
                    value={settings.letterTitle}
                    onChange={(e) => updateSetting("letterTitle", e.target.value)}
                    placeholder="Gửi công chúa của anh ♡"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nội dung thư tay đi kèm (hiện trên thiệp mở)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.letterContent}
                    onChange={(e) => updateSetting("letterContent", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-serif text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lời kết / Chữ ký người gửi tặng
                  </label>
                  <input
                    type="text"
                    value={settings.letterSignature}
                    onChange={(e) => updateSetting("letterSignature", e.target.value)}
                    placeholder="Người luôn yêu và thương em ♡"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-xs"
                  />
                </div>

                {/* Cuộn phim kỷ niệm (Filmstrip) */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-semibold text-slate-700">
                        Cuộn phim kỷ niệm ({settings.filmPhotos?.length || DEFAULT_FILM_PHOTOS.length} ảnh)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Chạy không hồi kết trên nền hoàng hôn mặt hồ lâu đài
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => customizerFilmInputRef.current?.click()}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-all cursor-pointer border border-rose-200"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                      <span>Thêm ảnh</span>
                    </button>
                  </div>

                  <input
                    ref={customizerFilmInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilmPhotosUpload}
                    className="hidden"
                  />

                  {/* Film photo thumbnails preview with delete button */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                    {(settings.filmPhotos || DEFAULT_FILM_PHOTOS).map((photoUrl, idx) => (
                      <div
                        key={idx}
                        className="relative shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-2xs group"
                      >
                        <img
                          src={photoUrl}
                          alt={`Kỷ niệm ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFilmPhoto(idx)}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center text-[10px] opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => updateSetting("filmPhotos", DEFAULT_FILM_PHOTOS)}
                      className="text-[11px] text-rose-600 hover:text-rose-700 underline cursor-pointer"
                    >
                      Khôi phục 5 ảnh mẫu mặc định
                    </button>
                  </div>
                </div>

                {/* Tin nhắn thoại của người tặng */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-700">Tin nhắn thoại</label>
                    <p className="text-[11px] text-slate-500">
                      Được gửi sau khi người nhận xem xong cuộn phim
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleRecording}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer border ${
                        isRecording
                          ? "bg-red-600 text-white border-red-600 animate-pulse"
                          : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isRecording ? "stop_circle" : "mic"}
                      </span>
                      <span>{isRecording ? "Dừng ghi âm" : "Ghi âm"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => voiceFileInputRef.current?.click()}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-all cursor-pointer border border-rose-200"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>Tải file</span>
                    </button>
                    {settings.voiceUrl && (
                      <button
                        type="button"
                        onClick={() => updateSetting("voiceUrl", "")}
                        className="text-[11px] text-rose-600 hover:text-rose-700 underline cursor-pointer"
                      >
                        Xóa ghi âm
                      </button>
                    )}
                  </div>
                  <input
                    ref={voiceFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleVoiceUpload}
                    className="hidden"
                  />
                  {recordError && <p className="text-[11px] text-red-600">{recordError}</p>}
                  {settings.voiceUrl && !isRecording && (
                    <audio controls src={settings.voiceUrl} className="w-full h-9" />
                  )}
                </div>

                {/* Nhạc nền khi mở thư và cuộn phim */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-700">Nhạc nền</label>
                    <p className="text-[11px] text-slate-500">
                      Phát khi mở thư và khi xem cuộn phim (mặc định: nhạc thử public/audio/test-music.wav)
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => musicFileInputRef.current?.click()}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-all cursor-pointer border border-rose-200"
                    >
                      <span className="material-symbols-outlined text-[16px]">library_music</span>
                      <span>Chọn bài khác</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSetting("musicUrl", DEFAULT_MUSIC_URL)}
                      className="text-[11px] text-rose-600 hover:text-rose-700 underline cursor-pointer"
                    >
                      Dùng lại nhạc mặc định
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSetting("musicUrl", "")}
                      className="text-[11px] text-slate-500 hover:text-slate-700 underline cursor-pointer"
                    >
                      Tắt nhạc
                    </button>
                  </div>
                  <input
                    ref={musicFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleMusicUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setSettings(DEFAULT_SETTINGS);
                  localStorage.removeItem("kp_messenger_settings");
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Khôi phục mặc định
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 transition-all cursor-pointer"
                >
                  {copiedLink ? "Đã sao chép link!" : "Sao chép link tặng"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-xs text-white shadow-md transition-all cursor-pointer"
                >
                  Áp dụng &amp; Xem ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Passcode Circular Keypad Button (iOS Crystal Liquid Glass Style - Memoized)
const PasscodeKey = React.memo(function PasscodeKey({
  num,
  sub,
  onPress,
}: {
  num: string;
  sub: string;
  onPress: (digit: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPress(num)}
      className="ios-glass-key w-[74px] h-[74px] rounded-full text-white flex flex-col items-center justify-center cursor-pointer select-none active:scale-92"
    >
      <span className="font-ios font-light text-[35px] leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
        {num}
      </span>
      {sub ? (
        <span className="font-ios font-semibold text-[8.5px] tracking-[0.2em] text-white/95 mt-0.5 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          {sub}
        </span>
      ) : (
        <span className="h-[12px]" />
      )}
    </button>
  );
});


// Official Messenger SVG Logo
function MessengerIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="msgGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0078FF" />
          <stop offset="50%" stopColor="#00C6FF" />
          <stop offset="100%" stopColor="#A033FF" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#msgGrad)" />
      <path
        d="M20 7C12.82 7 7 12.38 7 19c0 3.76 1.88 7.12 4.84 9.27V33l4.52-2.48c1.16.32 2.38.5 3.64.5 7.18 0 13-5.38 13-12S27.18 7 20 7zm1.3 16.24l-3.32-3.54-6.48 3.54 7.13-7.57 3.4 3.54 6.4-3.54-7.13 7.57z"
        fill="white"
      />
    </svg>
  );
}

// Flashlight Icon
function FlashlightIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6c0-2.2-1.8-4-4-4h-4C7.8 2 6 3.8 6 6c0 1.2.5 2.2 1.3 3L9 11v8c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-8l1.7-2c.8-.8 1.3-1.8 1.3-3z" />
      <line x1="6" y1="6" x2="18" y2="6" />
      <line x1="12" y1="12" x2="12" y2="12" />
    </svg>
  );
}

// Camera Icon
function CameraIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default function MessengerTrialPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center text-white text-sm">
          Đang tải...
        </div>
      }
    >
      <MessengerPageInner />
    </Suspense>
  );
}

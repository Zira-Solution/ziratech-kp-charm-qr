"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { BLOCK_LABELS, type BlockId } from "@/components/gift-templates/blocks";
import type { GiftTemplateId } from "@/components/gift-templates/types";
import PreviewOverlay from "@/components/studio/PreviewOverlay";
import { draftFromSaved, draftToPayload, emptyBlocks, emptyDraft, type GiftDraft } from "@/components/studio/draft";
import { Icon } from "@/components/studio/ui";
import MessagePicker from "@/components/studio/MessagePicker";
import BlockFrame from "@/components/studio/BlockFrame";
import TemplatePicker from "@/components/studio/TemplatePicker";
import PreviewCard from "@/components/studio/PreviewCard";
import Stepper, { type Stage } from "@/components/studio/Stepper";
import NamesBlock from "@/components/studio/blocks/NamesBlock";
import LetterBlock from "@/components/studio/blocks/LetterBlock";
import PhotosBlock from "@/components/studio/blocks/PhotosBlock";
import FinalMessageBlock from "@/components/studio/blocks/FinalMessageBlock";
import PinBlock from "@/components/studio/blocks/PinBlock";
import AnniversaryBlock from "@/components/studio/blocks/AnniversaryBlock";
import TimelineBlock from "@/components/studio/blocks/TimelineBlock";
import VideoBlock from "@/components/studio/blocks/VideoBlock";
import MusicBlock from "@/components/studio/blocks/MusicBlock";
import VoiceBlock from "@/components/studio/blocks/VoiceBlock";
import { getTemplate, getTemplateAllowedBlocks } from "@/components/gift-templates/template-config";
import { parseGiftData } from "@/lib/validation/gift";
import { ToastContainer, useToastState } from "@/components/ui/Toast";

interface StudioProduct {
  token: string;
  chainName: string;
  status: string;
  customerName: string;
}

type FieldErrors = { recipientName?: string; letterContent?: string };

export default function CardStudioPage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params?.token ?? "").toUpperCase();

  const { toasts, showToast, dismissToast } = useToastState();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<StudioProduct | null>(null);
  const [loadError, setLoadError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const [draft, setDraft] = useState<GiftDraft>(emptyDraft());
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  // The writing desk has three steps: 1. Pick template & blocks, 2. Write content, 3. Finish & Save.
  const [stage, setStage] = useState<Stage>(1);
  const [reached, setReached] = useState<Stage>(1);
  const focusTarget = useRef<string | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<GiftTemplateId>("storybook-sunset");
  const [previewInitialMode, setPreviewInitialMode] = useState<"demo" | "draft">("demo");
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const openPreview = (tpl?: GiftTemplateId, mode: "demo" | "draft" = "demo") => {
    setPreviewTemplate(tpl || draft.template);
    setPreviewInitialMode(mode);
    setPreviewOpen(true);
  };

  const DRAFT_KEY = (t: string) => `kp_draft_v1_${t.toUpperCase()}`;
  const STAGE_KEY = (t: string) => `kp_stage_v1_${t.toUpperCase()}`;

  // Load the order and any card that was already saved.
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`/api/gifts/${token}?as=create`, { cache: "no-store" });
        const data = await res.json();
        if (res.status === 401) setNeedsAuth(true);
        if (!res.ok || !data.success || data.scope !== "create") {
          throw new Error(data.error || "Không tìm thấy thiệp với mã này");
        }
        setProduct(data.product);

        const saved = data.product.giftData;
        const loaded = draftFromSaved(saved);

        // Check for locally auto-saved draft
        let initialDraft = loaded;
        let restoredLocal = false;
        try {
          const rawLocal = localStorage.getItem(DRAFT_KEY(token));
          if (rawLocal) {
            const parsed = JSON.parse(rawLocal);
            if (parsed && typeof parsed === "object") {
              const hasContent =
                Boolean(parsed.recipientName?.trim()) ||
                (Array.isArray(parsed.blocks) && parsed.blocks.length > 0) ||
                Boolean(parsed.letterContent?.trim());
              if (!saved && hasContent) {
                initialDraft = { ...loaded, ...parsed };
                restoredLocal = true;
              } else if (saved && hasContent && parsed._updatedAt) {
                const serverTime = new Date(data.product.completedAt || data.product.createdAt || 0).getTime();
                if (parsed._updatedAt > serverTime) {
                  initialDraft = { ...loaded, ...parsed };
                  restoredLocal = true;
                }
              }
            }
          }
        } catch {
          // ignore localStorage error
        }

        setDraft(initialDraft);
        setPreviewTemplate(initialDraft.template);

        // Restore stage position
        let initialStage: Stage = 1;
        let initialReached: Stage = 1;
        try {
          const rawStage = Number(localStorage.getItem(STAGE_KEY(token)));
          if (rawStage >= 1 && rawStage <= 3) {
            initialStage = rawStage as Stage;
            initialReached = Math.max(1, rawStage) as Stage;
          } else if (data.product.status === "completed" || (saved && initialDraft.blocks.length > 0)) {
            // When already saved or completed, start at Step 3 summary
            initialStage = 3;
            initialReached = 3;
          }
        } catch {
          if (data.product.status === "completed" || (saved && initialDraft.blocks.length > 0)) {
            initialStage = 3;
            initialReached = 3;
          }
        }
        setStage(initialStage);
        setReached(initialReached);

        if (restoredLocal) {
          showToast("✨ Đã tự động khôi phục bản nháp bạn đang viết dở.", "success", 4000);
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Không tải được thông tin thiệp");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty || saving) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saving]);

  const update = useCallback((patch: Partial<GiftDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
    setErrors((e) => ({
      recipientName: "recipientName" in patch ? undefined : e.recipientName,
      letterContent: "letterContent" in patch ? undefined : e.letterContent,
    }));
  }, []);

  // When changing template, automatically prune any blocks not supported by the new template
  const handleTemplateChange = (newTemplate: GiftTemplateId) => {
    const allowed = getTemplateAllowedBlocks(newTemplate);
    const filteredBlocks = draft.blocks.filter((b) => allowed.includes(b));
    const pruned = draft.blocks.length - filteredBlocks.length;
    update({ template: newTemplate, blocks: filteredBlocks });
    setPreviewTemplate(newTemplate);
    const tplInfo = getTemplate(newTemplate);
    if (pruned > 0) {
      showToast(`Đã chuyển sang mẫu "${tplInfo?.name}". Các mục không hỗ trợ đã tự động bỏ chọn.`, "info", 3500);
    }
  };

  // The announcement is read out by screen readers when a message is moved or removed.
  const [announcement, setAnnouncement] = useState("");

  const toggleBlock = (block: BlockId) => {
    const ticked = draft.blocks.includes(block);
    update({ blocks: ticked ? draft.blocks.filter((b) => b !== block) : [...draft.blocks, block] });
    const text = ticked ? `Đã bỏ mục ${BLOCK_LABELS[block]}` : `Đã thêm mục ${BLOCK_LABELS[block]}`;
    setAnnouncement(text);
    showToast(text, "info", 2500);
  };

  const moveBlock = (block: BlockId, direction: -1 | 1) => {
    const from = draft.blocks.indexOf(block);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= draft.blocks.length) return;
    const blocks = [...draft.blocks];
    [blocks[from], blocks[to]] = [blocks[to], blocks[from]];
    update({ blocks });
    const text = `Mục ${BLOCK_LABELS[block]} đang ở vị trí ${to + 1} trên ${blocks.length}`;
    setAnnouncement(text);
    showToast(text, "info", 2500);
  };


  // Auto-save draft and stage to localStorage on every change
  useEffect(() => {
    if (!token || loading) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY(token),
          JSON.stringify({ ...draft, _updatedAt: Date.now() })
        );
        localStorage.setItem(STAGE_KEY(token), String(stage));
      } catch {
        // ignore localStorage errors
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, stage, token, loading]);

  // After a step opens, land on the field that needs attention, or at the top of the new step.
  useEffect(() => {
    const target = focusTarget.current;
    focusTarget.current = null;
    if (!target) {
      window.scrollTo({ top: 0 });
      return;
    }
    const el = (document.getElementById(target)?.offsetParent !== null
      ? document.getElementById(target)
      : document.getElementById(`m-${target}`)) ?? document.getElementById(target);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
  }, [stage]);

  const go = (to: Stage) => {
    setStage(to);
  };

  const handleResetDraft = () => {
    setConfirmResetOpen(true);
  };

  const executeResetDraft = () => {
    setConfirmResetOpen(false);
    try {
      localStorage.removeItem(DRAFT_KEY(token));
      localStorage.removeItem(STAGE_KEY(token));
    } catch {
      // ignore
    }
    setDraft(emptyDraft());
    setStage(1);
    setReached(1);
    setDirty(false);
    showToast("✨ Đã làm mới bàn viết về trắng tinh.", "info", 3000);
  };

  /** The first thing the server would refuse, and which step and field it lives in. */
  const firstProblem = (): { stage: Stage; message: string; target: string } | null => {
    if (!draft.recipientName.trim()) return { stage: 1, message: "Vui lòng nhập tên người nhận", target: "names-recipient" };
    if (draft.blocks.length === 0) return { stage: 1, message: "Hãy tích chọn ít nhất một thông điệp để gửi", target: "messages-title" };
    const empty = emptyBlocks(draft)[0];
    if (empty) {
      return {
        stage: 2,
        message: `Mục ${BLOCK_LABELS[empty]} đang trống, hãy điền hoặc bỏ tích`,
        target: empty === "letter" ? "letter-content" : `block-${empty}`,
      };
    }
    return null;
  };

  const showProblem = (p: { stage: Stage; message: string; target: string }) => {
    setErrors(p.target === "names-recipient" ? { recipientName: p.message } : p.target === "letter-content" ? { letterContent: p.message } : {});
    showToast(p.message, "warning");
    if (p.stage === stage) {
      requestAnimationFrame(() => {
        const el = (document.getElementById(p.target)?.offsetParent !== null
          ? document.getElementById(p.target)
          : document.getElementById(`m-${p.target}`)) ?? document.getElementById(p.target);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus({ preventScroll: true });
      });
    } else {
      focusTarget.current = p.target;
      setStage(p.stage);
    }
  };

  const goNext = () => {
    const p = firstProblem();
    if (p && p.stage <= stage) return showProblem(p);
    const to = (stage + 1) as Stage;
    setReached((r) => (to > r ? to : r));
    go(to);
  };

  const save = async () => {
    if (saving) return;

    const problem = firstProblem();
    if (problem) return showProblem(problem);

    const body = draftToPayload(draft);

    // Same checks the server runs, so mistakes in links, dates or milestones are caught before sending.
    const checked = parseGiftData(body.giftData, { token });
    if (!checked.ok) {
      showToast(checked.error, "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/gifts/${token}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) setNeedsAuth(true);
        const errMsg = data.error || "Không lưu được thiệp";
        showToast(
          <span>
            {errMsg}
            {res.status === 401 && (
              <>
                {" "}
                <Link href={`/gift?token=${encodeURIComponent(token)}`} className="underline font-bold">
                  Nhập lại OTP tạo thiệp
                </Link>
              </>
            )}
          </span>,
          "error",
          6000
        );
        throw new Error(errMsg);
      }

      setDirty(false);
      try {
        localStorage.setItem(DRAFT_KEY(token), JSON.stringify({ ...draft, _updatedAt: Date.now() }));
        localStorage.setItem(STAGE_KEY(token), "3");
      } catch {}
      showToast("Đã lưu thiệp thành công!", "success");
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#721a28", "#ffd700", "#fea095", "#ffffff"] });
      setTimeout(() => router.push(`/g/${token}`), 900);
    } catch (err) {
      if (!needsAuth) {
        showToast(err instanceof Error ? err.message : "Không lưu được thiệp", "error");
      }
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
        <div role="status" className="text-center">
          <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin inline-block mb-3" />
          <p className="text-sm text-primary font-bold">Đang mở bàn viết thiệp của bạn...</p>
        </div>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
        <div role="alert" className="p-8 rounded-3xl liquid-glass bg-white/90 border border-white/95 max-w-md text-center shadow-xl">
          <Icon name="error" className="text-4xl text-rose-600 mb-2" />
          <h1 className="text-xl font-bold text-primary">{needsAuth ? "Cần Nhập OTP Tạo Thiệp" : "Mã Thiệp Không Hợp Lệ"}</h1>
          <p className="text-xs text-on-surface-variant font-sans mt-2">{loadError || "Không tìm thấy thiệp."}</p>
          <Link
            href={needsAuth ? `/gift?token=${encodeURIComponent(token)}` : "/gift"}
            className="mt-6 inline-block py-2.5 px-6 rounded-xl liquid-glass-btn-primary text-white text-xs font-bold font-sans"
          >
            {needsAuth ? "Nhập OTP Tạo Thiệp" : "Nhập Lại Mã Khác"}
          </Link>
        </div>
      </div>
    );
  }

  let step = 0;
  const nextStep = () => ++step;

  const renderBlock = (block: BlockId) => {
    switch (block) {
      case "letter":
        return <LetterBlock key={block} step={nextStep()} draft={draft} onChange={update} errors={errors} />;
      case "photos":
        return (
          <PhotosBlock
            key={block}
            id="photos"
            step={nextStep()}
            title="Album ảnh kỷ niệm"
            hint="Tối đa 6 ảnh, ảnh đầu tiên là ảnh bìa. Ảnh được tự nén chất lượng cao để tải nhanh."
            items={draft.photos}
            max={6}
            showDate
            onChange={(photos) => update({ photos })}
          />
        );
      case "finalMessage":
        return <FinalMessageBlock key={block} step={nextStep()} draft={draft} onChange={update} />;
      case "anniversary":
        return <AnniversaryBlock key={block} step={nextStep()} draft={draft} onChange={update} />;
      case "timeline":
        return <TimelineBlock key={block} step={nextStep()} items={draft.timeline} onChange={(timeline) => update({ timeline })} />;
      case "music":
        return <MusicBlock key={block} step={nextStep()} draft={draft} onChange={update} />;
      case "voice":
        return <VoiceBlock key={block} step={nextStep()} token={token} draft={draft} onChange={update} />;
      case "video":
        return <VideoBlock key={block} step={nextStep()} draft={draft} onChange={update} />;
      default:
        return null;
    }
  };

  const last = stage === 3;

  return (
    <div className="min-h-screen bg-white text-on-surface pb-16 sm:pb-24 font-sans relative overflow-x-hidden">
      {/* Ambient background light orbs for liquid glass optical depth & refraction */}
      <div aria-hidden="true" className="pointer-events-none fixed -top-40 -right-32 h-[450px] w-[450px] rounded-full bg-rose-200/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none fixed top-1/3 -left-32 h-[400px] w-[400px] rounded-full bg-pink-100/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none fixed -bottom-32 right-1/4 h-[420px] w-[420px] rounded-full bg-amber-100/25 blur-3xl" />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Luxury Brand Header */}
      <header className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <Link
            href="/"
            onClick={(e) => {
              if (dirty) {
                const ok = window.confirm(
                  "Bạn có thay đổi chưa bấm lưu hoàn tất. Bạn có muốn về trang chủ không? (Bản nháp của bạn vẫn được tự động lưu an toàn trên máy)."
                );
                if (!ok) e.preventDefault();
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-[#721a28] text-xs font-bold border border-rose-200/80 hover:bg-white shadow-2xs transition-all"
          >
            <img src="/images/logo_icon_kp.png" alt="Team K&P" className="w-4 h-4 object-contain" />
            <span>K&amp;P Atelier · Về trang chủ</span>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleResetDraft}
              title="Xóa nháp và làm mới lại bàn viết trắng tinh"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill border border-slate-200/90 text-slate-500 hover:text-[#721a28] hover:border-rose-200 text-xs font-medium shadow-2xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">restart_alt</span>
              <span>Làm mới bàn viết</span>
            </button>
            {dirty ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill border border-amber-200/90 bg-amber-50/70 text-amber-800 font-semibold text-xs shadow-2xs">
                <span className="material-symbols-outlined text-[15px] text-amber-600">save</span>
                <span>Tự động lưu nháp</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill border border-emerald-200/90 bg-emerald-50/70 text-emerald-800 font-semibold text-xs shadow-2xs">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                <span>Đã lưu hoàn tất</span>
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#721a28] tracking-tight font-serif">
          Bàn Viết Thiệp Quà Số
        </h1>
        <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
          Tự tay chọn phong cách thiệp, viết thư tay và gửi gắm những bức ảnh kỷ niệm đến người bạn trân quý trước khi trao tặng.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 liquid-glass-pill px-3 py-1 font-mono text-[#721a28] shadow-2xs">
            <span className="material-symbols-outlined text-[14px]">confirmation_number</span>
            {product.token}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 liquid-glass-pill px-3 py-1 text-slate-700 shadow-2xs">
            <Icon name="diamond" className="text-[16px] text-[#721a28]" />
            {product.chainName}
          </span>
          <span
            className={`rounded-full border px-3 py-1 liquid-glass-pill ${
              product.status === "completed"
                ? "border-emerald-200/80 text-emerald-800"
                : "border-amber-200/80 text-amber-800"
            }`}
          >
            {product.status === "completed" ? "Đã có bản lưu" : "Bản nháp mới"}
          </span>
        </div>
      </header>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <main className="mx-auto grid max-w-6xl items-start gap-6 px-4 sm:px-6 lg:grid-cols-12 relative z-10">
        <div className="space-y-6 lg:col-span-8">
          <Stepper stage={stage} reached={reached} onGo={go} />

          {/* STAGE 1: Pick template FIRST, then message blocks supported by template */}
          {stage === 1 && (
            <div className="space-y-6">
              <TemplatePicker
                step={nextStep()}
                value={draft.template}
                onChange={handleTemplateChange}
                onPreview={(tplId) => openPreview(tplId, "demo")}
              />
              {/* On mobile screens (< lg), show NamesBlock in the step flow */}
              <div className="lg:hidden">
                <NamesBlock
                  draft={draft}
                  onChange={update}
                  errors={errors}
                  idPrefix="m-"
                  customerName={product.customerName}
                />
              </div>
              <MessagePicker
                step={nextStep()}
                value={draft.blocks}
                allowedBlocks={getTemplateAllowedBlocks(draft.template)}
                templateName={getTemplate(draft.template)?.name}
                onToggle={toggleBlock}
              />
            </div>
          )}

          {/* STAGE 2: Write & Arrange the chosen content blocks */}
          {stage === 2 && (
            <div className="space-y-6">
              {draft.blocks.length === 0 ? (
                <div role="status" className="rounded-3xl liquid-glass-section border border-rose-200/80 p-8 text-center shadow-sm">
                  <p className="text-base font-bold text-slate-800">Bạn chưa chọn thông điệp nào.</p>
                  <p className="text-xs text-slate-500 mt-1">Hãy quay lại bước 1 để tích chọn những thông điệp bạn muốn đưa vào thiệp.</p>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="mt-4 inline-flex min-h-11 items-center rounded-xl liquid-glass-btn-primary px-5 text-sm font-bold text-white shadow-xs cursor-pointer"
                  >
                    Quay lại bước 1 để chọn
                  </button>
                </div>
              ) : (
                draft.blocks.map((block, index) => (
                  <BlockFrame
                    key={block}
                    block={block}
                    index={index}
                    count={draft.blocks.length}
                    onMove={(direction) => moveBlock(block, direction)}
                    onRemove={() => toggleBlock(block)}
                  >
                    {renderBlock(block)}
                  </BlockFrame>
                ))
              )}
            </div>
          )}

          {/* STAGE 3: Finalize, summary, wax seal PIN and save */}
          {stage === 3 && (
            <div className="space-y-6">
              <section aria-labelledby="summary-title" className="rounded-3xl liquid-glass-section border border-rose-200/80 p-6 sm:p-7 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 id="summary-title" className="text-lg font-bold text-slate-800 tracking-tight sm:text-xl">
                      Thiệp của bạn đã sẵn sàng
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phong cách: <strong className="text-[#721a28]">{getTemplate(draft.template)?.name}</strong> · Người nhận: <strong className="text-[#721a28]">{draft.recipientName || "Chưa nhập"}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-pill border border-rose-200 text-xs font-bold text-[#721a28] hover:bg-rose-50 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Icon name="tune" className="text-[16px]" />
                    Đổi mẫu / thông điệp
                  </button>
                </div>

                <div className="rounded-2xl liquid-glass-subtle p-4 border border-rose-100 mb-5">
                  <p className="text-xs font-bold text-slate-700 mb-2">Thứ tự các trang gửi trao ({draft.blocks.length} trang):</p>
                  <ol className="flex flex-wrap gap-2">
                    {draft.blocks.map((b, i) => (
                      <li key={b} className="inline-flex items-center gap-1.5 rounded-xl liquid-glass-pill border border-rose-200/60 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full liquid-glass-btn-primary text-[10px] font-bold text-white">
                          {i + 1}
                        </span>
                        {BLOCK_LABELS[b]}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => go(2)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl liquid-glass-btn-secondary px-4 text-xs font-bold text-[#721a28] cursor-pointer transition-colors"
                  >
                    <Icon name="edit" className="text-[16px]" />
                    Sửa nội dung hoặc thứ tự các trang
                  </button>
                  <button
                    type="button"
                    onClick={() => openPreview(undefined, draft.blocks.length > 0 ? "draft" : "demo")}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl liquid-glass-btn-primary text-white px-5 text-xs font-bold cursor-pointer shadow-xs transition-colors"
                  >
                    <Icon name="visibility" className="text-[18px]" />
                    Mở xem trước thiệp thực tế
                  </button>
                </div>
              </section>

              <PinBlock step={nextStep()} draft={draft} onChange={update} />
            </div>
          )}

          {/* Action Navigation Buttons placed directly in page content */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-200/80">
            <div>
              {stage > 1 && (
                <button
                  type="button"
                  onClick={() => go((stage - 1) as Stage)}
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-2xl liquid-glass-btn-secondary px-6 text-sm sm:text-base font-bold text-slate-700 cursor-pointer transition-all shadow-xs"
                >
                  <Icon name="arrow_back" className="text-[20px]" />
                  Quay lại
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={last ? save : goNext}
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl liquid-glass-btn-primary px-8 text-sm sm:text-base font-bold text-white cursor-pointer disabled:opacity-60 hover:shadow-lg transition-all sm:min-w-56"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang lưu thiệp...
                </>
              ) : last ? (
                <>
                  <Icon name="favorite" className="text-[20px]" />
                  Lưu thiệp hoàn tất
                </>
              ) : (
                <>
                  Tiếp tục
                  <Icon name="arrow_forward" className="text-[20px]" />
                </>
              )}
            </button>
          </div>
        </div>

        <aside className="hidden space-y-4 lg:sticky lg:top-6 lg:col-span-4 lg:block">
          <PreviewCard draft={draft} onOpenFullPreview={() => openPreview(undefined, draft.blocks.length > 0 ? "draft" : "demo")} />
          <NamesBlock
            draft={draft}
            onChange={update}
            errors={errors}
            customerName={product.customerName}
            compact
          />
          <p className="px-1 text-center text-xs leading-relaxed text-slate-500">
            {draft.requirePin ? (
              <>
                Người nhận mở thiệp bằng <strong>mã thiệp</strong> và <strong>mã OTP {draft.unlockPin ? `(${draft.unlockPin})` : "bảo mật"}</strong>.
              </>
            ) : (
              <>
                Chế độ <strong>mở trực tiếp</strong>: Người nhận quét QR hoặc bấm link là xem được ngay (không cần OTP).
              </>
            )}
          </p>
        </aside>
      </main>


      {previewOpen && (
        <PreviewOverlay
          draft={draft}
          template={previewTemplate}
          initialMode={previewInitialMode}
          onTemplateChange={(tpl) => {
            setPreviewTemplate(tpl);
            update({ template: tpl });
          }}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {confirmResetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
        >
          <div className="w-full max-w-sm rounded-3xl liquid-glass-card border border-rose-200/90 p-6 text-center shadow-2xl bg-white/95">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-[#721a28]">
              <span className="material-symbols-outlined text-[24px]">restart_alt</span>
            </div>
            <h3 id="reset-modal-title" className="text-base font-bold text-slate-800">
              Làm mới bàn viết?
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Toàn bộ nội dung bản nháp trên máy này sẽ được đưa về trắng tinh để bạn bắt đầu viết lại từ đầu.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={executeResetDraft}
                className="flex-1 py-2.5 rounded-xl liquid-glass-btn-primary text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { BLOCK_LABELS, type BlockId } from "@/components/gift-templates/blocks";
import type { GiftTemplateId } from "@/components/gift-templates/types";
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
import { parseGiftData } from "@/lib/validation/gift";

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

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<StudioProduct | null>(null);
  const [loadError, setLoadError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const [draft, setDraft] = useState<GiftDraft>(emptyDraft());
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Load the order and any card that was already saved.
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`/api/gifts/${token}?as=create`);
        const data = await res.json();
        if (res.status === 401) setNeedsAuth(true);
        if (!res.ok || !data.success || data.scope !== "create") {
          throw new Error(data.error || "Không tìm thấy thiệp với mã này");
        }
        setProduct(data.product);

        const saved = data.product.giftData;
        const loaded = draftFromSaved(saved);
        if (!saved && !loaded.senderName) loaded.senderName = data.product.customerName || "";
        setDraft(loaded);
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

  // The announcement is read out by screen readers when a message is moved or removed.
  const [announcement, setAnnouncement] = useState("");

  const toggleBlock = (block: BlockId) => {
    const ticked = draft.blocks.includes(block);
    update({ blocks: ticked ? draft.blocks.filter((b) => b !== block) : [...draft.blocks, block] });
    setAnnouncement(ticked ? `Đã bỏ mục ${BLOCK_LABELS[block]}` : `Đã thêm mục ${BLOCK_LABELS[block]}`);
  };

  const moveBlock = (block: BlockId, direction: -1 | 1) => {
    const from = draft.blocks.indexOf(block);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= draft.blocks.length) return;
    const blocks = [...draft.blocks];
    [blocks[from], blocks[to]] = [blocks[to], blocks[from]];
    update({ blocks });
    setAnnouncement(`Mục ${BLOCK_LABELS[block]} đang ở vị trí ${to + 1} trên ${blocks.length}`);
  };

  // The writing desk has three steps: choose what to send, write it, finish. Each step is confirmed with "Tiếp tục".
  const [stage, setStage] = useState<Stage>(1);
  const [reached, setReached] = useState<Stage>(1);
  const [stageError, setStageError] = useState("");
  const focusTarget = useRef<string | null>(null);

  // After a step opens, land on the field that needs attention, or at the top of the new step.
  useEffect(() => {
    const target = focusTarget.current;
    focusTarget.current = null;
    if (!target) {
      window.scrollTo({ top: 0 });
      return;
    }
    const el = document.getElementById(target);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
  }, [stage]);

  const go = (to: Stage) => {
    setStage(to);
    setStageError("");
    setSaveError("");
  };

  /** The first thing the server would refuse, and which step and field it lives in. */
  const firstProblem = (): { stage: Stage; message: string; target: string } | null => {
    if (!draft.recipientName.trim()) return { stage: 1, message: "Vui lòng nhập tên người nhận", target: "names-recipient" };
    if (draft.blocks.length === 0) return { stage: 1, message: "Hãy chọn ít nhất một thông điệp", target: "messages-title" };
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
    setStageError(p.message);
    if (p.stage === stage) {
      requestAnimationFrame(() => {
        const el = document.getElementById(p.target);
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
    setSaveError("");
    setStageError("");

    const problem = firstProblem();
    if (problem) return showProblem(problem);

    const body = draftToPayload(draft);

    // Same checks the server runs, so mistakes in links, dates or milestones are caught before sending.
    const checked = parseGiftData(body.giftData, { token });
    if (!checked.ok) {
      setSaveError(checked.error);
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
        throw new Error(data.error || "Không lưu được thiệp");
      }

      setDirty(false);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#721a28", "#ffd700", "#fea095", "#ffffff"] });
      setTimeout(() => router.push(`/g/${token}?tpl=${draft.template}`), 900);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Không lưu được thiệp");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-cream flex items-center justify-center p-4 font-serif">
        <div role="status" className="text-center">
          <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin inline-block mb-3" />
          <p className="text-sm text-primary font-bold">Đang mở bàn viết thiệp của bạn...</p>
        </div>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen bg-rose-cream flex items-center justify-center p-4 font-serif">
        <div role="alert" className="p-8 rounded-3xl liquid-glass bg-white/90 border border-white/95 max-w-md text-center shadow-xl">
          <Icon name="error" className="text-4xl text-rose-600 mb-2" />
          <h1 className="text-xl font-bold text-primary">{needsAuth ? "Cần Nhập OTP Tạo Thiệp" : "Mã Thiệp Không Hợp Lệ"}</h1>
          <p className="text-xs text-on-surface-variant font-sans mt-2">{loadError || "Không tìm thấy thiệp."}</p>
          <Link
            href={needsAuth ? `/gift?token=${encodeURIComponent(token)}` : "/gift"}
            className="mt-6 inline-block py-2.5 px-6 rounded-xl liquid-glass-btn-primary text-white text-xs font-bold font-serif"
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
            hint="Tối đa 6 ảnh, ảnh đầu tiên là ảnh bìa. Ảnh được tự thu nhỏ để tải nhanh, bạn không cần chỉnh trước."
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

  const problemText = stageError || saveError;
  const last = stage === 3;

  return (
    <div className="min-h-screen bg-white text-on-surface pb-40 lg:pb-32">
      <header className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary">
          <Icon name="arrow_back" className="text-[18px]" />
          K&amp;P Atelier
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-on-surface sm:text-3xl">Bàn viết thiệp</h1>
        <p className="mt-1 max-w-2xl text-base leading-relaxed text-on-surface-variant">
          Làm theo 3 bước: chọn những gì muốn gửi, soạn nội dung, rồi hoàn tất. Bạn có thể lưu và quay lại sửa tiếp bất cứ lúc nào.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="rounded-full border border-rose-petal bg-surface-container-low px-3 py-1 font-mono text-primary-container">{product.token}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-petal bg-white px-3 py-1 text-on-surface">
            <Icon name="diamond" className="text-[16px]" />
            {product.chainName}
          </span>
          <span
            className={`rounded-full border px-3 py-1 ${
              product.status === "completed" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-amber-300 bg-amber-50 text-amber-900"
            }`}
          >
            {product.status === "completed" ? "Đã có bản lưu" : "Chưa lưu thiệp"}
          </span>
          {dirty && <span className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-rose-800">Có thay đổi chưa lưu</span>}
        </div>
      </header>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <main className="mx-auto grid max-w-6xl items-start gap-6 px-4 sm:px-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Stepper stage={stage} reached={reached} onGo={go} />

          {stage === 1 && (
            <>
              <NamesBlock step={nextStep()} draft={draft} onChange={update} errors={errors} />
              <MessagePicker step={nextStep()} value={draft.blocks} onToggle={toggleBlock} />
            </>
          )}

          {stage === 2 &&
            (draft.blocks.length === 0 ? (
              <div role="status" className="rounded-2xl border border-rose-petal bg-white p-6 text-center">
                <p className="text-base font-semibold text-on-surface">Bạn chưa chọn thông điệp nào.</p>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="mt-3 inline-flex min-h-11 items-center rounded-xl border-2 border-primary-container px-4 text-sm font-bold text-primary-container cursor-pointer hover:bg-surface-container-low"
                >
                  Quay lại để chọn
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
            ))}

          {stage === 3 && (
            <>
              <section aria-labelledby="summary-title" className="rounded-2xl border border-rose-petal bg-white p-5 shadow-sm sm:p-6">
                <h2 id="summary-title" className="text-lg font-bold text-on-surface sm:text-xl">
                  Thiệp của bạn gồm
                </h2>
                <ol className="mt-3 flex flex-wrap gap-2">
                  {draft.blocks.map((b, i) => (
                    <li key={b} className="rounded-full border border-rose-petal bg-surface-container-low px-3 py-1 text-sm font-semibold text-on-surface">
                      {i + 1}. {BLOCK_LABELS[b]}
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() => go(2)}
                  className="mt-3 inline-flex min-h-11 items-center rounded-xl border-2 border-primary-container px-4 text-sm font-bold text-primary-container cursor-pointer hover:bg-surface-container-low"
                >
                  Sửa nội dung hoặc thứ tự
                </button>
              </section>
              <TemplatePicker step={nextStep()} value={draft.template} onChange={(template: GiftTemplateId) => update({ template })} />
              <PinBlock step={nextStep()} draft={draft} onChange={update} />
            </>
          )}
        </div>

        <aside className="hidden space-y-4 lg:sticky lg:top-6 lg:col-span-4 lg:block">
          <PreviewCard draft={draft} />
          <p className="px-1 text-sm leading-relaxed text-warm-neutral">
            Người nhận mở thiệp ở trang chủ bằng <strong>mã thiệp</strong> và <strong>OTP xem thiệp</strong>.
          </p>
        </aside>
      </main>

      {/* Always in reach: go back, or confirm this step and move on. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-rose-petal bg-white px-4 py-3">
        <div className="mx-auto max-w-6xl">
          {problemText && (
            <div role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-800">
              <Icon name="error" className="mt-0.5 text-[20px]" />
              <span>
                {problemText}
                {needsAuth && (
                  <>
                    {" "}
                    <Link href={`/gift?token=${encodeURIComponent(token)}`} className="underline">
                      Nhập lại OTP tạo thiệp
                    </Link>
                  </>
                )}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            {stage > 1 ? (
              <button
                type="button"
                onClick={() => go((stage - 1) as Stage)}
                className="inline-flex min-h-12 items-center gap-1 rounded-xl border-2 border-rose-petal bg-white px-4 text-base font-bold text-on-surface cursor-pointer hover:border-primary-container"
              >
                <Icon name="arrow_back" className="text-[20px]" />
                Quay lại
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={last ? save : goNext}
              disabled={saving}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl liquid-glass-btn-primary px-6 text-base font-bold text-white cursor-pointer disabled:opacity-60 sm:flex-none sm:min-w-56"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang lưu thiệp...
                </>
              ) : last ? (
                <>
                  <Icon name="favorite" className="text-[20px]" />
                  Lưu thiệp
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
      </div>
    </div>
  );
}

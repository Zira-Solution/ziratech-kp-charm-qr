"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { getTemplate, templateHasBlock, type BlockId } from "@/components/gift-templates/template-config";
import type { GiftTemplateId } from "@/components/gift-templates/types";
import { draftFromSaved, draftToPayload, emptyDraft, type GiftDraft } from "@/components/studio/draft";
import { BLOCK_ORDER, IMPLEMENTED_BLOCKS } from "@/components/studio/implemented";
import { Icon } from "@/components/studio/ui";
import TemplatePicker from "@/components/studio/TemplatePicker";
import PreviewCard from "@/components/studio/PreviewCard";
import NamesBlock from "@/components/studio/blocks/NamesBlock";
import LetterBlock from "@/components/studio/blocks/LetterBlock";
import PhotosBlock from "@/components/studio/blocks/PhotosBlock";
import FinalMessageBlock from "@/components/studio/blocks/FinalMessageBlock";
import PinBlock from "@/components/studio/blocks/PinBlock";
import AnniversaryBlock from "@/components/studio/blocks/AnniversaryBlock";
import TimelineBlock from "@/components/studio/blocks/TimelineBlock";
import VideoBlock from "@/components/studio/blocks/VideoBlock";
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
  const saveErrorRef = useRef<HTMLDivElement>(null);

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

  const save = async () => {
    if (saving) return;
    setSaveError("");

    const found: FieldErrors = {};
    if (!draft.recipientName.trim()) found.recipientName = "Vui lòng nhập tên người nhận";
    if (!draft.letterContent.trim()) found.letterContent = "Vui lòng viết lời nhắn gửi vào bức thư";
    setErrors(found);
    if (found.recipientName || found.letterContent) {
      const firstId = found.recipientName ? "names-recipient" : "letter-content";
      document.getElementById(firstId)?.focus();
      document.getElementById(firstId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Same checks the server runs, so mistakes in links, dates or milestones are caught before sending.
    const checked = parseGiftData(draftToPayload(draft).giftData, { token });
    if (!checked.ok) {
      setSaveError(checked.error);
      requestAnimationFrame(() => saveErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/gifts/${token}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftToPayload(draft)),
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
      requestAnimationFrame(() => saveErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
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

  const info = getTemplate(draft.template);
  const visible = BLOCK_ORDER.filter((b) => IMPLEMENTED_BLOCKS.has(b) && templateHasBlock(draft.template, b));

  let step = 0;
  const next = () => ++step;

  const renderBlock = (block: BlockId) => {
    switch (block) {
      case "letter":
        return <LetterBlock key={block} step={next()} draft={draft} onChange={update} errors={errors} />;
      case "photos":
        return (
          <PhotosBlock
            key={block}
            id="photos"
            step={next()}
            title="Album ảnh kỷ niệm"
            hint="Tối đa 6 ảnh. Ảnh được tự thu nhỏ để tải nhanh, bạn không cần chỉnh trước."
            items={draft.photos}
            max={6}
            showDate
            onChange={(photos) => update({ photos })}
          />
        );
      case "highlight":
        return (
          <PhotosBlock
            key={block}
            id="highlight"
            step={next()}
            title={info && info.highlightMax === 1 ? "Ảnh bìa" : "Ảnh nổi bật"}
            hint={`Ảnh lớn đặt ở vị trí đẹp nhất của thiệp (tối đa ${info?.highlightMax ?? 1} ảnh).`}
            items={draft.highlights}
            max={info?.highlightMax ?? 1}
            onChange={(highlights) => update({ highlights })}
          />
        );
      case "finalMessage":
        return <FinalMessageBlock key={block} step={next()} draft={draft} onChange={update} />;
      case "anniversary":
        return <AnniversaryBlock key={block} step={next()} draft={draft} onChange={update} />;
      case "timeline":
        return <TimelineBlock key={block} step={next()} items={draft.timeline} onChange={(timeline) => update({ timeline })} />;
      case "video":
        return <VideoBlock key={block} step={next()} draft={draft} onChange={update} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-cream via-blush-light to-surface-container font-serif text-on-surface pb-28 lg:pb-12">
      <header className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-sans font-bold text-secondary hover:text-primary">
          <Icon name="arrow_back" className="text-[16px]" />
          K&amp;P Atelier
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-black text-primary sm:text-3xl">Bàn viết thiệp</h1>
        <p className="mt-1 max-w-2xl text-sm font-sans leading-relaxed text-on-surface-variant">
          Chọn một mẫu, điền những điều bạn muốn gửi. Bạn có thể lưu, quay lại sửa tiếp bất cứ lúc nào.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-sans font-bold">
          <span className="rounded-full border border-rose-petal bg-surface-container-low px-3 py-1 font-mono text-primary-container">{product.token}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/90 bg-white/70 px-3 py-1 text-primary">
            <Icon name="diamond" className="text-[14px]" />
            {product.chainName}
          </span>
          <span
            className={`rounded-full border px-3 py-1 ${
              product.status === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {product.status === "completed" ? "Đã có bản lưu" : "Chưa lưu thiệp"}
          </span>
          {dirty && <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">Có thay đổi chưa lưu</span>}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl items-start gap-6 px-4 sm:px-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <TemplatePicker step={next()} value={draft.template} onChange={(template: GiftTemplateId) => update({ template })} />
          <NamesBlock step={next()} draft={draft} onChange={update} errors={errors} />
          {visible.map(renderBlock)}
          <PinBlock step={next()} draft={draft} onChange={update} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:col-span-4">
          <PreviewCard draft={draft} />

          <div className="rounded-3xl border border-white/90 bg-white/80 p-4 shadow-sm">
            {saveError && (
              <div
                ref={saveErrorRef}
                role="alert"
                className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-sans font-bold text-rose-700"
              >
                <Icon name="error" className="mt-0.5 text-[16px]" />
                <span>
                  {saveError}
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
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl liquid-glass-btn-primary px-4 py-3.5 text-sm font-serif font-bold text-white shadow-lg cursor-pointer transition-all disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang lưu thiệp...
                </>
              ) : (
                <>
                  <Icon name="favorite" className="text-[18px] text-amber-300" />
                  Lưu thiệp
                </>
              )}
            </button>
            <p className="mt-2.5 text-center text-[11px] font-sans leading-relaxed text-warm-neutral">
              Người nhận mở thiệp ở trang chủ bằng <strong>mã thiệp</strong> và <strong>OTP xem thiệp</strong>.
            </p>
          </div>
        </aside>
      </main>

      {/* Mobile: keep the save button within reach on a long form */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/90 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl liquid-glass-btn-primary px-4 py-3 text-sm font-serif font-bold text-white shadow-lg cursor-pointer disabled:opacity-60"
        >
          <Icon name="favorite" className="text-[18px] text-amber-300" />
          {saving ? "Đang lưu thiệp..." : "Lưu thiệp"}
        </button>
      </div>
    </div>
  );
}

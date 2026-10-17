"use client";

import React from "react";
import { BLOCK_LABELS, type BlockId } from "../gift-templates/blocks";
import { BlockControlsContext, Icon } from "./ui";

interface Props {
  block: BlockId;
  /** 0-based position among the ticked messages. */
  index: number;
  count: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}

const actionBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl liquid-glass-pill text-slate-600 hover:border-[#721a28]/60 hover:text-[#721a28] shadow-2xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";
const removeBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl liquid-glass-pill border-rose-200 text-rose-700 hover:bg-rose-100/70 shadow-2xs transition-all cursor-pointer";

/**
 * Wraps one studio section with the buttons that order or remove it. The section itself (a
 * StudioSection) picks the buttons up from context, so the message blocks stay unaware of ordering.
 */
export default function BlockFrame({ block, index, count, onMove, onRemove, children }: Props) {
  const label = BLOCK_LABELS[block];
  const controls = (
    <div role="group" aria-label={`Sắp xếp mục ${label}`} className="flex shrink-0 items-center gap-1.5">
      <span className="hidden sm:inline-block text-[11px] font-bold text-slate-500 mr-1 px-2.5 py-1 rounded-full liquid-glass-pill border border-slate-200/80">
        Trang {index + 1}/{count}
      </span>
      <button
        type="button"
        className={actionBtn}
        disabled={index === 0}
        onClick={() => onMove(-1)}
        aria-label={`Chuyển mục ${label} lên trên`}
        title="Chuyển lên trang trước"
      >
        <Icon name="arrow_upward" className="text-[18px]" />
      </button>
      <button
        type="button"
        className={actionBtn}
        disabled={index === count - 1}
        onClick={() => onMove(1)}
        aria-label={`Chuyển mục ${label} xuống dưới`}
        title="Chuyển xuống trang sau"
      >
        <Icon name="arrow_downward" className="text-[18px]" />
      </button>
      <button
        type="button"
        className={removeBtn}
        onClick={onRemove}
        aria-label={`Bỏ mục ${label} khỏi thiệp`}
        title="Bỏ mục này (nội dung đã nhập vẫn được giữ)"
      >
        <Icon name="close" className="text-[18px]" />
      </button>
    </div>
  );

  return (
    <div id={`block-${block}`} className="scroll-mt-4">
      <BlockControlsContext.Provider value={controls}>{children}</BlockControlsContext.Provider>
    </div>
  );
}


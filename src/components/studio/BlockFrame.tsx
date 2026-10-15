"use client";

import React from "react";
import { BLOCK_LABELS, type BlockId } from "../gift-templates/blocks";
import { BlockControlsContext, Icon, ghostButton } from "./ui";

interface Props {
  block: BlockId;
  /** 0-based position among the ticked messages. */
  index: number;
  count: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}

const iconButton = `${ghostButton} inline-flex h-10 min-w-10 items-center justify-center px-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`;

/**
 * Wraps one studio section with the buttons that order or remove it. The section itself (a
 * StudioSection) picks the buttons up from context, so the message blocks stay unaware of ordering.
 */
export default function BlockFrame({ block, index, count, onMove, onRemove, children }: Props) {
  const label = BLOCK_LABELS[block];
  const controls = (
    <div role="group" aria-label={`Sắp xếp mục ${label}`} className="flex shrink-0 items-center gap-1">
      <button type="button" className={iconButton} disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Chuyển mục ${label} lên trên`}>
        <Icon name="arrow_upward" className="text-[18px]" />
      </button>
      <button type="button" className={iconButton} disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`Chuyển mục ${label} xuống dưới`}>
        <Icon name="arrow_downward" className="text-[18px]" />
      </button>
      <button type="button" className={`${iconButton} text-rose-700`} onClick={onRemove} aria-label={`Bỏ mục ${label} khỏi thiệp`} title="Bỏ mục này (nội dung đã nhập vẫn được giữ)">
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

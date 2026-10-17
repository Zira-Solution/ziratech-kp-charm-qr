"use client";

import React, { useState } from "react";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";

interface Props {
  ctx: TemplateContext;
  slides: readonly SlideDef[];
  isArtCanvas?: boolean;
}

export default function StorybookHeader({ ctx, slides, isArtCanvas = false }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentNum = String(ctx.index + 1).padStart(2, "0");
  const totalNum = String(ctx.count).padStart(2, "0");

  return (
    <header className="relative z-30 flex items-center justify-between pb-2 shrink-0 select-none">
      {isArtCanvas ? (
        <span className="font-mono text-xs font-bold text-[#8c4b3e] tracking-widest bg-white/70 px-2.5 py-1 rounded-full shadow-2xs border border-[#ebdccd]">
          {currentNum} / {totalNum}
        </span>
      ) : (
        <span className="font-mono text-xs font-bold text-[#8c4b3e] tracking-widest bg-white/80 px-2.5 py-1 rounded-full shadow-2xs border border-[#ebdccd]">
          {currentNum} / {totalNum}
        </span>
      )}

      {/* Slide Quick Navigation Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Danh sách các trang"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#8c4b3e] shadow-2xs border border-[#ebdccd] hover:bg-white transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl bg-white/95 p-2 shadow-2xl border border-[#ebdccd] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            <p className="px-3 py-1.5 text-[11px] font-bold text-[#8c4b3e] border-b border-stone-100 uppercase tracking-wider">
              Chuyển đến trang
            </p>
            <div className="mt-1 space-y-1 max-h-60 overflow-y-auto">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    ctx.go(idx);
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                    ctx.index === idx
                      ? "bg-[#c13d28] text-white font-bold"
                      : "text-[#2e1d1b] hover:bg-stone-100"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-75">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate flex-1">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

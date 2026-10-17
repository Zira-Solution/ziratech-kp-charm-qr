"use client";

import React, { useState, useEffect, useRef } from "react";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";

interface Props {
  ctx: TemplateContext;
  slides: readonly SlideDef[];
  isArtCanvas?: boolean;
}

export default function StorybookHeader({ ctx, slides, isArtCanvas = false }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("pointerdown", handleOutsideClick);
    return () => window.removeEventListener("pointerdown", handleOutsideClick);
  }, [menuOpen]);

  return (
    <header className="relative z-30 flex items-center justify-between pb-2 shrink-0 select-none">
      {/* Spacer on the left to leave room for the top-left speaker button */}
      <div className="w-9 h-9 shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Liquid Glass Hamburger Menu */}
      <div ref={menuRef} data-storybook-menu className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Danh sách các trang"
          title="Danh sách các trang"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/40 hover:bg-white/60 text-[#4a2c1d] backdrop-blur-xl shadow-[0_4px_16px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.85)] hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.1),inset_0_1px_2px_0_rgba(255,255,255,0.95)] active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform duration-200">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-11 z-50 w-56 sm:w-60 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/70 shadow-[0_20px_50px_rgba(40,20,10,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] p-2.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-[11px] font-bold text-[#6b4226] border-b border-white/40 uppercase tracking-wider flex items-center justify-between">
              <span>Chuyển đến trang</span>
              <span className="text-[10px] font-mono font-medium text-[#8c4b3e]/70">
                {ctx.index + 1}/{slides.length}
              </span>
            </div>
            {/* List with NO scrollbar (all 7 items fit comfortably) */}
            <div className="mt-1.5 space-y-1 overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {slides.map((s, idx) => {
                const isActive = ctx.index === idx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      ctx.go(idx);
                      setMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-linear-to-r from-[#c13d28] to-[#d95338] text-white font-bold shadow-[0_4px_12px_rgba(193,61,40,0.35)] backdrop-blur-md"
                        : "text-[#3d2419] font-medium hover:bg-white/50 hover:backdrop-blur-md hover:text-[#1a0e08]"
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-white/40 text-stone-500"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate flex-1">{s.label}</span>
                    {isActive && (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

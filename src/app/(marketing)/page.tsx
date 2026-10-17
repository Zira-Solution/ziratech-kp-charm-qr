import React from "react";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import HomeHeader from "@/components/home/HomeHeader";
import { Hero, ImpactTicker } from "@/components/home/HeroAndImpact";
import Catalog from "@/components/home/Catalog";
import Keepsake from "@/components/home/Keepsake";
import Workshop from "@/components/home/Workshop";
import Preorder from "@/components/home/Preorder";
import Shelter from "@/components/home/Shelter";
import HomeFooter, { ClosingBanner } from "@/components/home/HomeFooter";

// Both families ship real Vietnamese glyphs; loading them through next/font keeps the diacritics intact.
const headline = Lora({
  variable: "--font-kp-headline",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
const body = Be_Vietnam_Pro({
  variable: "--font-kp-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function MarketingHomePage() {
  return (
    <div className={`${headline.variable} ${body.variable} kp-home relative min-h-screen overflow-x-hidden antialiased selection:bg-tertiary selection:text-primary`}>
      {/* Ambient liquid-glass backdrop */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="kp-blob-1 absolute -top-40 right-[-10%] w-155 h-155 rounded-full bg-linear-to-br from-[#721a28]/14 via-[#e88d83]/22 to-transparent blur-[110px]" />
        <div className="kp-blob-2 absolute top-[12%] -left-36 w-140 h-140 rounded-full bg-linear-to-tr from-[#fea095]/26 via-[#f4c2c2]/35 to-transparent blur-[120px]" />
        <div className="kp-blob-3 absolute top-[36%] -right-40 w-162.5 h-162.5 rounded-full bg-linear-to-bl from-[#721a28]/10 via-[#fea095]/18 to-[#fff0ed]/40 blur-[130px]" />
        <div className="kp-blob-1 absolute top-[58%] -left-32 w-145 h-145 rounded-full bg-linear-to-r from-[#e88d83]/22 via-[#fceae6]/35 to-transparent blur-[120px]" />
        <div className="kp-blob-2 absolute bottom-[8%] right-[-5%] w-170 h-170 rounded-full bg-linear-to-tl from-[#721a28]/12 via-[#e88d83]/20 to-transparent blur-[140px]" />
      </div>

      <div className="relative z-10">
        <HomeHeader />
        <main>
          <Hero />
          <Catalog />
          <Keepsake />
          <Workshop />
          <Preorder />
          <Shelter />
          <ImpactTicker />
        </main>
        <ClosingBanner />
        <HomeFooter />
      </div>
    </div>
  );
}

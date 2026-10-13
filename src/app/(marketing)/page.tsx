"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/features/HeroSection";
import DigitalGiftExperience from "@/components/features/DigitalGiftExperience";
import ShowroomWorkshopHub from "@/components/features/ShowroomWorkshopHub";
import CharityAndFptTimeline from "@/components/features/CharityAndFptTimeline";

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen flex flex-col text-on-surface relative">
      {/* Fixed Navigation Header (Portal Style, Zero Cart) */}
      <Header />

      {/* Main Content Area (4 Mạch Lạc Storytelling Blocks) */}
      <main className="flex-1 w-full pt-30 sm:pt-25 lg:pt-30">
        {/* KHỐI 1: Cổng Mở Thiệp Số 20/10 (Tâm Điểm Trang Chủ) */}
        <HeroSection />

        {/* KHỐI 2: Linh Hồn Thiệp Số Phygital & Trình Diễn 3D */}
        <DigitalGiftExperience />

        {/* KHỐI 3: Nghệ Thuật Chế Tác & Bàn Phối Vòng Charm Trực Quan (Không Bán Hàng) */}
        <ShowroomWorkshopHub />

        {/* KHỐI 4: Ý Nghĩa Cộng Đồng Gây Quỹ & Lịch Trình Tại FPT */}
        <CharityAndFptTimeline />
      </main>

      {/* Footer with legal & transparency notices */}
      <Footer />
    </div>
  );
}

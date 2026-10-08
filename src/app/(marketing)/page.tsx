"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/features/HeroSection";
import DigitalGiftExperience from "@/components/features/DigitalGiftExperience";
import BraceletCustomizer from "@/components/features/BraceletCustomizer";
import RecipientGuide from "@/components/features/RecipientGuide";
import PremadeCollections from "@/components/features/PremadeCollections";
import CharityMissionTracker from "@/components/features/CharityMissionTracker";
import FptFulfillmentTimeline from "@/components/features/FptFulfillmentTimeline";
import PreorderDrawer from "@/components/features/PreorderDrawer";
import OrderLookupModal from "@/components/features/OrderLookupModal";

export default function MarketingHomePage() {
  const [cartItems, setCartItems] = useState<any[]>([
    {
      title: "Vòng Bạc Ý S925 Kèm Thẻ Quà Số",
      price: 55000,
      totalPrice: 55000,
      charityAmount: 29000,
      charms: [
        { name: "Trái Tim Ánh Hồng" },
        { name: "Ngôi Sao Tri Kỷ" },
        { name: "Bàn Chân Cún Cứu Hộ" },
      ],
      message: "Gửi người luôn ở bên mình, 20/10 thật rực rỡ và ấm áp nhé! ❤️",
    },
  ]);

  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  // Handle adding customized bracelet from workshop
  const handleAddCustomizedItem = (item: any) => {
    setCartItems((prev) => [...prev, item]);
    setIsPreorderOpen(true);
  };

  // Handle clicking quick buy on pre-made bundles
  const handleQuickBuy = (collection: any) => {
    const newItem = {
      title: collection.title,
      price: collection.price,
      totalPrice: collection.price,
      charityAmount: collection.charityAmount,
      desc: collection.desc,
      message: "Chúc bạn ngày 20/10 ngập tràn niềm vui và may mắn!",
    };
    setCartItems((prev) => [...prev, newItem]);
    setIsPreorderOpen(true);
  };

  // Handle preset selection from recipient guide
  const handleSelectPreset = (preset: any) => {
    const newItem = {
      title: `Set Quà ${preset.title} (${preset.chainName})`,
      price: preset.price,
      totalPrice: preset.price,
      charityAmount: preset.charityAmount,
      charms: preset.charms.map((name: string) => ({ name })),
      message: preset.defaultMsg,
    };
    setCartItems((prev) => [...prev, newItem]);
    setIsPreorderOpen(true);
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollToCustomizer = () => {
    const el = document.getElementById("customizer-workspace");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-[#221a18] relative">
      {/* Fixed Navigation Header */}
      <Header
        cartCount={cartItems.length}
        onOpenPreorder={() => setIsPreorderOpen(true)}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-28">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Digital Gift Experience (QR Code Phygital Core) */}
        <DigitalGiftExperience />

        {/* 3. Interactive Bracelet Customizer Workshop */}
        <BraceletCustomizer onAddToCart={handleAddCustomizedItem} />

        {/* 4. Personalized Recipient Finder (5 personas) */}
        <RecipientGuide onSelectCombo={handleSelectPreset} />

        {/* 5. Pre-made Collections (49k-69k student price) */}
        <PremadeCollections
          onQuickBuy={handleQuickBuy}
          onCustomize={scrollToCustomizer}
        />

        {/* 6. Charity Mission Tracker (Sân Nhà Nhiều Chó) */}
        <CharityMissionTracker />

        {/* 7. FPT Campus Fulfillment & Scope Timeline */}
        <FptFulfillmentTimeline />
      </main>

      {/* Pre-order Drawer Modal */}
      <PreorderDrawer
        isOpen={isPreorderOpen}
        onClose={() => setIsPreorderOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onOrderSuccess={(order) => {
          console.log("Order saved:", order);
        }}
      />

      {/* Order Status Lookup Modal */}
      <OrderLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
      />

      {/* Floating Quick Route Switcher to test new features from folder K&P */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 liquid-glass-pill px-3 py-1.5 rounded-full shadow-2xl border border-white/80 text-[11px]">
        <a
          href="/compose"
          className="px-3 py-1 rounded-full liquid-glass-btn-primary text-white flex items-center gap-1 font-medium shadow-xs"
        >
          <span className="material-symbols-outlined text-[13px]">smartphone</span>
          Mobile App
        </a>
        <a
          href="/g/demo-token"
          className="px-3 py-1 rounded-full liquid-glass-btn-secondary text-[#540114] flex items-center gap-1 font-medium shadow-xs border border-white/80"
        >
          <span className="material-symbols-outlined text-[13px] text-[#540114]">favorite</span>
          Mở Quà (/g)
        </a>
      </div>

      {/* Footer with legal, digital lifecycle, and transparency notices */}
      <Footer />

    </div>
  );
}

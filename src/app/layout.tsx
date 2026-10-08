import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "K&P Atelier — Vòng Tay Charm & Quà Tặng Số 20/10 | Gây Quỹ Sân Nhà Nhiều Chó",
  description:
    "Trải nghiệm quà tặng Phygital 20/10 độc quyền tại ĐH FPT. Mỗi chiếc vòng tay charm đi kèm thẻ QR mở trang quà số cá nhân hóa. Mỗi món quà bạn gửi gắm là bạn đã cùng chung tay góp vào những bữa ăn no cho các bé tại trạm cứu hộ Sân Nhà Nhiều Chó.",
  keywords: [
    "K&P Atelier",
    "quà tặng 20/10",
    "vòng tay charm",
    "thẻ QR quà số",
    "Sân Nhà Nhiều Chó",
    "Đại học FPT",
    "quà tặng sinh viên",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${plusJakarta.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;600;700&family=Patrick+Hand&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Abril+Fatface&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap&subset=vietnamese"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#fff6f7] text-[#221a18] relative overflow-x-hidden selection:bg-[#fea095]/40 selection:text-[#540114]">
        {/* Ambient Floating Liquid Mesh Lights */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-gradient-to-tr from-[#ffdad6]/70 via-[#fea095]/50 to-[#ffd1d9]/60 blur-[100px] animate-liquid-float-slow" />
          <div className="absolute top-40 -right-24 w-[38rem] h-[38rem] rounded-full bg-gradient-to-bl from-[#fed7aa]/50 via-[#ffd6dc]/60 to-[#ffe4e6]/70 blur-[110px] animate-liquid-float-fast" />
          <div className="absolute top-[65vh] -left-20 w-[32rem] h-[32rem] rounded-full bg-gradient-to-r from-[#ffd3cb]/60 via-[#ffdad6]/50 to-[#fceae6]/60 blur-[95px] animate-liquid-float-slow" />
          <div className="absolute -bottom-20 right-10 w-[42rem] h-[42rem] rounded-full bg-gradient-to-tl from-[#fed7aa]/45 via-[#ffe3ea]/60 to-[#ffccd4]/50 blur-[120px] animate-liquid-float-fast" />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}


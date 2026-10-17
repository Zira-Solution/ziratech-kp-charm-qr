import type { Metadata } from "next";
import { Be_Vietnam_Pro, Merriweather } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "K&P Atelier — Vòng Tay Charm & Quà Tặng Số 20/10 | Gây Quỹ Sân Nhà Nhiều Chó",
  description:
    "Trải nghiệm quà tặng Phygital 20/10 độc quyền tại ĐH FPT TP.HCM. Mỗi chiếc vòng tay charm có mã QR gửi qua email để mở trang quà số cá nhân hóa. Lợi nhuận của dự án được dành ủng hộ trạm cứu hộ Sân Nhà Nhiều Chó.",
  keywords: [
    "K&P Atelier",
    "quà tặng 20/10",
    "vòng tay charm",
    "thẻ QR quà số",
    "Sân Nhà Nhiều Chó",
    "Đại học FPT TP.HCM",
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
      className={`${beVietnam.variable} ${merriweather.variable} ${beVietnam.className} h-full antialiased scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;600;700&family=Patrick+Hand&family=Abril+Fatface&display=swap&subset=vietnamese"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-brand-bg text-on-surface relative overflow-x-hidden selection:bg-secondary-container/40 selection:text-primary">
        {/* Ambient Floating Liquid Mesh Lights with Iridescent Shimmer */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-2xl h-168 rounded-full bg-linear-to-tr from-secondary-fixed/80 via-secondary-container/60 to-rose-petal blur-[120px] animate-liquid-float-slow" />
          <div className="absolute top-32 -right-32 w-176 h-176 rounded-full bg-linear-to-bl from-amber-200/50 via-rose-petal/70 to-rose-100/70 blur-[130px] animate-liquid-float-fast" />
          <div className="absolute top-[60vh] -left-28 w-152 h-152 rounded-full bg-linear-to-r from-rose-petal/60 via-secondary-fixed/60 to-surface-container/70 blur-[110px] animate-liquid-float-slow" />
          <div className="absolute -bottom-28 right-0 w-3xl h-192 rounded-full bg-linear-to-tl from-amber-200/40 via-rose-100/60 to-rose-petal/60 blur-[140px] animate-liquid-float-fast" />
          <div className="absolute top-1/2 left-1/3 w-104 h-104 rounded-full bg-linear-to-r from-white/40 to-rose-50/50 blur-[90px] animate-liquid-pulse" />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}



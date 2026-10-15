import type { Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";

// The writing desk is always light: a white page, no dark mode. This also tells browsers that offer an
// automatic dark mode not to recolour it. Source: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-viewport.md
export const viewport: Viewport = { colorScheme: "light" };

// Be Vietnam Pro was drawn for Vietnamese: its diacritics stay clear at small sizes.
const studioFont = Be_Vietnam_Pro({
  variable: "--font-studio",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function CreateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${studioFont.variable} studio-light flex-1`}>{children}</div>;
}

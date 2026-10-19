import type { Metadata, Viewport } from "next";
import { Literata, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";

const kannada = Noto_Sans_Kannada({
  subsets: ["latin", "kannada"],
  weight: ["400", "600", "700"],
  variable: "--font-kannada",
  display: "swap",
});

const display = Literata({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Odu, Kannada document reader",
  description:
    "Turn a photo of a Kannada notice, letter, or land record into text you can edit, hear, and search.",
};

export const viewport: Viewport = {
  themeColor: "#efe6d4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${kannada.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

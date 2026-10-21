import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Save Berna's Teenage Years! 🎀 Berna's 20th Birthday",
  description: "An emergency rescue mission to save Berna's teenage years before she turns 20 on October 22, 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#150926",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full min-h-dvh flex flex-col bg-[#150926] text-[#f4e8ff] selection:bg-[#ff70a6] selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}

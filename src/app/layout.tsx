import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthRefresh from "@/components/AuthRefresh";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "인천일보아카데미 | 강의사이트",
  description: "강의 자료, 질문게시판, 실시간 공지 채팅",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-violet-300/40 blur-[130px]" />
          <div className="absolute -right-40 top-1/4 h-[420px] w-[420px] rounded-full bg-sky-300/40 blur-[130px]" />
          <div className="absolute bottom-0 left-1/2 h-[320px] w-[640px] -translate-x-1/2 rounded-full bg-fuchsia-200/40 blur-[130px]" />
        </div>

        <div className="relative flex min-h-full flex-col">
          <AuthRefresh />
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200/80 py-8 text-center text-sm text-slate-400">
            인천일보아카데미 · 강의 자료 &amp; 질문게시판
          </footer>
        </div>
      </body>
    </html>
  );
}

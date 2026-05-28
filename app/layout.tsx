import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "StockPilot AI｜AI 台股觀察員",
  description: "台股交易觀察與分析輔助工具，整合技術面、籌碼面、基本面與 AI 分析。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>
        <div className="grid-bg min-h-screen">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}

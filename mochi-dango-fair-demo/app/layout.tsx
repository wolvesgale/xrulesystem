import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./fullcalendar.css";

export const metadata: Metadata = {
  title: "Xrule | 催事販売管理",
  description: "催事販売のスケジュール管理デモアプリケーション"
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
            <div className="text-lg font-semibold tracking-wide">Xrule | 催事販売管理</div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}

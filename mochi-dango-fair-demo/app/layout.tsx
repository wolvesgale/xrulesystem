import type { Metadata } from "next";
import Link from "next/link";
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
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="text-lg font-semibold tracking-wide">Xrule | 催事販売管理</div>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link
                href="/login"
                className="rounded-md border border-slate-700 px-3 py-1.5 transition hover:border-slate-500 hover:bg-slate-800"
              >
                ログイン
              </Link>
              <Link
                href="/admin"
                className="rounded-md border border-slate-700 px-3 py-1.5 transition hover:border-slate-500 hover:bg-slate-800"
              >
                管理者ビュー
              </Link>
              <Link
                href="/agent"
                className="rounded-md border border-slate-700 px-3 py-1.5 transition hover:border-slate-500 hover:bg-slate-800"
              >
                代理店ビュー
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}

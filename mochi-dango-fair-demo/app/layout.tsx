import type { Metadata } from "next";
import type { ReactNode, CSSProperties } from "react";
import "./globals.css";
import "./fullcalendar.css";
import { getActiveTenantTheme } from "@/lib/tenantTheme";
import { getSessionUserFromCookies } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Xrule | 催事販売管理",
  description: "催事販売のスケジュール管理デモアプリケーション"
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const theme = await getActiveTenantTheme();
  const session = getSessionUserFromCookies();
  return (
    <html lang="ja">
      <body
        className="min-h-screen"
        style={
          {
            "--tenant-primary": theme.primaryColor,
            "--tenant-accent": theme.accentColor
          } as CSSProperties
        }
      >
        <header
          className="border-b border-slate-800 backdrop-blur"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 text-lg font-semibold tracking-wide">
              {theme.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={theme.logoUrl} alt={theme.siteTitle} className="h-7 w-auto" />
              )}
              <span>{theme.siteTitle}</span>
            </div>
            <LogoutButton isVisible={Boolean(session)} />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}

// Session cookie utilities for simple role-based access control.
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export type SessionUser = {
  loginId: string;
  displayName: string;
  role: "admin" | "agent";
  agencyId: string | null;
};

const SESSION_COOKIE_NAME = "xr_session";

// Cookie からセッション情報を取得
export function getSessionUserFromCookies(): SessionUser | null {
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (
      (parsed.role === "admin" || parsed.role === "agent") &&
      typeof parsed.loginId === "string" &&
      typeof parsed.displayName === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

// API Route から呼べるラッパ
export function getSessionUserFromRequest(_req: NextRequest): SessionUser | null {
  // Next.js App Router 環境では cookies() から取得する形で十分
  return getSessionUserFromCookies();
}

// セッションをセットするヘルパ
export function setSessionUser(user: SessionUser) {
  cookies().set(SESSION_COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

// セッション削除ヘルパ
export function clearSessionUser() {
  cookies().delete(SESSION_COOKIE_NAME);
}

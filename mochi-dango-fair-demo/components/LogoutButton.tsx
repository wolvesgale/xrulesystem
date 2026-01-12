"use client";

import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  isVisible: boolean;
};

// Client button to clear session and return to login.
export function LogoutButton({ isVisible }: LogoutButtonProps) {
  const router = useRouter();

  if (!isVisible) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error(error);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-500"
    >
      ログアウト
    </button>
  );
}

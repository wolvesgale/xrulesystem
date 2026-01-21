"use client";

import { FormEvent, useState } from "react";

// Handles login form UI and submission.
export function LoginForm() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password })
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "ログインに失敗しました");
        return;
      }
      const data = (await response.json()) as { role: "admin" | "agent" | "super_admin" };
      if (data.role === "admin" || data.role === "super_admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/agent";
      }
    } catch (err) {
      console.error(err);
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">ログイン</h1>
        <p className="text-sm text-slate-300">Xrule アカウントでサインインしてください。</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm text-slate-200">
          <span>ID</span>
          <input
            value={id}
            onChange={(event) => setId(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            required
          />
        </label>
        <label className="block space-y-1 text-sm text-slate-200">
          <span>パスワード</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            required
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "認証中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}

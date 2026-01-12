"use client";

import { useEffect, useState } from "react";
import type { AgencyRecord } from "@/lib/types";

type AgencyModalMode = "create" | "edit";

type AgencyModalProps = {
  mode: AgencyModalMode;
  initialAgency?: AgencyRecord;
  onClose: () => void;
  onSaved: (agency: AgencyRecord) => void;
};

// Modal for creating or editing agency accounts.
function AgencyModal({ mode, initialAgency, onClose, onSaved }: AgencyModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [agentName, setAgentName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialAgency) {
      setName(initialAgency.name);
      setColor(initialAgency.color ?? "");
      setAgentName(initialAgency.agentUser?.name ?? "");
      setLoginId(initialAgency.agentUser?.loginId ?? "");
      setPassword("");
    } else {
      setName("");
      setColor("");
      setAgentName("");
      setLoginId("");
      setPassword("");
    }
  }, [initialAgency]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        name,
        color,
        agentName,
        loginId,
        password,
        agentUserId: initialAgency?.agentUser?.id
      };

      const response = await fetch(
        mode === "create" ? "/api/agencies" : `/api/agencies/${initialAgency?.id ?? ""}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "保存に失敗しました");
        return;
      }

      const data = (await response.json()) as AgencyRecord;
      onSaved(data);
    } catch (err) {
      console.error(err);
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const isCreate = mode === "create";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{isCreate ? "代理店を新規作成" : "代理店情報を編集"}</h3>
            <p className="text-sm text-slate-400">ログインアカウントと担当者情報を管理します。</p>
          </div>
          <button className="text-slate-400 hover:text-white" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-200">
            代理店名
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            カラー設定
            <input
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
              placeholder="#38bdf8"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            担当者名
            <input
              value={agentName}
              onChange={(event) => setAgentName(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            ログイン ID
            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200 md:col-span-2">
            {isCreate ? "初期パスワード" : "パスワード再発行（任意）"}
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
              placeholder={isCreate ? "初期パスワードを入力" : "入力するとパスワードを更新"}
            />
          </label>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-500"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || name.trim() === "" || loginId.trim() === "" || (isCreate && password.trim() === "")}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin widget for listing and managing agency accounts.
export function AgencyManager() {
  const [agencies, setAgencies] = useState<AgencyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState<AgencyModalMode | null>(null);
  const [editingAgency, setEditingAgency] = useState<AgencyRecord | undefined>(undefined);

  const fetchAgencies = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/agencies");
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "取得に失敗しました");
        return;
      }
      const data = (await response.json()) as AgencyRecord[];
      setAgencies(data);
    } catch (err) {
      console.error(err);
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleSaved = (agency: AgencyRecord) => {
    setModalMode(null);
    setEditingAgency(undefined);
    setAgencies((prev) => {
      const index = prev.findIndex((item) => item.id === agency.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = agency;
        return next;
      }
      return [agency, ...prev];
    });
  };

  const handleDelete = async (agencyId: string) => {
    if (!window.confirm("代理店を削除しますか？関連するアカウントも削除されます。")) {
      return;
    }
    try {
      const response = await fetch(`/api/agencies/${agencyId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "削除に失敗しました");
        return;
      }
      setAgencies((prev) => prev.filter((item) => item.id !== agencyId));
    } catch (err) {
      console.error(err);
      setError("通信エラーが発生しました");
    }
  };

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">代理店アカウント管理</h2>
          <p className="text-xs text-slate-400">代理店のログイン情報と担当者を管理します。</p>
        </div>
        <button
          onClick={() => {
            setModalMode("create");
            setEditingAgency(undefined);
          }}
          className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
        >
          新規追加
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        {loading && <span>読込中...</span>}
        {error && <span className="text-red-400">{error}</span>}
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
          <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-4 py-2 text-left">代理店名</th>
              <th className="px-4 py-2 text-left">担当者</th>
              <th className="px-4 py-2 text-left">ログインID</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {agencies.map((agency) => (
              <tr key={agency.id} className="hover:bg-slate-800/60">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded"
                      style={{ backgroundColor: agency.color ?? "#64748b" }}
                      aria-hidden
                    />
                    {agency.name}
                  </div>
                </td>
                <td className="px-4 py-2">{agency.agentUser?.name ?? "-"}</td>
                <td className="px-4 py-2">{agency.agentUser?.loginId ?? "-"}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setModalMode("edit");
                        setEditingAgency(agency);
                      }}
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-slate-500"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(agency.id)}
                      className="rounded-md border border-red-500/60 px-2 py-1 text-xs text-red-300 hover:border-red-400"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {agencies.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center text-slate-400">
                  代理店が登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalMode && (
        <AgencyModal
          mode={modalMode}
          initialAgency={modalMode === "edit" ? editingAgency : undefined}
          onClose={() => setModalMode(null)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}

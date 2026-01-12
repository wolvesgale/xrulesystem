"use client";

import { useEffect, useMemo, useState } from "react";
import type { VenueRecord } from "@/lib/types";
import { VenueModal, type VenueModalMode } from "./VenueModal";

type VenueManagerProps = {
  canEdit: boolean;
  title?: string;
};

// Aggregates venue search UI, table display, and edit modal handling.
export function VenueManager({ canEdit, title }: VenueManagerProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [keyword, setKeyword] = useState("");
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState<VenueModalMode | null>(null);
  const [editingVenue, setEditingVenue] = useState<VenueRecord | undefined>(undefined);

  const heading = title ?? "催事場情報";

  const fetchVenues = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (name) params.set("name", name);
      if (address) params.set("address", address);
      if (keyword) params.set("q", keyword);
      const response = await fetch(`/api/venues?${params.toString()}`);
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "取得に失敗しました");
        return;
      }
      const list = (await response.json()) as VenueRecord[];
      setVenues(list);
    } catch (err) {
      console.error(err);
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    if (!canEdit) return;
    setModalMode("create");
    setEditingVenue(undefined);
  };

  const openEditModal = (venue: VenueRecord) => {
    setModalMode("edit");
    setEditingVenue(venue);
  };

  const handleSaved = (venue: VenueRecord) => {
    setModalMode(null);
    setEditingVenue(undefined);
    setVenues((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === venue.id);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = venue;
        return next;
      }
      return [venue, ...prev];
    });
  };

  const handleDeleted = (id: string) => {
    setModalMode(null);
    setEditingVenue(undefined);
    setVenues((prev) => prev.filter((venue) => venue.id !== id));
  };

  const filteredVenues = useMemo(() => venues, [venues]);

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p className="text-sm text-slate-400">開催場所のルールや資料リンクを管理します。</p>
        </div>
        {canEdit && (
          <button
            onClick={openCreateModal}
            className="rounded-md bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            新規登録
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-xs text-slate-200">
          開催場所名
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
            placeholder="例: Xrule百貨店 催事場"
          />
        </label>
        <label className="space-y-1 text-xs text-slate-200">
          住所・エリア
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
            placeholder="例: 東京都千代田区1-1"
          />
        </label>
        <label className="space-y-1 text-xs text-slate-200">
          フリーワード
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
            placeholder="裏方ルール・メモなど"
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={fetchVenues}
          className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
        >
          検索
        </button>
        {loading && <span className="text-xs text-slate-400">読込中...</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
          <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-4 py-2 text-left">開催場所</th>
              <th className="px-4 py-2 text-left">住所・エリア</th>
              <th className="px-4 py-2 text-left">裏方ルール</th>
              <th className="px-4 py-2 text-left">資料リンク</th>
              <th className="px-4 py-2 text-left">最終更新</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredVenues.map((venue) => (
              <tr
                key={venue.id}
                className={canEdit ? "cursor-pointer hover:bg-slate-800/60" : "hover:bg-slate-800/40"}
                onClick={() => (canEdit ? openEditModal(venue) : setEditingVenue(venue))}
              >
                <td className="px-4 py-2">{venue.name}</td>
                <td className="px-4 py-2">{venue.address ?? "-"}</td>
                <td className="px-4 py-2">{venue.rules ?? "-"}</td>
                <td className="px-4 py-2">
                  {venue.referenceUrl ? (
                    <a href={venue.referenceUrl} target="_blank" rel="noreferrer" className="text-slate-200 underline">
                      開く
                    </a>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="px-4 py-2 text-xs text-slate-400">
                  {venue.updatedAt ? new Date(venue.updatedAt).toLocaleString("ja-JP") : ""}
                </td>
              </tr>
            ))}
            {filteredVenues.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center text-slate-400">
                  該当する催事場はありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalMode && (
        <VenueModal
          mode={modalMode}
          initialVenue={modalMode === "edit" ? editingVenue : undefined}
          onClose={() => setModalMode(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
      {!modalMode && editingVenue && !canEdit && (
        <VenueModal
          mode="view"
          initialVenue={editingVenue}
          readOnly
          onClose={() => setEditingVenue(undefined)}
        />
      )}
    </section>
  );
}

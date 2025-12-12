"use client";

import { useEffect, useMemo, useState } from "react";
import type { Venue } from "@/lib/googleSheets";
import { VenueModal, type VenueModalMode } from "./VenueModal";

type VenueManagerProps = {
  canEditAgencyId: boolean;
  fixedAgencyId?: string | null;
  title?: string;
};

// Aggregates venue search UI, table display, and edit modal handling.
export function VenueManager({ canEditAgencyId, fixedAgencyId, title }: VenueManagerProps) {
  const [storeName, setStoreName] = useState("");
  const [floorName, setFloorName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState<VenueModalMode | null>(null);
  const [editingVenue, setEditingVenue] = useState<Venue | undefined>(undefined);

  const heading = title ?? "催事場情報";

  const fetchVenues = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (storeName) params.set("storeName", storeName);
      if (floorName) params.set("floorName", floorName);
      if (keyword) params.set("q", keyword);
      const response = await fetch(`/api/venues?${params.toString()}`);
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "取得に失敗しました");
        return;
      }
      const list = (await response.json()) as Venue[];
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
    setModalMode("create");
    setEditingVenue(undefined);
  };

  const openEditModal = (venue: Venue) => {
    setModalMode("edit");
    setEditingVenue(venue);
  };

  const handleSaved = (venue: Venue) => {
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

  const filteredVenues = useMemo(() => {
    if (!fixedAgencyId || canEditAgencyId) return venues;
    return venues.filter((venue) => venue.agencyId === fixedAgencyId);
  }, [venues, fixedAgencyId, canEditAgencyId]);

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p className="text-sm text-slate-400">催事場情報の検索・登録・更新を行えます。</p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-md bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
        >
          新規登録
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-xs text-slate-200">
          店舗名
          <input
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
            placeholder="例: Xrule百貨店"
          />
        </label>
        <label className="space-y-1 text-xs text-slate-200">
          フロア名
          <input
            value={floorName}
            onChange={(event) => setFloorName(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
            placeholder="例: 本館1F"
          />
        </label>
        <label className="space-y-1 text-xs text-slate-200">
          フリーワード
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
            placeholder="場所詳細・メモなど"
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
              <th className="px-4 py-2 text-left">店舗名</th>
              <th className="px-4 py-2 text-left">フロア名</th>
              <th className="px-4 py-2 text-left">場所詳細</th>
              <th className="px-4 py-2 text-left">SV名</th>
              <th className="px-4 py-2 text-left">写真リンク</th>
              <th className="px-4 py-2 text-left">最終更新</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredVenues.map((venue) => (
              <tr
                key={venue.id}
                className="cursor-pointer hover:bg-slate-800/60"
                onClick={() => openEditModal(venue)}
              >
                <td className="px-4 py-2">{venue.storeName}</td>
                <td className="px-4 py-2">{venue.floorName}</td>
                <td className="px-4 py-2">{venue.placeDetail}</td>
                <td className="px-4 py-2">{venue.svName}</td>
                <td className="px-4 py-2">
                  {venue.photoUrl ? (
                    <a href={venue.photoUrl} target="_blank" rel="noreferrer" className="text-slate-200 underline">
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
                <td colSpan={6} className="px-4 py-3 text-center text-slate-400">
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
          canEditAgencyId={canEditAgencyId}
          defaultAgencyId={fixedAgencyId}
          onClose={() => setModalMode(null)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}

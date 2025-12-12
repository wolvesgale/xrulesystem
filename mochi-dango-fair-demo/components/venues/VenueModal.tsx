"use client";

import { useEffect, useMemo, useState } from "react";
import type { Venue } from "@/lib/googleSheets";

export type VenueModalMode = "create" | "edit";

type VenueModalProps = {
  mode: VenueModalMode;
  initialVenue?: Venue;
  canEditAgencyId: boolean;
  defaultAgencyId?: string | null;
  onClose: () => void;
  onSaved: (venue: Venue) => void;
};

// Modal for creating or editing venue records.
export function VenueModal({
  mode,
  initialVenue,
  canEditAgencyId,
  defaultAgencyId,
  onClose,
  onSaved
}: VenueModalProps) {
  const [storeName, setStoreName] = useState("");
  const [floorName, setFloorName] = useState("");
  const [placeDetail, setPlaceDetail] = useState("");
  const [svName, setSvName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [agencyId, setAgencyId] = useState<string>(defaultAgencyId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialVenue) {
      setStoreName(initialVenue.storeName);
      setFloorName(initialVenue.floorName);
      setPlaceDetail(initialVenue.placeDetail);
      setSvName(initialVenue.svName);
      setPhotoUrl(initialVenue.photoUrl);
      setMemo(initialVenue.memo);
      setAgencyId(initialVenue.agencyId);
    } else {
      setStoreName("");
      setFloorName("");
      setPlaceDetail("");
      setSvName("");
      setPhotoUrl("");
      setMemo("");
      setAgencyId(defaultAgencyId ?? "");
    }
  }, [initialVenue, defaultAgencyId]);

  const heading = useMemo(() => (mode === "create" ? "催事場を新規登録" : "催事場情報を編集"), [mode]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload: Record<string, string> = {
        storeName,
        floorName,
        placeDetail,
        svName,
        photoUrl,
        memo
      };
      if (canEditAgencyId) {
        payload.agencyId = agencyId;
      }

      const url = mode === "create" ? "/api/venues" : `/api/venues/${initialVenue?.id ?? ""}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "保存に失敗しました");
        return;
      }
      const venue = (await response.json()) as Venue;
      onSaved(venue);
    } catch (err) {
      console.error(err);
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{heading}</h3>
            <p className="text-sm text-slate-400">SV 情報や場所の詳細を入力してください。</p>
          </div>
          <button className="text-slate-400 hover:text-white" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-200">
            店舗名
            <input
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            フロア名
            <input
              value={floorName}
              onChange={(event) => setFloorName(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200 md:col-span-2">
            場所の詳細
            <input
              value={placeDetail}
              onChange={(event) => setPlaceDetail(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            SV 名
            <input
              value={svName}
              onChange={(event) => setSvName(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            フロア写真 URL
            <input
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200 md:col-span-2">
            メモ
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
              rows={3}
            />
          </label>
          {canEditAgencyId && (
            <label className="space-y-1 text-sm text-slate-200 md:col-span-2">
              代理店 ID
              <input
                value={agencyId}
                onChange={(event) => setAgencyId(event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
                placeholder="agency-123 など"
              />
            </label>
          )}
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
            disabled={loading || (canEditAgencyId && agencyId.trim() === "")}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}
